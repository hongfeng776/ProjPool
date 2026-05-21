import sequelize from '../config/database';
import Project from '../models/Project';

const seedProjects = [
  {
    name: '现代简约客厅设计',
    description: '采用现代简约风格，以白色和灰色为主色调，搭配原木色家具，营造温馨舒适的居住环境。',
    roomType: '客厅',
    area: 35.5,
    style: '现代简约',
    budget: 85000.00,
    status: 'completed',
  },
  {
    name: '北欧风主卧装修',
    description: '北欧风格卧室设计，强调自然光线和简洁线条，使用大量木质元素和绿植点缀。',
    roomType: '卧室',
    area: 22.0,
    style: '北欧',
    budget: 55000.00,
    status: 'in_progress',
  },
  {
    name: '新中式厨房改造',
    description: '将传统中式元素与现代厨房功能结合，使用实木橱柜和仿古瓷砖，兼具美观与实用。',
    roomType: '厨房',
    area: 15.0,
    style: '中式',
    budget: 68000.00,
    status: 'draft',
  },
  {
    name: '轻奢风格卫生间',
    description: '轻奢风格卫生间设计，大理石墙面搭配金色五金件，营造高品质生活体验。',
    roomType: '卫生间',
    area: 8.5,
    style: '轻奢',
    budget: 42000.00,
    status: 'completed',
  },
  {
    name: '日式禅意书房',
    description: '日式风格书房，榻榻米设计搭配矮桌和障子门，营造宁静的阅读工作空间。',
    roomType: '书房',
    area: 12.0,
    style: '日式',
    budget: 38000.00,
    status: 'draft',
  },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 开始播种数据库...');
    
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表已重置');
    
    await Project.bulkCreate(seedProjects as any);
    console.log(`✅ 成功插入 ${seedProjects.length} 条示例数据`);
    
    console.log('🎉 数据库播种完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库播种失败:', error);
    process.exit(1);
  }
};

seedDatabase();
