function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    messageEl.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        messageEl.innerHTML = '';
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function openAddModal() {
    document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
    const modal = document.getElementById('addModal');
    const form = document.getElementById('customerForm');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

async function loadCustomers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/customers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const stageFilter = document.getElementById('stageFilter')?.value || '';
            let customers = data.customers;
            
            if (stageFilter) {
                customers = customers.filter(c => c.stage === stageFilter);
            }
            
            renderCustomers(customers);
        } else {
            if (response.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('加载客户列表错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

function renderCustomers(customers) {
    const customerList = document.getElementById('customerList');
    if (!customerList) return;
    
    if (customers.length === 0) {
        customerList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <p>暂无客户数据，点击"新增客户"添加您的第一个客户</p>
            </div>
        `;
        return;
    }

    const stageNames = {
        'lead': '线索',
        'contact': '接触',
        'demand': '需求确认',
        'proposal': '方案报价',
        'negotiation': '商务谈判',
        'deal': '成交'
    };

    customerList.innerHTML = customers.map(customer => `
        <div class="table-row">
            <div class="table-cell name">${customer.name}</div>
            <div class="table-cell">${customer.phone}</div>
            <div class="table-cell">${customer.company || '-'}</div>
            <div class="table-cell"><span class="stage-badge ${customer.stage || 'lead'}">${stageNames[customer.stage] || customer.stage || '线索'}</span></div>
            <div class="table-cell">${formatDate(customer.createdAt)}</div>
            <div class="table-cell"><a href="/customer/${customer.id}">查看详情</a></div>
        </div>
    `).join('');
}

const customerForm = document.getElementById('customerForm');
if (customerForm) {
    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const formData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            company: document.getElementById('customerCompany').value,
            address: document.getElementById('customerAddress').value,
            notes: document.getElementById('customerNotes').value,
            stage: document.getElementById('customerStage').value
        };

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showMessage('客户添加成功', 'success');
                closeAddModal();
                loadCustomers();
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('网络错误，请稍后重试', 'error');
        }
    });
}

const addModal = document.getElementById('addModal');
if (addModal) {
    addModal.addEventListener('click', (e) => {
        if (e.target.id === 'addModal') {
            closeAddModal();
        }
    });
}

async function exportCustomers(format) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        showMessage('正在导出数据...', 'success');
        
        const response = await fetch(`/api/export/customers?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (format === 'csv') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `客户数据_${new Date().toLocaleDateString('zh-CN')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showMessage('CSV文件下载成功', 'success');
        } else {
            const data = await response.json();
            if (data.success) {
                const jsonStr = JSON.stringify(data.data, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `客户数据_${new Date().toLocaleDateString('zh-CN')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showMessage('JSON文件下载成功', 'success');
            } else {
                showMessage(data.message || '导出失败', 'error');
            }
        }
    } catch (error) {
        console.error('导出客户数据错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
});