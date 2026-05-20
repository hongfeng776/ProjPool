let currentKPIList = [];
let scoreDistributionChart = null;
let trendChart = null;
let deptChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadEmployees();
    loadKPI();
    initYearFilters();
    loadPerformance();
    initForms();
});

function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            navBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'statistics') {
                loadStatistics();
            }
        });
    });
}

function initYearFilters() {
    const currentYear = new Date().getFullYear();
    const yearSelectors = ['perfYearFilter', 'statYearFilter', 'perfYear'];
    
    yearSelectors.forEach(selector => {
        const select = document.getElementById(selector);
        if (select) {
            for (let year = currentYear - 5; year <= currentYear + 1; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年';
                select.appendChild(option);
            }
        }
    });
}

function loadEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            renderEmployees(data.data);
            updateDepartmentFilters(data.data);
            updateEmployeeSelect(data.data);
        })
        .catch(error => console.error('加载员工数据失败:', error));
}

function updateDepartmentFilters(employees) {
    const departments = [...new Set(employees.map(e => e.department).filter(d => d))];
    const filters = ['perfDeptFilter', 'statDeptFilter'];
    
    filters.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">全部</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                select.appendChild(option);
            });
            select.value = currentValue;
        }
    });
}

function updateEmployeeSelect(employees) {
    const select = document.getElementById('perfEmployee');
    if (select) {
        select.innerHTML = '<option value="">请选择员工</option>';
        employees.filter(e => e.status === 'active').forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.name} (${emp.employeeId})`;
            select.appendChild(option);
        });
    }
}

function renderEmployees(employees) {
    const tbody = document.getElementById('employeeTableBody');
    
    if (!employees || employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <p>暂无员工数据，点击"添加员工"开始录入</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.name}</td>
            <td>${emp.department || '-'}</td>
            <td>${emp.position || '-'}</td>
            <td>${emp.hireDate || '-'}</td>
            <td>${emp.email || '-'}</td>
            <td><span class="status-badge status-${emp.status}">${emp.status === 'active' ? '在职' : '离职'}</span></td>
            <td>
                <button class="btn btn-edit" onclick="editEmployee(${emp.id})">编辑</button>
                <button class="btn btn-delete" onclick="deleteEmployee(${emp.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function loadKPI() {
    fetch('/api/kpi')
        .then(response => response.json())
        .then(data => {
            currentKPIList = data.data || [];
            renderKPI(currentKPIList);
        })
        .catch(error => console.error('加载KPI数据失败:', error));
}

function renderKPI(kpis) {
    const tbody = document.getElementById('kpiTableBody');
    
    if (!kpis || kpis.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <p>暂无KPI指标，点击"添加KPI指标"开始配置</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = kpis.map(kpi => `
        <tr>
            <td>${kpi.code}</td>
            <td>${kpi.name}</td>
            <td>${kpi.category || '-'}</td>
            <td>${(kpi.weight * 100).toFixed(0)}%</td>
            <td>${kpi.targetValue || '-'}</td>
            <td>${kpi.unit || '-'}</td>
            <td><span class="status-badge status-${kpi.status}">${kpi.status === 'active' ? '启用' : '禁用'}</span></td>
            <td>
                <button class="btn btn-edit" onclick="editKPI(${kpi.id})">编辑</button>
                <button class="btn btn-delete" onclick="deleteKPI(${kpi.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function loadPerformance() {
    const year = document.getElementById('perfYearFilter').value;
    const month = document.getElementById('perfMonthFilter').value;
    const department = document.getElementById('perfDeptFilter').value;
    
    let url = '/api/performance?';
    if (year) url += `year=${year}&`;
    if (month) url += `month=${month}&`;
    if (department) url += `department=${department}&`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderPerformance(data.data);
        })
        .catch(error => console.error('加载考核记录失败:', error));
}

function renderPerformance(records) {
    const tbody = document.getElementById('performanceTableBody');
    
    if (!records || records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <p>暂无考核记录，点击"录入考核"开始添加</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = records.map(record => {
        const grade = getGrade(record.overallScore);
        return `
        <tr>
            <td>${record.employeeNo || '-'}</td>
            <td>${record.employeeName}</td>
            <td>${record.department || '-'}</td>
            <td>${record.year}年${record.month}月</td>
            <td>${record.overallScore.toFixed(2)}</td>
            <td><span class="status-badge grade-${grade}">${getGradeText(grade)}</span></td>
            <td>
                <button class="btn btn-edit" onclick="editPerformance(${record.id})">编辑</button>
                <button class="btn btn-delete" onclick="deletePerformance(${record.id})">删除</button>
            </td>
        </tr>
    `}).join('');
}

function getGrade(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'qualified';
    return 'unqualified';
}

function getGradeText(grade) {
    const gradeMap = {
        'excellent': '优秀',
        'good': '良好',
        'qualified': '合格',
        'unqualified': '不合格'
    };
    return gradeMap[grade] || '未知';
}

function openPerformanceModal() {
    document.getElementById('performanceModalTitle').textContent = '录入绩效考核';
    document.getElementById('perfId').value = '';
    document.getElementById('performanceForm').reset();
    renderKPIScores();
    document.getElementById('performanceModal').classList.add('active');
}

function closePerformanceModal() {
    document.getElementById('performanceModal').classList.remove('active');
}

function renderKPIScores(existingScores = []) {
    const container = document.getElementById('kpiScoresContainer');
    const activeKPI = currentKPIList.filter(k => k.status === 'active');
    
    if (activeKPI.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">暂无启用的KPI指标，请先配置KPI</p>';
        return;
    }
    
    container.innerHTML = activeKPI.map(kpi => {
        const existingScore = existingScores.find(s => s.kpiId === kpi.id);
        return `
        <div class="kpi-score-item">
            <div class="kpi-name">${kpi.name}</div>
            <div class="kpi-weight">权重: ${(kpi.weight * 100).toFixed(0)}%</div>
            <div class="kpi-score-input">
                <input type="number" class="kpi-score" data-kpi-id="${kpi.id}" data-weight="${kpi.weight}" 
                       value="${existingScore ? existingScore.score : ''}" 
                       min="0" max="100" step="0.1" placeholder="得分" onchange="calculateOverallScore()">
            </div>
        </div>
    `}).join('');
}

function calculateOverallScore() {
    const scoreInputs = document.querySelectorAll('.kpi-score');
    let totalScore = 0;
    
    scoreInputs.forEach(input => {
        const score = parseFloat(input.value) || 0;
        const weight = parseFloat(input.getAttribute('data-weight')) || 0;
        totalScore += score * weight;
    });
    
    document.getElementById('perfOverallScore').value = totalScore.toFixed(2);
    
    const grade = getGrade(totalScore);
    document.getElementById('perfGrade').value = getGradeText(grade);
}

function editPerformance(id) {
    fetch(`/api/performance/${id}`)
        .then(response => response.json())
        .then(data => {
            const record = data.data;
            document.getElementById('performanceModalTitle').textContent = '编辑绩效考核';
            document.getElementById('perfId').value = record.id;
            document.getElementById('perfEmployee').value = record.employeeId;
            document.getElementById('perfYear').value = record.year;
            document.getElementById('perfMonth').value = record.month;
            document.getElementById('perfRemarks').value = record.remarks || '';
            renderKPIScores(record.kpiScores || []);
            calculateOverallScore();
            document.getElementById('performanceModal').classList.add('active');
        })
        .catch(error => console.error('获取考核记录失败:', error));
}

function deletePerformance(id) {
    if (confirm('确定要删除该考核记录吗？')) {
        fetch(`/api/performance/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadPerformance();
        })
        .catch(error => console.error('删除考核记录失败:', error));
    }
}

function loadStatistics() {
    const year = document.getElementById('statYearFilter').value;
    const department = document.getElementById('statDeptFilter').value;
    
    let overviewUrl = '/api/performance/stats/overview?';
    if (year) overviewUrl += `year=${year}&`;
    if (department) overviewUrl += `department=${department}&`;
    
    let rankingUrl = '/api/performance/stats/employee-ranking?';
    if (year) rankingUrl += `year=${year}&`;
    if (department) rankingUrl += `department=${department}&`;
    
    let trendUrl = '/api/performance/stats/trend?';
    if (year) trendUrl += `year=${year}`;
    
    Promise.all([
        fetch(overviewUrl).then(r => {
            if (!r.ok) throw new Error('获取概览数据失败');
            return r.json();
        }),
        fetch(rankingUrl).then(r => {
            if (!r.ok) throw new Error('获取排名数据失败');
            return r.json();
        }),
        fetch(trendUrl).then(r => {
            if (!r.ok) throw new Error('获取趋势数据失败');
            return r.json();
        })
    ]).then(([overview, ranking, trend]) => {
        renderStatOverview(overview.data);
        renderRanking(ranking.data);
        renderCharts(overview.data, trend.data);
    }).catch(error => {
        console.error('加载统计数据失败:', error);
        alert('加载统计数据失败: ' + error.message);
    });
}

function renderStatOverview(data) {
    document.getElementById('totalRecords').textContent = data.totalRecords || 0;
    document.getElementById('avgScore').textContent = data.avgScore || '0.00';
    document.getElementById('excellentCount').textContent = data.scoreDistribution?.excellent || 0;
    document.getElementById('goodCount').textContent = data.scoreDistribution?.good || 0;
}

function renderRanking(ranking) {
    const tbody = document.getElementById('rankingTableBody');
    
    if (!ranking || ranking.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state" style="padding: 30px;">
                    <p>暂无排名数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = ranking.slice(0, 10).map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.employeeName}</td>
            <td>${item.department || '-'}</td>
            <td>${item.avgScore}</td>
        </tr>
    `).join('');
}

function renderCharts(overview, trend) {
    if (!overview) overview = {};
    if (!trend) trend = [];

    const distributionCtx = document.getElementById('scoreDistributionChart').getContext('2d');
    if (scoreDistributionChart) scoreDistributionChart.destroy();
    
    const distData = [
        overview.scoreDistribution?.excellent || 0,
        overview.scoreDistribution?.good || 0,
        overview.scoreDistribution?.qualified || 0,
        overview.scoreDistribution?.unqualified || 0
    ];
    
    scoreDistributionChart = new Chart(distributionCtx, {
        type: 'pie',
        data: {
            labels: ['优秀(≥90)', '良好(80-89)', '合格(60-79)', '不合格(<60)'],
            datasets: [{
                data: distData,
                backgroundColor: ['#43e97b', '#4facfe', '#ffd700', '#f5576c']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = distData.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    const trendCtx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trend.map(t => `${t.month}月`),
            datasets: [{
                label: '平均得分',
                data: trend.map(t => t.avgScore),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `平均得分: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const deptCtx = document.getElementById('deptChart').getContext('2d');
    if (deptChart) deptChart.destroy();
    const deptData = overview.deptStats || [];
    deptChart = new Chart(deptCtx, {
        type: 'bar',
        data: {
            labels: deptData.map(d => d.department),
            datasets: [{
                label: '平均得分',
                data: deptData.map(d => d.avgScore),
                backgroundColor: 'rgba(102, 126, 234, 0.8)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `平均得分: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function openEmployeeModal() {
    document.getElementById('employeeModalTitle').textContent = '添加员工';
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeModal').classList.add('active');
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
}

function editEmployee(id) {
    fetch(`/api/employees/${id}`)
        .then(response => response.json())
        .then(data => {
            const emp = data.data;
            document.getElementById('employeeModalTitle').textContent = '编辑员工';
            document.getElementById('employeeId').value = emp.id;
            document.getElementById('empEmployeeId').value = emp.employeeId;
            document.getElementById('empName').value = emp.name;
            document.getElementById('empDepartment').value = emp.department || '';
            document.getElementById('empPosition').value = emp.position || '';
            document.getElementById('empHireDate').value = emp.hireDate || '';
            document.getElementById('empEmail').value = emp.email || '';
            document.getElementById('empPhone').value = emp.phone || '';
            document.getElementById('empStatus').value = emp.status;
            document.getElementById('employeeModal').classList.add('active');
        })
        .catch(error => console.error('获取员工信息失败:', error));
}

function deleteEmployee(id) {
    if (confirm('确定要删除该员工吗？')) {
        fetch(`/api/employees/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadEmployees();
        })
        .catch(error => console.error('删除员工失败:', error));
    }
}

function openKPIModal() {
    document.getElementById('kpiModalTitle').textContent = '添加KPI指标';
    document.getElementById('kpiId').value = '';
    document.getElementById('kpiForm').reset();
    document.getElementById('kpiModal').classList.add('active');
}

function closeKPIModal() {
    document.getElementById('kpiModal').classList.remove('active');
}

function editKPI(id) {
    fetch(`/api/kpi/${id}`)
        .then(response => response.json())
        .then(data => {
            const kpi = data.data;
            document.getElementById('kpiModalTitle').textContent = '编辑KPI指标';
            document.getElementById('kpiId').value = kpi.id;
            document.getElementById('kpiCode').value = kpi.code;
            document.getElementById('kpiName').value = kpi.name;
            document.getElementById('kpiDescription').value = kpi.description || '';
            document.getElementById('kpiWeight').value = kpi.weight;
            document.getElementById('kpiUnit').value = kpi.unit || '';
            document.getElementById('kpiTargetValue').value = kpi.targetValue || '';
            document.getElementById('kpiCategory').value = kpi.category || '';
            document.getElementById('kpiStatus').value = kpi.status;
            document.getElementById('kpiModal').classList.add('active');
        })
        .catch(error => console.error('获取KPI信息失败:', error));
}

function deleteKPI(id) {
    if (confirm('确定要删除该KPI指标吗？')) {
        fetch(`/api/kpi/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadKPI();
        })
        .catch(error => console.error('删除KPI失败:', error));
    }
}

function initForms() {
    document.getElementById('employeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('employeeId').value;
        const employeeData = {
            employeeId: document.getElementById('empEmployeeId').value,
            name: document.getElementById('empName').value,
            department: document.getElementById('empDepartment').value,
            position: document.getElementById('empPosition').value,
            hireDate: document.getElementById('empHireDate').value,
            email: document.getElementById('empEmail').value,
            phone: document.getElementById('empPhone').value,
            status: document.getElementById('empStatus').value
        };

        const url = id ? `/api/employees/${id}` : '/api/employees';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closeEmployeeModal();
            loadEmployees();
        })
        .catch(error => console.error('保存员工失败:', error));
    });

    document.getElementById('kpiForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('kpiId').value;
        const kpiData = {
            code: document.getElementById('kpiCode').value,
            name: document.getElementById('kpiName').value,
            description: document.getElementById('kpiDescription').value,
            weight: parseFloat(document.getElementById('kpiWeight').value),
            unit: document.getElementById('kpiUnit').value,
            targetValue: document.getElementById('kpiTargetValue').value ? parseFloat(document.getElementById('kpiTargetValue').value) : null,
            category: document.getElementById('kpiCategory').value,
            status: document.getElementById('kpiStatus').value
        };

        const url = id ? `/api/kpi/${id}` : '/api/kpi';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(kpiData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closeKPIModal();
            loadKPI();
        })
        .catch(error => console.error('保存KPI失败:', error));
    });

    document.getElementById('performanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('perfId').value;
        const employeeId = document.getElementById('perfEmployee').value;
        const year = document.getElementById('perfYear').value;
        const month = document.getElementById('perfMonth').value;

        if (!employeeId || !year || !month) {
            alert('请选择员工、年份和月份');
            return;
        }

        const scoreInputs = document.querySelectorAll('.kpi-score');
        const kpiScores = [];
        let hasValidScore = false;
        scoreInputs.forEach(input => {
            const score = parseFloat(input.value) || 0;
            if (score > 0) hasValidScore = true;
            kpiScores.push({
                kpiId: parseInt(input.getAttribute('data-kpi-id')),
                score: score
            });
        });

        if (scoreInputs.length > 0 && !hasValidScore) {
            if (!confirm('KPI评分均为0，是否继续保存？')) {
                return;
            }
        }

        const performanceData = {
            employeeId: parseInt(employeeId),
            year: parseInt(year),
            month: parseInt(month),
            kpiScores: kpiScores,
            overallScore: parseFloat(document.getElementById('perfOverallScore').value) || 0,
            remarks: document.getElementById('perfRemarks').value
        };

        const url = id ? `/api/performance/${id}` : '/api/performance';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(performanceData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || '保存成功');
            closePerformanceModal();
            loadPerformance();
        })
        .catch(error => {
            console.error('保存考核记录失败:', error);
            alert(error.error || '保存失败，请重试');
        });
    });
}

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

let deptAvgChart = null;
let deptGradeChart = null;
let predictionChart = null;

function initAdvancedFilters() {
    const filters = ['deptCompYearFilter', 'predDeptFilter'];
    filters.forEach(filterId => {
        const select = document.getElementById(filterId);
        if (select && select.options.length <= 1) {
            const currentYear = new Date().getFullYear();
            for (let year = currentYear - 5; year <= currentYear + 1; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年';
                select.appendChild(option);
            }
        }
    });
}

function loadDepartmentComparison() {
    const year = document.getElementById('deptCompYearFilter').value;
    let url = '/api/performance/stats/department-comparison?';
    if (year) url += `year=${year}`;

    fetch(url)
        .then(response => response.json())
        .then(result => {
            renderDepartmentComparison(result.data);
        })
        .catch(error => {
            console.error('加载部门对比数据失败:', error);
        });
}

function renderDepartmentComparison(data) {
    if (!data || data.length === 0) {
        document.getElementById('deptComparisonTable').innerHTML = `
            <tr><td colspan="9" class="empty-state"><p>暂无部门对比数据</p></td></tr>
        `;
        return;
    }

    document.getElementById('deptComparisonTable').innerHTML = data.map(dept => `
        <tr>
            <td><strong>${dept.department}</strong></td>
            <td>${dept.employeeCount}</td>
            <td>${dept.avgScore}</td>
            <td>${dept.maxScore}</td>
            <td>${dept.minScore}</td>
            <td>${dept.scoreStdDev}</td>
            <td><span class="grade-badge excellent">${dept.excellentRate}%</span></td>
            <td><span class="grade-badge good">${dept.goodRate}%</span></td>
            <td><span class="grade-badge qualified">${dept.qualifiedRate}%</span></td>
        </tr>
    `).join('');

    const avgCtx = document.getElementById('deptAvgScoreChart').getContext('2d');
    if (deptAvgChart) deptAvgChart.destroy();
    deptAvgChart = new Chart(avgCtx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.department),
            datasets: [{
                label: '平均分',
                data: data.map(d => d.avgScore),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const gradeCtx = document.getElementById('deptGradeChart').getContext('2d');
    if (deptGradeChart) deptGradeChart.destroy();
    deptGradeChart = new Chart(gradeCtx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.department),
            datasets: [
                {
                    label: '优秀率',
                    data: data.map(d => d.excellentRate),
                    backgroundColor: 'rgba(67, 233, 123, 0.8)'
                },
                {
                    label: '良好率',
                    data: data.map(d => d.goodRate),
                    backgroundColor: 'rgba(79, 172, 254, 0.8)'
                },
                {
                    label: '合格率',
                    data: data.map(d => d.qualifiedRate),
                    backgroundColor: 'rgba(255, 215, 0, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: '百分比 (%)' }
                }
            }
        }
    });
}

function loadPrediction() {
    const department = document.getElementById('predDeptFilter').value;
    const months = document.getElementById('predMonthsFilter').value;
    
    let url = `/api/performance/stats/prediction?months=${months}`;
    if (department) url += `&department=${department}`;

    fetch(url)
        .then(response => response.json())
        .then(result => {
            renderPrediction(result.data);
        })
        .catch(error => {
            console.error('加载预测数据失败:', error);
        });
}

function renderPrediction(data) {
    if (!data || !data.hasEnoughData) {
        document.getElementById('trendStatus').textContent = '-';
        document.getElementById('dataPoints').textContent = '0';
        document.getElementById('r2Value').textContent = '0';
        document.getElementById('slopeValue').textContent = '0';
        document.getElementById('predictionTable').innerHTML = `
            <tr><td colspan="5" class="empty-state"><p>${data?.message || '数据不足，无法预测'}</p></td></tr>
        `;
        return;
    }

    const trendTexts = {
        'rising': '快速上升',
        'slowly_rising': '稳步上升',
        'stable': '保持稳定',
        'slowly_falling': '缓慢下降',
        'falling': '快速下降'
    };
    document.getElementById('trendStatus').textContent = trendTexts[data.trend] || '未知';
    document.getElementById('dataPoints').textContent = data.dataPoints;
    document.getElementById('r2Value').textContent = data.r2;
    document.getElementById('slopeValue').textContent = data.slope;

    document.getElementById('predictionTable').innerHTML = data.predictions.map(pred => {
        const grade = getGrade(pred.predictedScore);
        const gradeText = getGradeText(grade);
        return `
        <tr>
            <td>${pred.year}年${pred.month}月</td>
            <td><strong>${pred.predictedScore}</strong></td>
            <td><span class="status-badge grade-${grade}">${gradeText}</span></td>
            <td>${pred.lowerBound} ~ ${pred.upperBound}</td>
            <td>${pred.confidenceLevel}%</td>
        </tr>
    `}).join('');

    const ctx = document.getElementById('predictionChart').getContext('2d');
    if (predictionChart) predictionChart.destroy();

    const historicalLabels = data.historicalData.map(d => `${d.year}年${d.month}月`);
    const historicalScores = data.historicalData.map(d => d.avgScore);
    
    const predictionLabels = data.predictions.map(p => `${p.year}年${p.month}月`);
    const predictionScores = data.predictions.map(p => p.predictedScore);
    const lowerBounds = data.predictions.map(p => p.lowerBound);
    const upperBounds = data.predictions.map(p => p.upperBound);

    const allLabels = [...historicalLabels, ...predictionLabels];
    const fullHistorical = [...historicalScores, ...Array(data.predictions.length).fill(null)];
    const fullPrediction = [...Array(historicalScores.length).fill(null), ...predictionScores];
    const fullLower = [...Array(historicalScores.length).fill(null), ...lowerBounds];
    const fullUpper = [...Array(historicalScores.length).fill(null), ...upperBounds];

    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: '历史数据',
                    data: fullHistorical,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    borderWidth: 3
                },
                {
                    label: '预测值',
                    data: fullPrediction,
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    borderWidth: 3,
                    borderDash: [5, 5]
                },
                {
                    label: '置信区间上限',
                    data: fullUpper,
                    borderColor: 'rgba(245, 87, 108, 0.3)',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [2, 2]
                },
                {
                    label: '置信区间下限',
                    data: fullLower,
                    borderColor: 'rgba(245, 87, 108, 0.3)',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    fill: '-1',
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [2, 2]
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '绩效得分'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

let dashboardGradeChart = null;
let dashboardTrendChart = null;

function loadDashboardData() {
    Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/performance').then(r => r.json()),
        fetch('/api/performance/stats/overview').then(r => r.json()),
        fetch('/api/performance/stats/department-comparison').then(r => r.json()),
        fetch('/api/performance/stats/employee-ranking').then(r => r.json())
    ]).then(([employees, performance, overview, deptComp, empRanking]) => {
        renderDashboard(employees, performance, overview, deptComp, empRanking);
    }).catch(err => {
        console.error('加载仪表盘数据失败:', err);
    });
}

function renderDashboard(employees, performance, overview, deptComp, empRanking) {
    document.getElementById('totalEmployees').textContent = employees.data.length;
    document.getElementById('totalRecords').textContent = overview.data.totalRecords;
    document.getElementById('avgScore').textContent = overview.data.avgScore;
    
    const excellentRate = overview.data.totalRecords > 0 
        ? ((overview.data.scoreDistribution.excellent / overview.data.totalRecords) * 100).toFixed(1)
        : 0;
    document.getElementById('excellentRate').textContent = excellentRate + '%';

    const gradeCtx = document.getElementById('dashboardGradeChart').getContext('2d');
    if (dashboardGradeChart) dashboardGradeChart.destroy();
    dashboardGradeChart = new Chart(gradeCtx, {
        type: 'doughnut',
        data: {
            labels: ['优秀', '良好', '合格', '不合格'],
            datasets: [{
                data: [
                    overview.data.scoreDistribution.excellent,
                    overview.data.scoreDistribution.good,
                    overview.data.scoreDistribution.qualified,
                    overview.data.scoreDistribution.unqualified
                ],
                backgroundColor: ['#28a745', '#007bff', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    const monthlyData = {};
    performance.data.forEach(record => {
        const key = `${record.year}年${record.month}月`;
        if (!monthlyData[key]) {
            monthlyData[key] = { total: 0, count: 0 };
        }
        monthlyData[key].total += record.overallScore;
        monthlyData[key].count++;
    });

    const sortedKeys = Object.keys(monthlyData).slice(-6);
    const trendCtx = document.getElementById('dashboardTrendChart').getContext('2d');
    if (dashboardTrendChart) dashboardTrendChart.destroy();
    dashboardTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: sortedKeys,
            datasets: [{
                label: '平均得分',
                data: sortedKeys.map(k => (monthlyData[k].total / monthlyData[k].count).toFixed(2)),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { legend: { display: false } }
        }
    });

    const deptRankingHtml = deptComp.data.slice(0, 5).map((dept, index) => `
        <div class="ranking-item">
            <div class="rank-number rank-${index < 3 ? (index + 1) : 'other'}">${index + 1}</div>
            <div class="rank-name">${dept.department}</div>
            <div class="rank-score">${dept.avgScore}</div>
        </div>
    `).join('');
    document.getElementById('deptRankingContainer').innerHTML = deptRankingHtml || '<p style="text-align: center; color: #999; padding: 20px;">暂无数据</p>';

    const empRankingHtml = empRanking.data.slice(0, 5).map((emp, index) => `
        <div class="ranking-item">
            <div class="rank-number rank-${index < 3 ? (index + 1) : 'other'}">${index + 1}</div>
            <div class="rank-name">${emp.employeeName}</div>
            <div class="rank-score">${emp.avgScore}</div>
        </div>
    `).join('');
    document.getElementById('employeeRankingContainer').innerHTML = empRankingHtml || '<p style="text-align: center; color: #999; padding: 20px;">暂无数据</p>';

    const latestRecords = performance.data.slice(0, 5);
    const recordsHtml = latestRecords.map(record => {
        const grade = getGrade(record.overallScore);
        return `
        <tr>
            <td>${record.employeeName}</td>
            <td>${record.department || '-'}</td>
            <td>${record.year}年${record.month}月</td>
            <td>${record.overallScore}</td>
            <td><span class="status-badge grade-${grade}">${getGradeText(grade)}</span></td>
        </tr>
    `}).join('');
    document.getElementById('latestRecordsTable').innerHTML = recordsHtml || '<tr><td colspan="5" class="empty-state"><p>暂无考核记录</p></td></tr>';
}

function exportToExcel() {
    Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/performance').then(r => r.json()),
        fetch('/api/kpi').then(r => r.json())
    ]).then(([employees, performance, kpi]) => {
        const wb = XLSX.utils.book_new();

        const empData = employees.data.map(e => ({
            '员工编号': e.employeeId,
            '姓名': e.name,
            '部门': e.department || '-',
            '职位': e.position || '-',
            '入职日期': e.hireDate || '-',
            '邮箱': e.email || '-',
            '电话': e.phone || '-',
            '状态': e.status === 'active' ? '在职' : '离职'
        }));
        const empWs = XLSX.utils.json_to_sheet(empData);
        XLSX.utils.book_append_sheet(wb, empWs, '员工信息');

        const perfData = performance.data.map(p => ({
            '员工姓名': p.employeeName,
            '部门': p.department || '-',
            '年份': p.year,
            '月份': p.month,
            '综合得分': p.overallScore,
            '等级': getGradeText(getGrade(p.overallScore)),
            '备注': p.remarks || '-'
        }));
        const perfWs = XLSX.utils.json_to_sheet(perfData);
        XLSX.utils.book_append_sheet(wb, perfWs, '绩效考核记录');

        const kpiData = kpi.data.map(k => ({
            '指标编码': k.code,
            '指标名称': k.name,
            '描述': k.description || '-',
            '权重': k.weight,
            '单位': k.unit || '-',
            '目标值': k.targetValue || '-',
            '分类': k.category || '-',
            '状态': k.status === 'active' ? '启用' : '禁用'
        }));
        const kpiWs = XLSX.utils.json_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, kpiWs, 'KPI指标');

        XLSX.writeFile(wb, `员工绩效分析报告_${new Date().toLocaleDateString()}.xlsx`);
        alert('Excel报告导出成功！');
    }).catch(err => {
        console.error('导出失败:', err);
        alert('导出失败，请重试');
    });
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234);
    doc.text('员工绩效智能分析系统', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`报告生成时间: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

    const summaryData = document.querySelectorAll('.summary-value');
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text('关键指标概览', 20, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    const labels = ['员工总数', '考核记录', '平均得分', '优秀率'];
    summaryData.forEach((el, i) => {
        const x = 20 + i * 45;
        doc.setFillColor(240, 245, 255);
        doc.rect(x, 52, 40, 15, 'F');
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(12);
        doc.text(el.textContent, x + 20, 62, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(labels[i], x + 20, 70, { align: 'center' });
    });

    const canvas = await html2canvas(document.getElementById('dashboardGradeChart'), { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 20, 85, 80, 80);

    const trendCanvas = await html2canvas(document.getElementById('dashboardTrendChart'), { scale: 2 });
    const trendImgData = trendCanvas.toDataURL('image/png');
    doc.addImage(trendImgData, 'PNG', 110, 85, 80, 80);

    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(102, 126, 234);
    doc.text('员工信息', 20, 20);

    const employees = await fetch('/api/employees').then(r => r.json());
    let yPos = 35;
    doc.setFontSize(10);
    doc.setTextColor(50);
    
    const headers = ['员工编号', '姓名', '部门', '职位', '状态'];
    headers.forEach((h, i) => {
        doc.text(h, 20 + i * 35, yPos);
    });
    yPos += 8;

    employees.data.slice(0, 20).forEach(emp => {
        doc.setTextColor(80);
        doc.text(emp.employeeId, 20, yPos);
        doc.text(emp.name, 55, yPos);
        doc.text(emp.department || '-', 90, yPos);
        doc.text(emp.position || '-', 125, yPos);
        doc.text(emp.status === 'active' ? '在职' : '离职', 160, yPos);
        yPos += 7;
    });

    doc.save(`员工绩效分析报告_${new Date().toLocaleDateString()}.pdf`);
    alert('PDF报告导出成功！');
}

const originalInitTabs = initTabs;
initTabs = function() {
    originalInitTabs();
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'statistics') {
                setTimeout(() => {
                    initAdvancedFilters();
                    loadDepartmentComparison();
                    loadPrediction();
                }, 100);
            } else if (tabId === 'dashboard') {
                setTimeout(loadDashboardData, 100);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadDashboardData, 500);
});
