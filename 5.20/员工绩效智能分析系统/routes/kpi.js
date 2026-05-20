const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId } = require('../database/db');

router.get('/', (req, res) => {
    try {
        const data = loadData();
        const kpis = data.kpi_indicators.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ data: kpis });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const data = loadData();
        const kpi = data.kpi_indicators.find(k => k.id === parseInt(req.params.id));
        if (!kpi) {
            res.status(404).json({ error: 'KPI指标不存在' });
            return;
        }
        res.json({ data: kpi });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const data = loadData();
        const { name, code, description, weight, unit, targetValue, category } = req.body;
        
        const existing = data.kpi_indicators.find(k => k.code === code);
        if (existing) {
            res.status(400).json({ error: 'KPI编码已存在' });
            return;
        }

        const newKPI = {
            id: generateId(data.kpi_indicators),
            name,
            code,
            description: description || '',
            weight: parseFloat(weight),
            unit: unit || '',
            targetValue: targetValue ? parseFloat(targetValue) : null,
            category: category || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        data.kpi_indicators.push(newKPI);
        saveData(data);

        res.status(201).json({
            id: newKPI.id,
            message: 'KPI指标添加成功'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.kpi_indicators.findIndex(k => k.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: 'KPI指标不存在' });
            return;
        }

        const { name, code, description, weight, unit, targetValue, category, status } = req.body;

        const existing = data.kpi_indicators.find(k => k.code === code && k.id !== parseInt(req.params.id));
        if (existing) {
            res.status(400).json({ error: 'KPI编码已存在' });
            return;
        }

        data.kpi_indicators[index] = {
            ...data.kpi_indicators[index],
            name,
            code,
            description: description || '',
            weight: parseFloat(weight),
            unit: unit || '',
            targetValue: targetValue ? parseFloat(targetValue) : null,
            category: category || '',
            status: status || 'active'
        };

        saveData(data);
        res.json({ message: 'KPI指标更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.kpi_indicators.findIndex(k => k.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: 'KPI指标不存在' });
            return;
        }

        data.kpi_indicators.splice(index, 1);
        saveData(data);
        res.json({ message: 'KPI指标删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
