const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.json');

function loadData() {
    if (!fs.existsSync(dbPath)) {
        const initialData = {
            employees: [],
            kpi_indicators: [],
            performance_records: []
        };
        saveData(initialData);
        return initialData;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function saveData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(arr) {
    if (arr.length === 0) return 1;
    return Math.max(...arr.map(item => item.id)) + 1;
}

module.exports = {
    loadData,
    saveData,
    generateId
};
