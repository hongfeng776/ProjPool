let currentCustomerId = null;

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

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getCustomerIdFromUrl() {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
}

async function loadCustomerDetail() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    currentCustomerId = getCustomerIdFromUrl();
    
    if (!currentCustomerId || currentCustomerId === 'customer') {
        window.location.href = '/customers';
        return;
    }

    try {
        const response = await fetch(`/api/customers/${currentCustomerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderCustomerDetail(data.customer);
            loadFollowups();
        } else {
            if (response.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            showMessage(data.message || '获取客户详情失败', 'error');
        }
    } catch (error) {
        console.error('加载客户详情错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

function renderCustomerDetail(customer) {
    const stageNames = {
        'lead': '线索',
        'contact': '接触',
        'demand': '需求确认',
        'proposal': '方案报价',
        'negotiation': '商务谈判',
        'deal': '成交'
    };
    
    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('detailName').textContent = customer.name || '-';
    document.getElementById('detailPhone').textContent = customer.phone || '-';
    document.getElementById('detailEmail').textContent = customer.email || '-';
    document.getElementById('detailCompany').textContent = customer.company || '-';
    document.getElementById('detailAddress').textContent = customer.address || '-';
    document.getElementById('detailStage').innerHTML = `<span class="stage-badge ${customer.stage || 'lead'}">${stageNames[customer.stage] || customer.stage || '线索'}</span>`;
    document.getElementById('detailCreated').textContent = formatDate(customer.createdAt);
    document.getElementById('detailNotes').textContent = customer.notes || '暂无备注';
    
    document.getElementById('updateName').value = customer.name || '';
    document.getElementById('updatePhone').value = customer.phone || '';
    document.getElementById('updateEmail').value = customer.email || '';
    document.getElementById('updateCompany').value = customer.company || '';
    document.getElementById('updateAddress').value = customer.address || '';
    document.getElementById('updateStage').value = customer.stage || 'lead';
    document.getElementById('updateNotes').value = customer.notes || '';
}

async function loadFollowups() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`/api/followups/${currentCustomerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderFollowups(data.followups);
        } else {
            if (response.status !== 401) {
                showMessage(data.message || '获取跟进记录失败', 'error');
            }
        }
    } catch (error) {
        console.error('加载跟进记录错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

function renderFollowups(followups) {
    const followupsList = document.getElementById('followupsList');
    if (!followupsList) return;
    
    if (followups.length === 0) {
        followupsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <p>暂无跟进记录，点击"添加跟进"创建第一条记录</p>
            </div>
        `;
        return;
    }

    followupsList.innerHTML = followups.map(followup => `
        <div class="followup-item">
            <div class="followup-header">
                <span class="followup-type">${followup.type}</span>
                <span class="followup-date">${formatDateTime(followup.createdAt)}</span>
            </div>
            <div class="followup-content">${followup.content}</div>
            ${followup.nextFollowDate ? `
                <div class="followup-footer">
                    <span class="next-follow">下次跟进: ${formatDate(followup.nextFollowDate)}</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function openFollowupModal() {
    const modal = document.getElementById('followupModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeFollowupModal() {
    const modal = document.getElementById('followupModal');
    const form = document.getElementById('followupForm');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

const followupForm = document.getElementById('followupForm');
if (followupForm) {
    followupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const formData = {
            customerId: currentCustomerId,
            type: document.getElementById('followupType').value,
            content: document.getElementById('followupContent').value,
            nextFollowDate: document.getElementById('nextFollowDate').value
        };

        try {
            const response = await fetch('/api/followups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showMessage('跟进记录添加成功', 'success');
                closeFollowupModal();
                loadFollowups();
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                showMessage(data.message || '添加跟进记录失败', 'error');
            }
        } catch (error) {
            console.error('添加跟进记录错误:', error);
            showMessage('网络错误，请稍后重试', 'error');
        }
    });
}

const followupModal = document.getElementById('followupModal');
if (followupModal) {
    followupModal.addEventListener('click', (e) => {
        if (e.target.id === 'followupModal') {
            closeFollowupModal();
        }
    });
}

const updateForm = document.getElementById('updateForm');
if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const formData = {
            name: document.getElementById('updateName').value,
            phone: document.getElementById('updatePhone').value,
            email: document.getElementById('updateEmail').value,
            company: document.getElementById('updateCompany').value,
            address: document.getElementById('updateAddress').value,
            stage: document.getElementById('updateStage').value,
            notes: document.getElementById('updateNotes').value
        };

        try {
            const response = await fetch(`/api/customers/${currentCustomerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showMessage('客户信息更新成功', 'success');
                loadCustomerDetail();
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                showMessage(data.message || '更新失败', 'error');
            }
        } catch (error) {
            console.error('更新客户信息错误:', error);
            showMessage('网络错误，请稍后重试', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCustomerDetail();
});