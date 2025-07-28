import sqlite3
import os
import requests
from flask import Flask, request, jsonify, session, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'change-this-secret-key'
CORS(app, supports_credentials=True)

DATABASE = 'app.db'
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL
    )''')
    conn.commit()
    conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'user')
    if not email or not password:
        return jsonify({'error': 'Missing fields'}), 400
    hashed = generate_password_hash(password)
    try:
        conn = get_db()
        conn.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                     (email, hashed, role))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 400
    finally:
        conn.close()
    return jsonify({'message': 'Registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    conn = get_db()
    cur = conn.execute('SELECT * FROM users WHERE email=?', (email,))
    user = cur.fetchone()
    conn.close()
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        session['role'] = user['role']
        return jsonify({'message': 'Logged in'})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'Email required'}), 400
    try:
        conn = get_db()
        conn.execute('INSERT INTO subscriptions (email) VALUES (?)', (email,))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already subscribed'}), 400
    finally:
        conn.close()
    return jsonify({'message': 'Subscribed successfully'})

@app.route('/api/stores')
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

@app.route('/api/static-map')
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
    init_db()
    app.run(debug=True)
