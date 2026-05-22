const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'dream_graph.db');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log('数据库加载成功');
  } else {
    db = new SQL.Database();
    console.log('新数据库创建成功');
  }
  
  createTables();
  saveDatabase();
}

function execQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS dreams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dream_id INTEGER,
      keyword TEXT NOT NULL,
      type TEXT DEFAULT 'tag',
      FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      dream_id INTEGER,
      label TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      color TEXT,
      FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dream_id INTEGER,
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      FOREIGN KEY (dream_id) REFERENCES dreams(id) ON DELETE CASCADE
    )
  `);

  const result = execQuery('SELECT COUNT(*) as count FROM dreams');
  if (result.length > 0 && result[0].count === 0) {
    insertSampleData();
  }
}

function insertSampleData() {
  const dreamsData = [
    {
      title: '飞翔的梦境',
      description: '在云端自由翱翔，俯瞰大地',
      date: '2026-05-20',
      tags: ['自由', '天空', '飞翔', '云朵', '风'],
      emotions: ['愉悦', '轻松', '自由'],
      nodes: [
        { id: 'n1', label: '飞翔', x: 400, y: 150, color: '#4FC3F7' },
        { id: 'n2', label: '云朵', x: 250, y: 250, color: '#E1BEE7' },
        { id: 'n3', label: '天空', x: 550, y: 250, color: '#81D4FA' },
        { id: 'n4', label: '自由', x: 400, y: 350, color: '#A5D6A7' }
      ],
      edges: [
        { source: 'n1', target: 'n2' },
        { source: 'n1', target: 'n3' },
        { source: 'n1', target: 'n4' },
        { source: 'n2', target: 'n3' }
      ]
    },
    {
      title: '深海探险',
      description: '潜入神秘的海底世界，探索未知的洞穴',
      date: '2026-05-18',
      tags: ['海洋', '探险', '神秘', '洞穴', '鱼群'],
      emotions: ['好奇', '紧张', '兴奋'],
      nodes: [
        { id: 'd1', label: '海洋', x: 400, y: 150, color: '#2196F3' },
        { id: 'd2', label: '探险', x: 250, y: 280, color: '#FF9800' },
        { id: 'd3', label: '神秘', x: 550, y: 280, color: '#9C27B0' }
      ],
      edges: [
        { source: 'd1', target: 'd2' },
        { source: 'd1', target: 'd3' }
      ]
    },
    {
      title: '校园回忆',
      description: '回到熟悉的校园，遇见老朋友',
      date: '2026-05-15',
      tags: ['校园', '回忆', '朋友', '教室', '青春'],
      emotions: ['怀念', '温馨', '快乐'],
      nodes: [
        { id: 's1', label: '校园', x: 400, y: 200, color: '#4CAF50' },
        { id: 's2', label: '回忆', x: 280, y: 320, color: '#E91E63' },
        { id: 's3', label: '朋友', x: 520, y: 320, color: '#FFEB3B' }
      ],
      edges: [
        { source: 's1', target: 's2' },
        { source: 's1', target: 's3' },
        { source: 's2', target: 's3' }
      ]
    },
    {
      title: '迷失森林',
      description: '在茂密的森林中迷失方向，寻找出口',
      date: '2026-05-12',
      tags: ['森林', '迷失', '神秘', '树木', '冒险'],
      emotions: ['恐惧', '焦虑', '希望'],
      nodes: [
        { id: 'f1', label: '森林', x: 400, y: 180, color: '#8BC34A' },
        { id: 'f2', label: '迷失', x: 300, y: 320, color: '#795548' },
        { id: 'f3', label: '冒险', x: 500, y: 320, color: '#FF5722' }
      ],
      edges: [
        { source: 'f1', target: 'f2' },
        { source: 'f1', target: 'f3' }
      ]
    },
    {
      title: '星空漫步',
      description: '在浩瀚的星空中漫步，感受宇宙的广阔',
      date: '2026-05-10',
      tags: ['星空', '宇宙', '星星', '银河', '自由'],
      emotions: ['震撼', '平静', '自由', '惊奇'],
      nodes: [
        { id: 'st1', label: '星空', x: 400, y: 180, color: '#3F51B5' },
        { id: 'st2', label: '宇宙', x: 280, y: 320, color: '#00BCD4' },
        { id: 'st3', label: '自由', x: 520, y: 320, color: '#CDDC39' }
      ],
      edges: [
        { source: 'st1', target: 'st2' },
        { source: 'st1', target: 'st3' },
        { source: 'st2', target: 'st3' }
      ]
    }
  ];

  dreamsData.forEach(dreamData => {
    db.run('INSERT INTO dreams (title, description, date) VALUES (?, ?, ?)', 
      [dreamData.title, dreamData.description, dreamData.date]);

    const result = execQuery('SELECT last_insert_rowid() as id');
    const dreamId = result[0].id;

    dreamData.tags.forEach(tag => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [dreamId, tag, 'tag']);
    });

    dreamData.emotions.forEach(emotion => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [dreamId, emotion, 'emotion']);
    });

    dreamData.nodes.forEach(node => {
      db.run('INSERT INTO nodes (id, dream_id, label, x, y, color) VALUES (?, ?, ?, ?, ?, ?)', 
        [node.id, dreamId, node.label, node.x, node.y, node.color]);
    });

    dreamData.edges.forEach(edge => {
      db.run('INSERT INTO edges (dream_id, source, target) VALUES (?, ?, ?)', 
        [dreamId, edge.source, edge.target]);
    });
  });

  console.log(`成功插入 ${dreamsData.length} 个梦境示例数据`);
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function getDreams() {
  const dreamsResult = execQuery('SELECT * FROM dreams ORDER BY date DESC');
  if (dreamsResult.length === 0) return [];

  const dreams = dreamsResult.map(row => {
    const dream = {
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      tags: [],
      emotions: [],
      nodes: [],
      edges: []
    };

    const keywordsResult = execQuery('SELECT keyword, type FROM keywords WHERE dream_id = ?', [dream.id]);
    keywordsResult.forEach(kw => {
      if (kw.type === 'tag') {
        dream.tags.push(kw.keyword);
      } else {
        dream.emotions.push(kw.keyword);
      }
    });

    const nodesResult = execQuery('SELECT id, label, x, y, color FROM nodes WHERE dream_id = ?', [dream.id]);
    dream.nodes = nodesResult.map(node => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      color: node.color
    }));

    const edgesResult = execQuery('SELECT source, target FROM edges WHERE dream_id = ?', [dream.id]);
    dream.edges = edgesResult.map(edge => ({
      source: edge.source,
      target: edge.target
    }));

    return dream;
  });

  return dreams;
}

function getDreamById(id) {
  const result = execQuery('SELECT * FROM dreams WHERE id = ?', [id]);
  if (result.length === 0) return null;

  const row = result[0];
  const dream = {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    tags: [],
    emotions: [],
    nodes: [],
    edges: []
  };

  const keywordsResult = execQuery('SELECT keyword, type FROM keywords WHERE dream_id = ?', [id]);
  keywordsResult.forEach(kw => {
    if (kw.type === 'tag') {
      dream.tags.push(kw.keyword);
    } else {
      dream.emotions.push(kw.keyword);
    }
  });

  const nodesResult = execQuery('SELECT id, label, x, y, color FROM nodes WHERE dream_id = ?', [id]);
  dream.nodes = nodesResult.map(node => ({
    id: node.id,
    label: node.label,
    x: node.x,
    y: node.y,
    color: node.color
  }));

  const edgesResult = execQuery('SELECT source, target FROM edges WHERE dream_id = ?', [id]);
  dream.edges = edgesResult.map(edge => ({
    source: edge.source,
    target: edge.target
  }));

  return dream;
}

function createDream(data) {
  const { title, description, tags, emotions, nodes, edges } = data;
  const date = new Date().toISOString().split('T')[0];

  db.run('INSERT INTO dreams (title, description, date) VALUES (?, ?, ?)', 
    [title, description || '', date]);
  
  const result = execQuery('SELECT last_insert_rowid() as id');
  const dreamId = result[0].id;

  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [dreamId, tag, 'tag']);
    });
  }

  if (emotions && emotions.length > 0) {
    emotions.forEach(emotion => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [dreamId, emotion, 'emotion']);
    });
  }

  if (nodes && nodes.length > 0) {
    nodes.forEach(node => {
      db.run('INSERT INTO nodes (id, dream_id, label, x, y, color) VALUES (?, ?, ?, ?, ?, ?)', 
        [node.id, dreamId, node.label, node.x, node.y, node.color]);
    });
  }

  if (edges && edges.length > 0) {
    edges.forEach(edge => {
      db.run('INSERT INTO edges (dream_id, source, target) VALUES (?, ?, ?)', 
        [dreamId, edge.source, edge.target]);
    });
  }

  saveDatabase();
  return getDreamById(dreamId);
}

function updateDream(id, data) {
  const { title, description, tags, emotions, nodes, edges } = data;

  if (title !== undefined) {
    db.run('UPDATE dreams SET title = ? WHERE id = ?', [title, id]);
  }
  if (description !== undefined) {
    db.run('UPDATE dreams SET description = ? WHERE id = ?', [description, id]);
  }

  if (tags !== undefined) {
    db.run('DELETE FROM keywords WHERE dream_id = ? AND type = ?', [id, 'tag']);
    tags.forEach(tag => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [id, tag, 'tag']);
    });
  }

  if (emotions !== undefined) {
    db.run('DELETE FROM keywords WHERE dream_id = ? AND type = ?', [id, 'emotion']);
    emotions.forEach(emotion => {
      db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [id, emotion, 'emotion']);
    });
  }

  if (nodes !== undefined) {
    db.run('DELETE FROM nodes WHERE dream_id = ?', [id]);
    nodes.forEach(node => {
      db.run('INSERT INTO nodes (id, dream_id, label, x, y, color) VALUES (?, ?, ?, ?, ?, ?)', 
        [node.id, id, node.label, node.x, node.y, node.color]);
    });
  }

  if (edges !== undefined) {
    db.run('DELETE FROM edges WHERE dream_id = ?', [id]);
    edges.forEach(edge => {
      db.run('INSERT INTO edges (dream_id, source, target) VALUES (?, ?, ?)', 
        [id, edge.source, edge.target]);
    });
  }

  saveDatabase();
  return getDreamById(id);
}

function deleteDream(id) {
  db.run('DELETE FROM keywords WHERE dream_id = ?', [id]);
  db.run('DELETE FROM nodes WHERE dream_id = ?', [id]);
  db.run('DELETE FROM edges WHERE dream_id = ?', [id]);
  db.run('DELETE FROM dreams WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

function addKeyword(dreamId, keyword, type = 'tag') {
  db.run('INSERT INTO keywords (dream_id, keyword, type) VALUES (?, ?, ?)', [dreamId, keyword, type]);
  saveDatabase();
  return { dreamId, keyword, type };
}

function removeKeyword(dreamId, keyword, type = 'tag') {
  db.run('DELETE FROM keywords WHERE dream_id = ? AND keyword = ? AND type = ?', [dreamId, keyword, type]);
  saveDatabase();
  return true;
}

function getKeywordGraph(minConnections = 1) {
  const allKeywords = execQuery(`
    SELECT k.keyword, k.type, COUNT(*) as count
    FROM keywords k
    GROUP BY k.keyword, k.type
    ORDER BY count DESC
  `);

  if (allKeywords.length === 0) {
    return { nodes: [], edges: [] };
  }

  const dreamKeywords = execQuery(`
    SELECT dream_id, keyword, type
    FROM keywords
    ORDER BY dream_id
  `);

  const dreamsMap = {};
  dreamKeywords.forEach(row => {
    if (!dreamsMap[row.dream_id]) {
      dreamsMap[row.dream_id] = new Set();
    }
    dreamsMap[row.dream_id].add(row.keyword);
  });

  const connections = {};
  Object.values(dreamsMap).forEach(keywordSet => {
    const keywords = Array.from(keywordSet);
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const key = [keywords[i], keywords[j]].sort().join('|||');
        connections[key] = (connections[key] || 0) + 1;
      }
    }
  });

  const keywordTypeMap = {};
  allKeywords.forEach(kw => {
    keywordTypeMap[kw.keyword] = kw.type;
  });

  const connectedKeywords = new Set();
  Object.entries(connections).forEach(([key, count]) => {
    if (count >= minConnections) {
      const [kw1, kw2] = key.split('|||');
      connectedKeywords.add(kw1);
      connectedKeywords.add(kw2);
    }
  });

  allKeywords.forEach(kw => {
    if (kw.count >= 1) {
      connectedKeywords.add(kw.keyword);
    }
  });

  const typeColors = {
    tag: '#64B5F6',
    emotion: '#81C784'
  };

  const nodes = [];
  const nodePositions = {};
  const centerX = 400;
  const centerY = 250;
  const radius = 180;

  const keywordList = Array.from(connectedKeywords);
  keywordList.forEach((keyword, index) => {
    const angle = (index / keywordList.length) * 2 * Math.PI;
    const x = Math.round(centerX + Math.cos(angle) * radius);
    const y = Math.round(centerY + Math.sin(angle) * radius);
    const kwData = allKeywords.find(k => k.keyword === keyword);
    const type = keywordTypeMap[keyword] || 'tag';
    
    const node = {
      id: keyword,
      label: keyword,
      x: x,
      y: y,
      color: typeColors[type] || '#64B5F6',
      count: kwData ? kwData.count : 1,
      type: type
    };
    nodes.push(node);
    nodePositions[keyword] = node;
  });

  const edges = [];
  Object.entries(connections).forEach(([key, count]) => {
    if (count >= minConnections) {
      const [kw1, kw2] = key.split('|||');
      if (kw1 !== kw2 && nodePositions[kw1] && nodePositions[kw2]) {
        edges.push({
          source: kw1,
          target: kw2,
          weight: count
        });
      }
    }
  });

  return { nodes, edges };
}

module.exports = {
  initDatabase,
  getDreams,
  getDreamById,
  createDream,
  updateDream,
  deleteDream,
  addKeyword,
  removeKeyword,
  getKeywordGraph
};
