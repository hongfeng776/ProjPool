const memberLevels = [
  {
    name: '普通会员',
    minPoints: 0,
    maxPoints: 999,
    discount: 1.0,
    color: '#909399'
  },
  {
    name: '银卡会员',
    minPoints: 1000,
    maxPoints: 4999,
    discount: 0.95,
    color: '#C0C0C0'
  },
  {
    name: '金卡会员',
    minPoints: 5000,
    maxPoints: 19999,
    discount: 0.9,
    color: '#FFD700'
  },
  {
    name: '钻石会员',
    minPoints: 20000,
    maxPoints: Infinity,
    discount: 0.85,
    color: '#00BFFF'
  }
]

function getLevelByPoints(points) {
  const p = parseInt(points) || 0
  for (let i = memberLevels.length - 1; i >= 0; i--) {
    if (p >= memberLevels[i].minPoints) {
      return memberLevels[i]
    }
  }
  return memberLevels[0]
}

function getLevelByName(name) {
  return memberLevels.find(l => l.name === name) || memberLevels[0]
}

module.exports = {
  memberLevels,
  getLevelByPoints,
  getLevelByName
}
