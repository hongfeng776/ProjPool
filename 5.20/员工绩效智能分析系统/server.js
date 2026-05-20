const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const employeeRoutes = require('./routes/employees');
const kpiRoutes = require('./routes/kpi');
const performanceRoutes = require('./routes/performance');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/employees', employeeRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/performance', performanceRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
