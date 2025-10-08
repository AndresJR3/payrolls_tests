// frontend/app.js
const API_URL = 'http://localhost:5000/api/nominas';
let token = localStorage.getItem('token');
let currentUser = null;
let currentPage = 1;
let totalPages = 1;
let isEditing = false;
let editingId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        checkTokenValidity();
    } else {
        showAuthSection();
    }

    // Event listeners
    document.getElementById('payroll-form').addEventListener('submit', handlePayrollSubmit);

    // Cerrar modal al hacer clic fuera
    window.onclick = (event) => {
        const modal = document.getElementById('payroll-modal');
        if (event.target === modal) {
            closeModal();
        }
    };
});

// Utilidades
function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = message;
    alert.className = `alert alert-${type} show`;

    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

function showLoading(show = true) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX');
}

// Autenticación
async function register() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Usuario registrado exitosamente. Ahora inicia sesión.', 'success');
            document.getElementById('password').value = '';
        } else {
            showAlert(data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión. Intenta nuevamente.', 'error');
        console.error('Error:', error);
    }
}

async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));

            showAlert('Sesión iniciada exitosamente', 'success');
            showDashboard();
        } else {
            showAlert(data.message || 'Credenciales inválidas', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión. Intenta nuevamente.', 'error');
        console.error('Error:', error);
    }
}

async function checkTokenValidity() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthSection();
    showAlert('Sesión cerrada', 'success');
}

// Navegación
function showAuthSection() {
    document.getElementById('auth-section').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showDashboard() {
    document.getElementById('auth-section').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('user-email').textContent = currentUser.email;

    loadStats();
    loadPayrolls();
}

// Estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/payrolls/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            displayStats(data.general);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function displayStats(stats) {
    const container = document.getElementById('stats-container');

    container.innerHTML = `
        <div class="stat-card">
            <h3>${stats.total_payrolls || 0}</h3>
            <p><i class="fas fa-file-invoice-dollar"></i> Total Nóminas</p>
        </div>
        <div class="stat-card">
            <h3>${formatCurrency(stats.total_salary || 0)}</h3>
            <p><i class="fas fa-money-bill-wave"></i> Total Pagado</p>
        </div>
        <div class="stat-card">
            <h3>${formatCurrency(stats.average_salary || 0)}</h3>
            <p><i class="fas fa-chart-line"></i> Salario Promedio</p>
        </div>
        <div class="stat-card">
            <h3>${stats.unique_employees || 0}</h3>
            <p><i class="fas fa-users"></i> Empleados</p>
        </div>
    `;
}

// CRUD de Nóminas
async function loadPayrolls(page = 1) {
    currentPage = page;
    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/payrolls?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            displayPayrolls(data.payrolls);
            displayPagination(data.pagination);
        } else {
            showAlert('Error cargando nóminas', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

function displayPayrolls(payrolls) {
    const container = document.getElementById('payrolls-container');

    if (payrolls.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 20px;"></i>
                <h3>No hay nóminas registradas</h3>
                <p>Comienza creando tu primera nómina</p>
            </div>
        `;
        return;
    }

    container.innerHTML = payrolls.map(payroll => `
        <div class="payroll-card">
            <div class="payroll-header">
                <div>
                    <div class="payroll-name">
                        <i class="fas fa-user"></i> ${payroll.employee_name}
                    </div>
                    <small style="color: #7f8c8d;">
                        <i class="fas fa-calendar"></i> ${formatDate(payroll.pay_date)}
                    </small>
                </div>
                <div class="payroll-salary">${formatCurrency(payroll.salary)}</div>
            </div>

            <div style="margin-top: 10px; color: #7f8c8d; font-size: 0.9em;">
                <i class="fas fa-clock"></i>
                Creado: ${formatDate(payroll.created_at)}
                ${payroll.updated_at !== payroll.created_at ?
                    `<br><i class="fas fa-edit"></i> Actualizado: ${formatDate(payroll.updated_at)}`
                    : ''}
            </div>

            <div class="payroll-actions">
                <button class="btn btn-primary btn-small" onclick="editPayroll(${payroll.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-small" onclick="deletePayroll(${payroll.id}, '${payroll.employee_name}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    totalPages = pagination.totalPages;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button ${!pagination.hasPrev ? 'disabled' : ''} onclick="loadPayrolls(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Anterior
        </button>
    `;

    // Páginas numeradas
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="loadPayrolls(${i})">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
        <button ${!pagination.hasNext ? 'disabled' : ''} onclick="loadPayrolls(${currentPage + 1})">
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = paginationHTML;
}

// Modal
function showCreateModal() {
    isEditing = false;
    editingId = null;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus"></i> Nueva Nómina';
    document.getElementById('payroll-form').reset();
    document.getElementById('payroll-modal').style.display = 'block';

    // Establecer fecha de hoy por defecto
    document.getElementById('modal-pay-date').value = new Date().toISOString().split('T')[0];
}

async function editPayroll(id) {
    try {
        const response = await fetch(`${API_URL}/payrolls/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const payroll = data.payroll;

            isEditing = true;
            editingId = id;

            document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Nómina';
            document.getElementById('modal-employee-name').value = payroll.employee_name;
            document.getElementById('modal-salary').value = payroll.salary;
            document.getElementById('modal-pay-date').value = payroll.pay_date.split('T')[0];

            document.getElementById('payroll-modal').style.display = 'block';
        } else {
            showAlert('Error cargando la nómina', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
        console.error('Error:', error);
    }
}

async function deletePayroll(id, employeeName) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la nómina de ${employeeName}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/payrolls/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showAlert('Nómina eliminada exitosamente', 'success');
            loadPayrolls(currentPage);
            loadStats();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Error eliminando nómina', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
        console.error('Error:', error);
    }
}

function closeModal() {
    document.getElementById('payroll-modal').style.display = 'none';
    isEditing = false;
    editingId = null;
}

async function handlePayrollSubmit(e) {
    e.preventDefault();

    const employeeName = document.getElementById('modal-employee-name').value.trim();
    const salary = document.getElementById('modal-salary').value;
    const payDate = document.getElementById('modal-pay-date').value;

    if (!employeeName || !salary || !payDate) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    if (parseFloat(salary) <= 0) {
        showAlert('El salario debe ser mayor a 0', 'error');
        return;
    }

    const payrollData = {
        employee_name: employeeName,
        salary: parseFloat(salary),
        pay_date: payDate
    };

    try {
        const url = isEditing ? `${API_URL}/payrolls/${editingId}` : `${API_URL}/payrolls`;
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payrollData)
        });

        if (response.ok) {
            showAlert(
                isEditing ? 'Nómina actualizada exitosamente' : 'Nómina creada exitosamente',
                'success'
            );
            closeModal();
            loadPayrolls(currentPage);
            loadStats();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Error guardando nómina', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
        console.error('Error:', error);
    }
}
