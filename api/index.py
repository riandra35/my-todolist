import os
import requests
import uuid
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Memuat variabel dari file .env (hanya untuk di lokal)
load_dotenv()

# Konfigurasi Flask (Penting untuk Vercel agar bisa menemukan folder HTML dan CSS)
app = Flask(__name__, template_folder='../templates', static_folder='../static')

# Konfigurasi JSONBin
JSONBIN_BIN_ID = os.getenv('JSONBIN_BIN_ID')
JSONBIN_API_KEY = os.getenv('JSONBIN_API_KEY')
JSONBIN_URL = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"

HEADERS = {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_API_KEY
}

# Fungsi bantuan untuk mengambil data dari JSONBin
def get_todos():
    try:
        response = requests.get(JSONBIN_URL, headers=HEADERS)
        if response.status_code == 200:
            return response.json().get('record', [])
        return []
    except Exception:
        return []

# Fungsi bantuan untuk menyimpan data ke JSONBin
def save_todos(todos):
    requests.put(JSONBIN_URL, headers=HEADERS, json=todos)

# Halaman Utama
@app.route('/')
def index():
    return render_template('index.html')

# API untuk MENGAMBIL semua tugas
@app.route('/api/todos', methods=['GET'])
def fetch_todos():
    todos = get_todos()
    return jsonify(todos)

# API untuk MENAMBAH tugas baru
@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.json
    todos = get_todos()
    
    new_todo = {
        'id': str(uuid.uuid4()), # Membuat ID unik acak
        'text': data.get('text'),
        'priority': data.get('priority', 'Rendah'),
        'completed': False
    }
    
    todos.append(new_todo)
    save_todos(todos)
    return jsonify(new_todo), 201

# API untuk MENGUBAH status tugas (Selesai/Belum)
@app.route('/api/todos/<todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todos = get_todos()
    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed'] # Balik statusnya
            break
    save_todos(todos)
    return jsonify({'message': 'Status diperbarui'})

# API untuk MENGHAPUS tugas
@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todos = get_todos()
    # Filter array untuk membuang tugas dengan ID yang dipilih
    todos = [t for t in todos if t['id'] != todo_id]
    save_todos(todos)
    return jsonify({'message': 'Tugas dihapus'})
