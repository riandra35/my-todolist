const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const taskList = document.getElementById('taskList');
const addBtn = document.getElementById('addBtn');

// Fungsi mengambil data saat web dibuka
async function fetchTasks() {
    try {
        const res = await fetch('/api/todos');
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (error) {
        taskList.innerHTML = '<li class="loading">Gagal memuat data.</li>';
    }
}

// Fungsi menampilkan data ke HTML
function renderTasks(tasks) {
    taskList.innerHTML = ''; // Kosongkan daftar saat ini
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="loading">Belum ada tugas.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        if(task.completed) li.classList.add('completed');
        
        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask('${task.id}')">
                <span class="text">${task.text}</span>
                <span class="badge priority-${task.priority}">${task.priority}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">Hapus</button>
        `;
        taskList.appendChild(li);
    });
}

// Fungsi menambah data
async function addTask() {
    const text = taskInput.value.trim();
    const priority = priorityInput.value;
    
    if(!text) return alert('Tugas tidak boleh kosong!');

    // Ubah tombol jadi "Menyimpan..."
    addBtn.innerText = '...';
    addBtn.disabled = true;

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, priority })
    });
    
    taskInput.value = '';
    addBtn.innerText = 'Tambah';
    addBtn.disabled = false;
    
    fetchTasks(); // Refresh daftar
}

// Fungsi coret tugas (selesai/belum)
async function toggleTask(id) {
    await fetch(`/api/todos/${id}`, { method: 'PUT' });
    fetchTasks();
}

// Fungsi hapus tugas
async function deleteTask(id) {
    if(confirm('Yakin ingin menghapus tugas ini?')) {
        await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

// Jalankan fetchTasks pertama kali
fetchTasks();
