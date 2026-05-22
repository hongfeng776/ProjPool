let currentPage = 1;
const pageSize = 10;
let currentChartType = 'trend';
let currentChartStyle = 'line';
let mainChart, deptChart, regionChart, businessChart;

const chartColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#43e97b', '#fa709a', '#fee140',
    '#a8edea', '#fed6e3'
];

document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    initFilterSelectors();
    loadAllData();
    setupEventListeners();
});

function initCharts() {
    mainChart = echarts.init(document.getElementById('mainChart'));
    deptChart = echarts.init(document.getElementById('deptChart'));
    regionChart = echarts.init(document.getElementById('regionChart'));
    businessChart = echarts.init(document.getElementById('businessChart'));
    
    window.addEventListener('resize', function() {
        mainChart.resize();
        deptChart.resize();
        regionChart.resize();
        businessChart.resize();
    });
}

function initFilterSelectors() {
    const currentYear = new Date().getFullYear();
    
    const yearSelects = ['filterYear', 'chartYear'];
    yearSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            for (let i = currentYear; i >= currentYear - 5; i--) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + '年';
                select.appendChild(option);
            }
        }
    });

    const monthSelect = document.getElementById('filterMonth');
    if (monthSelect) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + '月';
            monthSelect.appendChild(option);
        }
    }

    const departments = ['销售部', '市场部', '技术部', '运营部', '财务部', '人力资源部', '产品部', '客服部'];
    const deptSelect = document.getElementById('filterDepartment');
    if (deptSelect) {
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            deptSelect.appendChild(option);
        });
    }
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        const exportMenu = document.getElementById('exportMenu');
        if (exportMenu && !e.target.closest('.export-dropdown')) {
            exportMenu.classList.remove('show');
        }
    });
}

async function loadAllData() {
    loadSummaryData();
    loadAllCharts();
    loadRevenueList();
    loadAnomalies();
}

function showAddForm() {
    document.getElementById('addModal').classList.add('show');
    document.getElementById('revenueForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('formDate').value = today;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function toggleExportMenu() {
    document.getElementById('exportMenu').classList.toggle('show');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function submitForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    try {
        const department = document.getElementById('formDepartment').value;
        const amount = parseFloat(document.getElementById('formAmount').value);
        const date = document.getElementById('formDate').value;
        const businessType = document.getElementById('formBusinessType').value;
        const region = document.getElementById('formRegion').value;
        const customerType = document.getElementById('formCustomerType').value;
        const companyName = document.getElementById('formCompanyName').value;

        if (!department) {
            throw new Error('请选择部门');
        }
        if (!amount || amount <= 0) {
            throw new Error('请输入有效的金额');
        }
        if (!date) {
            throw new Error('请选择交易日期');
        }

        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;

        const response = await fetch('/api/revenue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_name: companyName || '未指定',
                department: department,
                business_type: businessType || '其他',
                revenue_amount: amount,
                revenue_date: date,
                year: year,
                month: month,
                region: region || '未指定',
                customer_type: customerType || '未指定'
            })
        });

        const result = await response.json();

        if (result.code === 200) {
            showToast('营收单据录入成功！', 'success');
            closeModal('addModal');
            currentPage = 1;
            loadAllData();
        } else {
            throw new Error(result.message || '提交失败');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交';
    }
}

async function loadRevenueList() {
    const department = document.getElementById('filterDepartment')?.value || '';
    const year = document.getElementById('filterYear')?.value || '';
    const month = document.getElementById('filterMonth')?.value || '';

    try {
        const params = new URLSearchParams({
            page: currentPage,
            page_size: pageSize
        });
        if (department) params.append('department', department);
        if (year) params.append('year', year);
        if (month) params.append('month', month);

        const response = await fetch(`/api/revenue?${params}`);
        const result = await response.json();

        if (result.code === 200) {
            renderRevenueTable(result.data);
            renderPagination(result.data);
        }
    } catch (error) {
        console.error('加载列表失败:', error);
        showToast('加载数据失败', 'error');
    }
}

function renderRevenueTable(data) {
    const tbody = document.getElementById('revenueTableBody');
    const items = data.items || [];

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>暂无数据，点击"新增营收"添加单据</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map((item, index) => `
        <tr>
            <td>${(currentPage - 1) * pageSize + index + 1}</td>
            <td><span class="department-tag">${item.department || '-'}</span></td>
            <td class="amount">¥ ${formatNumber(item.revenue_amount)}</td>
            <td>${item.revenue_date || '-'}</td>
            <td>${item.business_type || '-'}</td>
            <td>${item.region || '-'}</td>
            <td>${item.created_at ? item.created_at.split(' ')[0] : '-'}</td>
            <td>
                <button class="action-btn delete" onclick="deleteRevenue(${item.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    const totalPages = data.pages || 1;
    const total = data.total || 0;

    if (totalPages <= 1) {
        pagination.innerHTML = `<span class="pagination-info">共 ${total} 条记录</span>`;
        return;
    }

    let html = `<span class="pagination-info">共 ${total} 条记录</span>`;
    
    html += `<button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>首页</button>`;
    html += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    html += `<button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>末页</button>`;

    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadRevenueList();
}

async function deleteRevenue(id) {
    if (!confirm('确定要删除这条营收记录吗？')) {
        return;
    }

    try {
        const response = await fetch(`/api/revenue/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (result.code === 200) {
            showToast('删除成功', 'success');
            loadAllData();
        } else {
            throw new Error(result.message || '删除失败');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadSummaryData() {
    try {
        const response = await fetch('/api/dashboard/summary');
        const result = await response.json();

        if (result.code === 200 && result.data) {
            const data = result.data;
            document.getElementById('totalRevenue').textContent = '¥ ' + formatNumber(data.total_revenue || 0);
            document.getElementById('monthRevenue').textContent = '¥ ' + formatNumber(data.month_revenue || 0);
            
            const momElement = document.getElementById('monthOnMonth');
            const mom = data.month_on_month || 0;
            momElement.textContent = (mom >= 0 ? '+' : '') + mom + '%';
            momElement.style.color = mom >= 0 ? '#52c41a' : '#ff4d4f';
            
            document.getElementById('departmentCount').textContent = data.department_count || 0;
        }
    } catch (error) {
        console.error('加载汇总数据失败:', error);
    }
}

async function loadAllCharts() {
    loadMainChart();
    loadDeptChart();
    loadRegionChart();
    loadBusinessChart();
}

async function loadMainChart() {
    const year = document.getElementById('chartYear')?.value || new Date().getFullYear();
    
    try {
        const response = await fetch(`/api/dashboard/compare?year=${year}`);
        const result = await response.json();

        if (result.code === 200) {
            renderMainChart(result.data);
        }
    } catch (error) {
        console.error('加载趋势图失败:', error);
    }
}

function renderMainChart(data) {
    let option;
    
    if (currentChartType === 'trend') {
        option = {
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br/>营收: ¥{c}'
            },
            legend: {
                data: ['本年营收', '去年营收'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.months,
                axisLine: { lineStyle: { color: '#e0e0e0' } }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
            },
            series: [
                {
                    name: '本年营收',
                    type: currentChartStyle,
                    data: data.current_revenues,
                    smooth: true,
                    lineStyle: { width: 3, color: chartColors[0] },
                    areaStyle: currentChartStyle === 'line' ? {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                        ])
                    } : null,
                    itemStyle: { color: chartColors[0] }
                },
                {
                    name: '去年营收',
                    type: currentChartStyle,
                    data: data.last_revenues,
                    smooth: true,
                    lineStyle: { width: 2, color: chartColors[2], type: 'dashed' },
                    itemStyle: { color: chartColors[2] }
                }
            ]
        };
    } else if (currentChartType === 'compare') {
        option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(item => {
                        result += `${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['本年营收', '去年营收', '同比增长率'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.months,
                axisLine: { lineStyle: { color: '#e0e0e0' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '营收金额',
                    position: 'left',
                    axisLine: { show: false },
                    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
                },
                {
                    type: 'value',
                    name: '同比(%)',
                    position: 'right',
                    axisLine: { show: false },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '本年营收',
                    type: 'bar',
                    data: data.current_revenues,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: chartColors[0] },
                            { offset: 1, color: chartColors[1] }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: 20
                },
                {
                    name: '去年营收',
                    type: 'bar',
                    data: data.last_revenues,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: chartColors[2] },
                            { offset: 1, color: chartColors[3] }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: 20
                },
                {
                    name: '同比增长率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.yoy_rates,
                    smooth: true,
                    lineStyle: { width: 3, color: chartColors[4] },
                    itemStyle: { color: chartColors[4] }
                }
            ]
        };
    } else if (currentChartType === 'mom') {
        option = {
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(item => {
                        if (item.seriesName.includes('增长')) {
                            result += `${item.seriesName}: ${item.value}%<br/>`;
                        } else {
                            result += `${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['营收金额', '环比增长率'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.months,
                axisLine: { lineStyle: { color: '#e0e0e0' } }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '营收金额',
                    position: 'left',
                    axisLine: { show: false },
                    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
                },
                {
                    type: 'value',
                    name: '环比(%)',
                    position: 'right',
                    axisLine: { show: false },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '营收金额',
                    type: currentChartStyle,
                    data: data.current_revenues,
                    smooth: true,
                    lineStyle: { width: 3, color: chartColors[0] },
                    areaStyle: currentChartStyle === 'line' ? {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                        ])
                    } : null,
                    itemStyle: { color: chartColors[0] }
                },
                {
                    name: '环比增长率',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: data.mom_rates,
                    itemStyle: {
                        color: function(params) {
                            return params.data >= 0 ? '#52c41a' : '#ff4d4f';
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: 20
                }
            ]
        };
    }
    
    mainChart.setOption(option, true);
}

function switchChartType(type) {
    currentChartType = type;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    loadMainChart();
}

function switchChartStyle(style) {
    currentChartStyle = style;
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(style === 'bar' ? 'rect' : 'path'));
    });
    document.querySelectorAll('.style-btn').forEach((btn, index) => {
        btn.classList.toggle('active', (style === 'bar' && index === 0) || (style === 'line' && index === 1));
    });
    loadMainChart();
}

async function loadDeptChart() {
    try {
        const response = await fetch('/api/dashboard/department');
        const result = await response.json();

        if (result.code === 200) {
            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>营收: ¥{c}'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: result.data.departments,
                    axisLine: { lineStyle: { color: '#e0e0e0' } },
                    axisLabel: { rotate: 30, interval: 0 }
                },
                yAxis: {
                    type: 'value',
                    axisLine: { show: false },
                    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
                },
                series: [{
                    type: 'bar',
                    data: result.data.revenues,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: chartColors[0] },
                            { offset: 1, color: chartColors[1] }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: 30
                }]
            };
            deptChart.setOption(option);
        }
    } catch (error) {
        console.error('加载部门图表失败:', error);
    }
}

async function loadRegionChart() {
    try {
        const response = await fetch('/api/dashboard/region');
        const result = await response.json();

        if (result.code === 200) {
            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>营收: ¥{c}'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: result.data.regions,
                    axisLine: { lineStyle: { color: '#e0e0e0' } },
                    axisLabel: { rotate: 30, interval: 0 }
                },
                yAxis: {
                    type: 'value',
                    axisLine: { show: false },
                    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
                },
                series: [{
                    type: 'bar',
                    data: result.data.revenues,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: chartColors[4] },
                            { offset: 1, color: chartColors[5] }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: 30
                }]
            };
            regionChart.setOption(option);
        }
    } catch (error) {
        console.error('加载地区图表失败:', error);
    }
}

async function loadBusinessChart() {
    try {
        const response = await fetch('/api/dashboard/business');
        const result = await response.json();

        if (result.code === 200) {
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}<br/>营收: ¥{c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center'
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    data: result.data.map((item, index) => ({
                        ...item,
                        itemStyle: { color: chartColors[index % chartColors.length] }
                    })),
                    label: {
                        show: true,
                        formatter: '{b}: {d}%'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            businessChart.setOption(option);
        }
    } catch (error) {
        console.error('加载业务类型图表失败:', error);
    }
}

async function loadAnomalies() {
    try {
        const response = await fetch('/api/dashboard/anomalies');
        const result = await response.json();

        if (result.code === 200) {
            const badge = document.getElementById('anomalyBadge');
            if (badge) {
                badge.textContent = result.data.warning_count || 0;
                badge.style.display = result.data.warning_count > 0 ? 'inline-block' : 'none';
            }
            
            window.anomalyData = result.data;
        }
    } catch (error) {
        console.error('加载异常数据失败:', error);
    }
}

function showAnomalyModal() {
    const modal = document.getElementById('anomalyModal');
    const content = document.getElementById('anomalyContent');
    
    if (!window.anomalyData || window.anomalyData.anomalies.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <p>暂无异常数据，系统运行正常</p>
            </div>
        `;
    } else {
        content.innerHTML = window.anomalyData.anomalies.map(item => `
            <div class="anomaly-item ${item.level}">
                <div class="anomaly-icon">${item.level === 'warning' ? '⚠️' : 'ℹ️'}</div>
                <div class="anomaly-content">
                    <div class="anomaly-title">${item.message}</div>
                    <div class="anomaly-desc">${item.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.add('show');
}

function exportRevenue(format) {
    const department = document.getElementById('filterDepartment')?.value || '';
    const year = document.getElementById('filterYear')?.value || '';
    const month = document.getElementById('filterMonth')?.value || '';
    
    const params = new URLSearchParams({ format });
    if (department) params.append('department', department);
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    window.open(`/export/revenue?${params}`, '_blank');
    toggleExportMenu();
    showToast('导出中，请稍候...', 'info');
}

function exportSummary() {
    const year = document.getElementById('chartYear')?.value || new Date().getFullYear();
    window.open(`/export/summary?year=${year}`, '_blank');
    toggleExportMenu();
    showToast('导出中，请稍候...', 'info');
}

function formatNumber(num) {
    if (!num) return '0.00';
    return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal('addModal');
        closeModal('anomalyModal');
    }
});
