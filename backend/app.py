from flask import Flask, request, session, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from pathlib import Path

app = Flask(__name__)
# Replace this with a secure random value in production
app.config['SECRET_KEY'] = 'change-me'
CORS(app, supports_credentials=True)

DB_PATH = Path(__file__).with_name('app.db')

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
                subscription TEXT DEFAULT ''
            )
            """
        )

init_db()

@app.post('/register')
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

@app.post('/login')
def login():
    data = request.get_json(force=True)
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    with get_db() as conn:
        cur = conn.execute('SELECT id, password_hash FROM users WHERE email=?', (email,))
        row = cur.fetchone()
        if row and check_password_hash(row['password_hash'], password):
            session['user_id'] = row['id']
            return jsonify({'message': 'Logged in'})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.post('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.get('/me')
def me():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not logged in'}), 401
    with get_db() as conn:
        cur = conn.execute('SELECT email, subscription FROM users WHERE id=?', (uid,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'email': row['email'], 'subscription': row['subscription']})

@app.post('/subscribe')
def subscribe():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not logged in'}), 401
    status = request.get_json(force=True).get('status', '').strip()
    with get_db() as conn:
        conn.execute('UPDATE users SET subscription=? WHERE id=?', (status, uid))
    return jsonify({'message': 'Subscription updated'})

if __name__ == '__main__':
    app.run()
