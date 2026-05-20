const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId } = require('../database/db');

router.get('/', (req, res) => {
    try {
        const data = loadData();
        const employees = data.employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ data: employees });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const data = loadData();
        const employee = data.employees.find(e => e.id === parseInt(req.params.id));
        if (!employee) {
            res.status(404).json({ error: '员工不存在' });
            return;
        }
        res.json({ data: employee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const data = loadData();
        const { name, employeeId, department, position, hireDate, email, phone } = req.body;
        
        const existing = data.employees.find(e => e.employeeId === employeeId);
        if (existing) {
            res.status(400).json({ error: '员工编号已存在' });
            return;
        }

        const newEmployee = {
            id: generateId(data.employees),
            name,
            employeeId,
            department: department || '',
            position: position || '',
            hireDate: hireDate || '',
            email: email || '',
            phone: phone || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        data.employees.push(newEmployee);
        saveData(data);

        res.status(201).json({
            id: newEmployee.id,
            message: '员工添加成功'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.employees.findIndex(e => e.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: '员工不存在' });
            return;
        }

        const { name, employeeId, department, position, hireDate, email, phone, status } = req.body;

        const existing = data.employees.find(e => e.employeeId === employeeId && e.id !== parseInt(req.params.id));
        if (existing) {
            res.status(400).json({ error: '员工编号已存在' });
            return;
        }

        data.employees[index] = {
            ...data.employees[index],
            name,
            employeeId,
            department: department || '',
            position: position || '',
            hireDate: hireDate || '',
            email: email || '',
            phone: phone || '',
            status: status || 'active'
        };

        saveData(data);
        res.json({ message: '员工信息更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const data = loadData();
        const index = data.employees.findIndex(e => e.id === parseInt(req.params.id));
        
        if (index === -1) {
            res.status(404).json({ error: '员工不存在' });
            return;
        }

        data.employees.splice(index, 1);
        saveData(data);
        res.json({ message: '员工删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
