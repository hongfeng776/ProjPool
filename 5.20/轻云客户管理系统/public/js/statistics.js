function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    messageEl.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        messageEl.innerHTML = '';
    }, 3000);
}

async function loadFunnelData() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/statistics/funnel', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderFunnel(data.funnel, data.total, data.conversionRate);
        } else {
            if (response.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            showMessage(data.message || '获取统计数据失败', 'error');
        }
    } catch (error) {
        console.error('加载销售漏斗数据错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

function renderFunnel(funnel, total, conversionRate) {
    document.getElementById('totalCustomers').textContent = total;
    document.getElementById('dealCustomers').textContent = funnel[5].count;
    document.getElementById('conversionRate').textContent = conversionRate + '%';

    const container = document.getElementById('funnelContainer');
    if (!container) return;

    const maxCount = funnel[0].count > 0 ? funnel[0].count : 1;
    
    container.innerHTML = funnel.map((stage, index) => {
        const widthPercent = Math.max(30, (stage.count / maxCount) * 100);
        return `
            <div class="funnel-stage">
                <div class="funnel-stage-name">${stage.name}</div>
                <div class="funnel-bar-container">
                    <div class="funnel-bar" style="width: ${widthPercent}%; opacity: ${1 - index * 0.1}">
                        ${stage.count}
                    </div>
                </div>
                <div class="funnel-count">${stage.count}</div>
            </div>
        `;
    }).join('');
}

async function exportData(format) {
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
        console.error('导出数据错误:', error);
        showMessage('网络错误，请稍后重试', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFunnelData();
});