const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, '../database/db.json');
const adapter = new JSONFile(file);

const defaultData = {
  movies: [
    {
      id: 1,
      title: '肖申克的救赎',
      poster: '',
      year: 1994,
      director: '弗兰克·德拉邦特',
      genre: ['剧情', '犯罪'],
      rating: 9.7,
      status: 'watched',
      watchDate: '2024-01-15',
      myRating: 9.5,
      comment: '经典中的经典，每次看都有新感悟',
      createdAt: '2024-01-15T10:00:00.000Z'
    }
  ],
  genres: [
    { id: 1, name: '动作' },
    { id: 2, name: '喜剧' },
    { id: 3, name: '剧情' },
    { id: 4, name: '科幻' },
    { id: 5, name: '恐怖' },
    { id: 6, name: '爱情' },
    { id: 7, name: '悬疑' },
    { id: 8, name: '犯罪' }
  ],
  users: [
    {
      id: 1,
      username: 'admin',
      avatar: ''
    }
  ]
};

const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
  } else {
    if (!db.data.movies) db.data.movies = defaultData.movies;
    if (!db.data.genres) db.data.genres = defaultData.genres;
    if (!db.data.users) db.data.users = defaultData.users;
  }
  await db.write();
  return db;
}

module.exports = { db, initDB };
