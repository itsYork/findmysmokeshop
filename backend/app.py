import os
import sqlite3
from pathlib import Path

import requests
from flask import Flask, request, session, jsonify, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Replace this with a secure random value in production
app.config['SECRET_KEY'] = 'change-me'
CORS(app, supports_credentials=True)

DB_PATH = Path(__file__).with_name('app.db')
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                subscription TEXT DEFAULT '',
                approved INTEGER DEFAULT 0
            )
        """
        )
        try:
            conn.execute('ALTER TABLE users ADD COLUMN approved INTEGER DEFAULT 0')
        except sqlite3.OperationalError:
            pass

init_db()

@app.post('/api/register')
def register():
    data = request.get_json(force=True)
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    pw_hash = generate_password_hash(password)
    try:
        with get_db() as conn:
            conn.execute(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                (email, pw_hash),
            )
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 409
    return jsonify({'message': 'Registered successfully'}), 201

@app.post('/api/login')
def login():
    data = request.get_json(force=True)
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    with get_db() as conn:
        cur = conn.execute('SELECT id, password_hash, approved FROM users WHERE email=?', (email,))
        row = cur.fetchone()
        if row and check_password_hash(row['password_hash'], password):
            if not row['approved']:
                return jsonify({'error': 'Account pending approval'}), 403
            session['user_id'] = row['id']
            return jsonify({'message': 'Logged in'})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.post('/api/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.get('/api/me')
def me():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not logged in'}), 401
    with get_db() as conn:
        cur = conn.execute('SELECT email, subscription, approved FROM users WHERE id=?', (uid,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'email': row['email'], 'subscription': row['subscription'], 'approved': bool(row['approved'])})

@app.post('/api/subscribe')
def subscribe():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not logged in'}), 401
    status = request.get_json(force=True).get('status', '').strip()
    with get_db() as conn:
        conn.execute('UPDATE users SET subscription=? WHERE id=?', (status, uid))
    return jsonify({'message': 'Subscription updated'})


@app.get('/api/stores')
def stores():
    if not GOOGLE_MAPS_API_KEY:
        return jsonify({'error': 'API key not configured'}), 500
    near = request.args.get('near')
    ll = request.args.get('ll')
    params = {'key': GOOGLE_MAPS_API_KEY}
    if near:
        url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
        params['query'] = f'smoke shop in {near}'
    elif ll:
        url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        params['location'] = ll
        params['radius'] = '10000'
        params['keyword'] = 'smoke shop'
    else:
        return jsonify([])
    if request.args.get('open'):
        params['opennow'] = 'true'
    r = requests.get(url, params=params, timeout=5)
    data = r.json()
    results = []
    for item in data.get('results', []):
        loc = item.get('geometry', {}).get('location', {})
        results.append({
            'place_id': item.get('place_id'),
            'name': item.get('name'),
            'address': item.get('formatted_address') or item.get('vicinity'),
            'lat': loc.get('lat'),
            'lng': loc.get('lng')
        })
    return jsonify(results)


@app.get('/api/static-map')
def static_map():
    if not GOOGLE_MAPS_API_KEY:
        return jsonify({'error': 'API key not configured'}), 500
    markers = request.args.getlist('marker')
    if not markers:
        return jsonify({'error': 'No markers'}), 400
    params = [('size', '640x400'), ('key', GOOGLE_MAPS_API_KEY)]
    for m in markers:
        params.append(('markers', m))
    r = requests.get('https://maps.googleapis.com/maps/api/staticmap', params=params, timeout=5)
    return Response(r.content, content_type=r.headers.get('Content-Type', 'image/png'))

if __name__ == '__main__':
    app.run()
