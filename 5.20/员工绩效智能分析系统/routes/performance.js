const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId } = require('../database/db');

router.get('/', (req, res) => {
    try {
        const data = loadData();
        const { employeeId, department, year, month } = req.query;
        
        let records = data.performance_records;
        
        if (employeeId) {
            records = records.filter(r => r.employeeId === parseInt(employeeId));
        }
        if (department) {
            records = records.filter(r => r.department === department);
        }
        if (year) {
            records = records.filter(r => r.year === parseInt(year));
        }
        if (month) {
            records = records.filter(r => r.month === parseInt(month));
        }
        
        records = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const recordsWithDetails = records.map(record => {
            const employee = data.employees.find(e => e.id === record.employeeId);
            return {
                ...record,
                employeeName: employee ? employee.name : '未知员工',
                employeeNo: employee ? employee.employeeId : ''
            };
        });
        
        res.json({ data: recordsWithDetails });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const data = loadData();
        const record = data.performance_records.find(r => r.id === parseInt(req.params.id));
        if (!record) {
            res.status(404).json({ error: '考核记录不存在' });
            return;
        }
        res.json({ data: record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const data = loadData();
        const { employeeId, year, month, kpiScores, overallScore, remarks } = req.body;
        
        const existing = data.performance_records.find(
            r => r.employeeId === parseInt(employeeId) && r.year === parseInt(year) && r.month === parseInt(month)
        );
        if (existing) {
            res.status(400).json({ error: '该员工该月的考核记录已存在' });
            return;
        }

        const employee = data.employees.find(e => e.id === parseInt(employeeId));
        if (!employee) {
            res.status(400).json({ error: '员工不存在' });
            return;
        }

        const newRecord = {
            id: generateId(data.performance_records),
            employeeId: parseInt(employeeId),
            department: employee.department,
            year: parseInt(year),
            month: parseInt(month),
            kpiScores: kpiScores || [],
            overallScore: parseFloat(overallScore) || 0,
            remarks: remarks || '',
            status: 'submitted',
            createdAt: new Date().toISOString()
        };

        data.performance_records.push(newRecord);
        saveData(data);

        res.status(201).json({
            id: newRecord.id,
            message: '考核记录添加成功'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.performance_records.findIndex(r => r.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: '考核记录不存在' });
            return;
        }

        const { kpiScores, overallScore, remarks, status } = req.body;

        data.performance_records[index] = {
            ...data.performance_records[index],
            kpiScores: kpiScores || data.performance_records[index].kpiScores,
            overallScore: parseFloat(overallScore) || data.performance_records[index].overallScore,
            remarks: remarks || data.performance_records[index].remarks,
            status: status || data.performance_records[index].status
        };

        saveData(data);
        res.json({ message: '考核记录更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.performance_records.findIndex(r => r.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: '考核记录不存在' });
            return;
        }

        data.performance_records.splice(index, 1);
        saveData(data);
        res.json({ message: '考核记录删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats/overview', (req, res) => {
    try {
        const data = loadData();
        const { year, month, department } = req.query;
        
        let records = data.performance_records;
        
        if (year) {
            records = records.filter(r => r.year === parseInt(year));
        }
        if (month) {
            records = records.filter(r => r.month === parseInt(month));
        }
        if (department) {
            records = records.filter(r => r.department === department);
        }

        const totalRecords = records.length;
        const avgScore = totalRecords > 0 
            ? parseFloat((records.reduce((sum, r) => sum + r.overallScore, 0) / totalRecords).toFixed(2))
            : 0;
        
        const scoreDistribution = {
            excellent: records.filter(r => r.overallScore >= 90).length,
            good: records.filter(r => r.overallScore >= 80 && r.overallScore < 90).length,
            qualified: records.filter(r => r.overallScore >= 60 && r.overallScore < 80).length,
            unqualified: records.filter(r => r.overallScore < 60).length
        };

        const departments = [...new Set(data.employees.map(e => e.department).filter(d => d))];
        const deptStats = departments.map(dept => {
            const deptRecords = records.filter(r => r.department === dept);
            const deptAvg = deptRecords.length > 0 
                ? parseFloat((deptRecords.reduce((sum, r) => sum + r.overallScore, 0) / deptRecords.length).toFixed(2))
                : 0;
            return {
                department: dept,
                count: deptRecords.length,
                avgScore: deptAvg
            };
        }).filter(d => d.count > 0);

        res.json({
            data: {
                totalRecords,
                avgScore,
                scoreDistribution,
                deptStats
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats/employee-ranking', (req, res) => {
    try {
        const data = loadData();
        const { year, month, department, limit = 10 } = req.query;
        
        let records = data.performance_records;
        
        if (year) {
            records = records.filter(r => r.year === parseInt(year));
        }
        if (month) {
            records = records.filter(r => r.month === parseInt(month));
        }
        if (department) {
            records = records.filter(r => r.department === department);
        }

        const employeeScores = {};
        records.forEach(record => {
            if (!employeeScores[record.employeeId]) {
                const employee = data.employees.find(e => e.id === record.employeeId);
                employeeScores[record.employeeId] = {
                    employeeId: record.employeeId,
                    employeeName: employee ? employee.name : '未知',
                    department: record.department,
                    totalScore: 0,
                    count: 0
                };
            }
            employeeScores[record.employeeId].totalScore += record.overallScore;
            employeeScores[record.employeeId].count++;
        });

        const ranking = Object.values(employeeScores)
            .map(es => ({
                ...es,
                avgScore: parseFloat((es.totalScore / es.count).toFixed(2))
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, parseInt(limit));

        res.json({ data: ranking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats/trend', (req, res) => {
    try {
        const data = loadData();
        const { year, employeeId } = req.query;
        
        let records = data.performance_records;
        
        if (year) {
            records = records.filter(r => r.year === parseInt(year));
        }
        if (employeeId) {
            records = records.filter(r => r.employeeId === parseInt(employeeId));
        }

        const monthlyData = {};
        for (let i = 1; i <= 12; i++) {
            monthlyData[i] = { month: i, records: [], avgScore: 0 };
        }

        records.forEach(record => {
            if (monthlyData[record.month]) {
                monthlyData[record.month].records.push(record);
            }
        });

        const trend = Object.values(monthlyData).map(m => {
            if (m.records.length > 0) {
                m.avgScore = parseFloat((m.records.reduce((sum, r) => sum + r.overallScore, 0) / m.records.length).toFixed(2));
            }
            delete m.records;
            return m;
        });

        res.json({ data: trend });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats/department-comparison', (req, res) => {
    try {
        const data = loadData();
        const { year } = req.query;
        
        let records = data.performance_records;
        if (year) {
            records = records.filter(r => r.year === parseInt(year));
        }

        const departments = [...new Set(data.employees.map(e => e.department).filter(d => d))];
        
        const deptComparison = departments.map(dept => {
            const deptRecords = records.filter(r => r.department === dept);
            const deptEmployees = data.employees.filter(e => e.department === dept && e.status === 'active');
            
            if (deptRecords.length === 0) {
                return {
                    department: dept,
                    employeeCount: deptEmployees.length,
                    recordCount: 0,
                    avgScore: 0,
                    maxScore: 0,
                    minScore: 0,
                    scoreStdDev: 0,
                    excellentRate: 0,
                    goodRate: 0,
                    qualifiedRate: 0,
                    unqualifiedRate: 0
                };
            }

            const scores = deptRecords.map(r => r.overallScore);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            
            const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
            const stdDev = Math.sqrt(variance);

            const excellent = scores.filter(s => s >= 90).length;
            const good = scores.filter(s => s >= 80 && s < 90).length;
            const qualified = scores.filter(s => s >= 60 && s < 80).length;
            const unqualified = scores.filter(s => s < 60).length;

            return {
                department: dept,
                employeeCount: deptEmployees.length,
                recordCount: deptRecords.length,
                avgScore: parseFloat(avgScore.toFixed(2)),
                maxScore: parseFloat(maxScore.toFixed(2)),
                minScore: parseFloat(minScore.toFixed(2)),
                scoreStdDev: parseFloat(stdDev.toFixed(2)),
                excellentRate: parseFloat(((excellent / deptRecords.length) * 100).toFixed(2)),
                goodRate: parseFloat(((good / deptRecords.length) * 100).toFixed(2)),
                qualifiedRate: parseFloat(((qualified / deptRecords.length) * 100).toFixed(2)),
                unqualifiedRate: parseFloat(((unqualified / deptRecords.length) * 100).toFixed(2))
            };
        }).filter(d => d.recordCount > 0);

        deptComparison.sort((a, b) => b.avgScore - a.avgScore);

        res.json({ data: deptComparison });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats/prediction', (req, res) => {
    try {
        const data = loadData();
        const { months = 3, department } = req.query;
        
        let records = data.performance_records;
        if (department) {
            records = records.filter(r => r.department === department);
        }

        if (records.length < 3) {
            return res.json({
                data: {
                    hasEnoughData: false,
                    message: '数据不足，至少需要3个月的历史数据进行预测',
                    predictions: [],
                    trend: 'stable'
                }
            });
        }

        const monthlyData = {};
        records.forEach(record => {
            const key = `${record.year}-${String(record.month).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { scores: [], month: record.month, year: record.year };
            }
            monthlyData[key].scores.push(record.overallScore);
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const historicalData = sortedMonths.map((key, index) => {
            const avg = monthlyData[key].scores.reduce((a, b) => a + b, 0) / monthlyData[key].scores.length;
            return {
                monthIndex: index,
                month: monthlyData[key].month,
                year: monthlyData[key].year,
                avgScore: parseFloat(avg.toFixed(2))
            };
        });

        if (historicalData.length < 3) {
            return res.json({
                data: {
                    hasEnoughData: false,
                    message: '数据不足，至少需要3个月的历史数据进行预测',
                    predictions: [],
                    trend: 'stable'
                }
            });
        }

        const n = historicalData.length;
        const sumX = historicalData.reduce((sum, d) => sum + d.monthIndex, 0);
        const sumY = historicalData.reduce((sum, d) => sum + d.avgScore, 0);
        const sumXY = historicalData.reduce((sum, d) => sum + d.monthIndex * d.avgScore, 0);
        const sumX2 = historicalData.reduce((sum, d) => sum + d.monthIndex * d.monthIndex, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        let trend = 'stable';
        if (slope > 2) trend = 'rising';
        else if (slope > 0.5) trend = 'slowly_rising';
        else if (slope < -2) trend = 'falling';
        else if (slope < -0.5) trend = 'slowly_falling';

        const lastMonth = historicalData[historicalData.length - 1];
        const predictions = [];
        const predictMonths = parseInt(months) || 3;

        for (let i = 1; i <= predictMonths; i++) {
            const nextIndex = lastMonth.monthIndex + i;
            let nextMonth = lastMonth.month + i;
            let nextYear = lastMonth.year;
            
            if (nextMonth > 12) {
                nextMonth -= 12;
                nextYear += 1;
            }

            const predictedScore = intercept + slope * nextIndex;
            const clampedScore = Math.max(0, Math.min(100, predictedScore));
            
            const residuals = historicalData.map(d => d.avgScore - (intercept + slope * d.monthIndex));
            const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)) || 5;
            const confidenceInterval = 1.96 * stdError;

            predictions.push({
                month: nextMonth,
                year: nextYear,
                predictedScore: parseFloat(clampedScore.toFixed(2)),
                lowerBound: parseFloat(Math.max(0, clampedScore - confidenceInterval).toFixed(2)),
                upperBound: parseFloat(Math.min(100, clampedScore + confidenceInterval).toFixed(2)),
                confidenceLevel: 95
            });
        }

        res.json({
            data: {
                hasEnoughData: true,
                historicalData: historicalData,
                predictions: predictions,
                trend: trend,
                slope: parseFloat(slope.toFixed(4)),
                intercept: parseFloat(intercept.toFixed(4)),
                r2: calculateR2(historicalData, slope, intercept),
                dataPoints: n
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function calculateR2(data, slope, intercept) {
    const yMean = data.reduce((sum, d) => sum + d.avgScore, 0) / data.length;
    const ssTotal = data.reduce((sum, d) => sum + Math.pow(d.avgScore - yMean, 2), 0);
    const ssResidual = data.reduce((sum, d) => {
        const predicted = intercept + slope * d.monthIndex;
        return sum + Math.pow(d.avgScore - predicted, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);
    return parseFloat(r2.toFixed(4));
}

module.exports = router;
