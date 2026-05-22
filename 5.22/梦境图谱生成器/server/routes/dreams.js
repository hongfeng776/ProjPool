const express = require('express');
const router = express.Router();
const {
  getDreams,
  getDreamById,
  createDream,
  updateDream,
  deleteDream,
  addKeyword,
  removeKeyword,
  getKeywordGraph
} = require('../db');

router.get('/', (req, res) => {
  const dreams = getDreams();
  res.json(dreams);
});

router.get('/keyword-graph', (req, res) => {
  const minConnections = parseInt(req.query.minConnections) || 1;
  const graph = getKeywordGraph(minConnections);
  res.json(graph);
});

router.get('/:id', (req, res) => {
  const dream = getDreamById(parseInt(req.params.id));
  if (!dream) {
    return res.status(404).json({ message: '梦境未找到' });
  }
  res.json(dream);
});

router.post('/', (req, res) => {
  const { title, description, tags, emotions, nodes, edges } = req.body;
  if (!title) {
    return res.status(400).json({ message: '标题不能为空' });
  }
  const newDream = createDream({
    title,
    description: description || '',
    tags: tags || [],
    emotions: emotions || [],
    nodes: nodes || [],
    edges: edges || []
  });
  res.status(201).json(newDream);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dream = getDreamById(id);
  if (!dream) {
    return res.status(404).json({ message: '梦境未找到' });
  }
  const updatedDream = updateDream(id, req.body);
  res.json(updatedDream);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dream = getDreamById(id);
  if (!dream) {
    return res.status(404).json({ message: '梦境未找到' });
  }
  deleteDream(id);
  res.json({ message: '梦境已删除' });
});

router.post('/:id/keywords', (req, res) => {
  const dreamId = parseInt(req.params.id);
  const { keyword, type } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ message: '关键词不能为空' });
  }
  
  const dream = getDreamById(dreamId);
  if (!dream) {
    return res.status(404).json({ message: '梦境未找到' });
  }
  
  const result = addKeyword(dreamId, keyword, type || 'tag');
  res.status(201).json(result);
});

router.delete('/:id/keywords/:keyword', (req, res) => {
  const dreamId = parseInt(req.params.id);
  const { keyword } = req.params;
  const { type } = req.query;
  
  const dream = getDreamById(dreamId);
  if (!dream) {
    return res.status(404).json({ message: '梦境未找到' });
  }
  
  removeKeyword(dreamId, decodeURIComponent(keyword), type || 'tag');
  res.json({ message: '关键词已删除' });
});

router.post('/generate-graph', (req, res) => {
  const { description } = req.body;
  
  const keywords = ['梦境', '幻想', '记忆', '情感', '潜意识'];
  const colors = ['#4FC3F7', '#E1BEE7', '#A5D6A7', '#FFCC80', '#F48FB1'];
  
  const nodes = keywords.map((word, i) => ({
    id: `node_${i}`,
    label: word,
    x: 300 + Math.cos(i * 2 * Math.PI / keywords.length) * 150,
    y: 250 + Math.sin(i * 2 * Math.PI / keywords.length) * 150,
    color: colors[i]
  }));
  
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.3) {
        edges.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }
  }
  
  res.json({ nodes, edges });
});

module.exports = router;
