let currentDeleteId = null;

// Tampilkan Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}
function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Ambil Data
async function fetchTasks() {
    showLoading();
    try {
        const res = await fetch('/api/todos');
        const tasks = await res.json();
        renderBoard(tasks);
    } catch (error) {
        console.error("Gagal memuat tugas", error);
    }
    hideLoading();
}

// Render Board sesuai Status
function renderBoard(tasks) {
    const columns = {
        'new': document.getElementById('list-new'),
        'in_progress': document.getElementById('list-in_progress'),
        'pending': document.getElementById('list-pending'),
        'complete': document.getElementById('list-complete')
    };

    // Bersihkan isi kolom
    for (let key in columns) {
        columns[key].innerHTML = '';
        document.getElementById(`count-${key}`).innerText = '0';
    }

    const counts = { new: 0, in_progress: 0, pending: 0, complete: 0 };

    tasks.forEach(task => {
        const col = columns[task.status];
        if (col) {
            counts[task.status]++;
            
            // Format Tanggal (Opsional biar cantik)
            const startDate = new Date(task.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const endDate = new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Generate Avatar inisial dari nama PIC
            const avatarUrl = `https://ui-avatars.com/api/?name=${task.pic}&background=random&color=fff&size=64`;

            const cardHtml = `
                <div class="task-card">
                    <div class="task-card-header">
                        <h4>${task.title}</h4>
                        <button class="btn-icon" onclick="openDeleteModal('${task.id}')" title="Hapus Tugas">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="task-desc">${task.description}</div>
                    
                    <div class="task-dates">
                        <div class="date-box">
                            <span>Start Date</span>
                            <strong>${startDate}</strong>
                        </div>
                        <div class="date-box">
                            <span>End Date</span>
                            <strong>${endDate}</strong>
                        </div>
                    </div>

                    <div class="task-footer">
                        <img src="${avatarUrl}" class="pic-avatar" title="PIC: ${task.pic}">
                        
                        <select class="status-select status-${task.status}" onchange="changeStatus('${task.id}', this.value)">
                            <option value="new" ${task.status === 'new' ? 'selected' : ''}>New Task</option>
                            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="complete" ${task.status === 'complete' ? 'selected' : ''}>Complete</option>
                        </select>
                    </div>
                </div>
            `;
            col.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    // Update Counter di Header Kolom
    for (let key in counts) {
        document.getElementById(`count-${key}`).innerText = counts[key];
    }
}

// Tambah Tugas
async function submitTask(e) {
    e.preventDefault();
    showLoading();
    closeAddModal();

    const newTask = {
        title: document.getElementById('inputTitle').value,
        description: document.getElementById('inputDesc').value,
        pic: document.getElementById('inputPIC').value,
        start_date: document.getElementById('inputStart').value,
        deadline: document.getElementById('inputDeadline').value,
        status: document.getElementById('inputStatus').value
    };

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });
    
    document.getElementById('taskForm').reset();
    fetchTasks();
}

// Ubah Status (Saat Dropdown diganti, langsung pindah kolom)
async function changeStatus(id, newStatus) {
    showLoading();
    await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
}

// Eksekusi Hapus Tugas
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (currentDeleteId) {
        closeDeleteModal();
        showLoading();
        await fetch(`/api/todos/${currentDeleteId}`, { method: 'DELETE' });
        fetchTasks();
    }
});

// Modal Logic
function openAddModal() { document.getElementById('addTaskModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addTaskModal').classList.add('hidden'); }

function openDeleteModal(id) { 
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.remove('hidden'); 
}
function closeDeleteModal() { 
    currentDeleteId = null;
    document.getElementById('deleteModal').classList.add('hidden'); 
}

// Jalankan fetchTasks saat halaman pertama dimuat
fetchTasks();
