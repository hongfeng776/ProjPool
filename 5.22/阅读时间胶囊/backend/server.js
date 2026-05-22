const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./database');
const booksRouter = require('./routes/books');
const readingRecordsRouter = require('./routes/readingRecords');
const capsulesRouter = require('./routes/capsules');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '阅读时间胶囊服务运行中' });
});

app.use('/api/books', booksRouter);
app.use('/api/reading-records', readingRecordsRouter);
app.use('/api/capsules', capsulesRouter);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
