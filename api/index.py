import os
import requests
import uuid
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, template_folder='../templates', static_folder='../static')

JSONBIN_BIN_ID = os.getenv('JSONBIN_BIN_ID')
JSONBIN_API_KEY = os.getenv('JSONBIN_API_KEY')
JSONBIN_URL = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"

HEADERS = {
    'Content-Type': 'application/json',
    'X-Master-Key': JSONBIN_API_KEY
}

def get_todos():
    try:
        response = requests.get(JSONBIN_URL, headers=HEADERS)
        if response.status_code == 200:
            return response.json().get('record', [])
        return []
    except Exception:
        return []

def save_todos(todos):
    requests.put(JSONBIN_URL, headers=HEADERS, json=todos)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/todos', methods=['GET'])
def fetch_todos():
    return jsonify(get_todos())

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.json
    todos = get_todos()
    
    new_todo = {
        'id': str(uuid.uuid4()),
        'title': data.get('title'),
        'description': data.get('description'),
        'pic': data.get('pic'),
        'start_date': data.get('start_date'),
        'deadline': data.get('deadline'),
        'status': data.get('status', 'new') # new, in_progress, pending, complete
    }
    
    todos.append(new_todo)
    save_todos(todos)
    return jsonify(new_todo), 201

# API untuk update status tugas (Pindah Kolom)
@app.route('/api/todos/<todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todos = get_todos()
    data = request.json
    for todo in todos:
        if todo['id'] == todo_id:
            todo['status'] = data.get('status', todo['status'])
            break
    save_todos(todos)
    return jsonify({'message': 'Status diperbarui'})

@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todos = get_todos()
    todos = [t for t in todos if t['id'] != todo_id]
    save_todos(todos)
    return jsonify({'message': 'Tugas dihapus'})
