const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'reading-capsule.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover TEXT,
    totalPages INTEGER DEFAULT 0,
    currentPage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reading_records (
    id TEXT PRIMARY KEY,
    bookId TEXT NOT NULL,
    bookTitle TEXT NOT NULL,
    date TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    pages INTEGER DEFAULT 0,
    note TEXT,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS capsules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    bookId TEXT,
    bookTitle TEXT,
    createdAt TEXT NOT NULL,
    openDate TEXT,
    isOpened INTEGER DEFAULT 0,
    mood TEXT,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE SET NULL
  );
`);

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

const initData = db.prepare('SELECT COUNT(*) as count FROM books').get();
if (initData.count === 0) {
  const today = formatLocalDate(new Date());
  
  const insertBook = db.prepare(`
    INSERT INTO books (id, title, author, cover, totalPages, currentPage, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecord = db.prepare(`
    INSERT INTO reading_records (id, bookId, bookTitle, date, duration, pages, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCapsule = db.prepare(`
    INSERT INTO capsules (id, title, content, bookId, bookTitle, createdAt, openDate, isOpened, mood)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBook.run(
    '1',
    '百年孤独',
    '加西亚·马尔克斯',
    'https://picsum.photos/seed/book1/200/300',
    360,
    120,
    'reading',
    addDays(today, -30)
  );

  insertBook.run(
    '2',
    '活着',
    '余华',
    'https://picsum.photos/seed/book2/200/300',
    200,
    200,
    'completed',
    addDays(today, -60)
  );

  insertBook.run(
    '3',
    '三体',
    '刘慈欣',
    'https://picsum.photos/seed/book3/200/300',
    500,
    250,
    'reading',
    addDays(today, -15)
  );

  insertRecord.run(
    '1',
    '1',
    '百年孤独',
    addDays(today, -5),
    45,
    30,
    '今天读了关于布恩迪亚家族的起源，很有感触...'
  );

  insertRecord.run(
    '2',
    '1',
    '百年孤独',
    addDays(today, -3),
    60,
    40,
    '魔幻现实主义的写法太精彩了'
  );

  insertRecord.run(
    '3',
    '3',
    '三体',
    addDays(today, -2),
    90,
    80,
    '三体游戏的设定太震撼了！'
  );

  insertCapsule.run(
    '1',
    '今天就能开启！',
    '恭喜你！坚持阅读了这么久。这个胶囊是给今天的你的奖励。继续加油，保持阅读的好习惯！',
    '1',
    '百年孤独',
    addDays(today, -7),
    today,
    0,
    'excited'
  );

  insertCapsule.run(
    '2',
    '明天的惊喜',
    '当你打开这个胶囊时，希望你已经完成了这周的阅读目标。记得奖励自己一下！',
    '3',
    '三体',
    addDays(today, -3),
    addDays(today, 1),
    0,
    'happy'
  );

  insertCapsule.run(
    '3',
    '3天后见',
    '这是一个测试胶囊，3天后你会再次看到它。到时候看看自己读了多少页书吧！',
    '1',
    '百年孤独',
    today,
    addDays(today, 3),
    0,
    'peaceful'
  );

  insertCapsule.run(
    '4',
    '一周后的约定',
    '一周的时间很快就过去了。这一周你读了哪些书？有什么新的感悟吗？',
    '3',
    '三体',
    addDays(today, -1),
    addDays(today, 7),
    0,
    'thoughtful'
  );

  insertCapsule.run(
    '5',
    '读完《活着》的感想',
    '福贵的一生让我明白了生命的韧性。无论遭遇什么，活着本身就是意义。',
    '2',
    '活着',
    addDays(today, -50),
    addDays(today, -30),
    1,
    'nostalgic'
  );

  console.log('初始数据已插入');
}

module.exports = db;
