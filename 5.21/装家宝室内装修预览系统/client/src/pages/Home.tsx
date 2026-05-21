import { Row, Col, Card, Typography, Button, Space, Tag } from 'antd';
import { BulbOutlined, RocketOutlined, AppstoreOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BulbOutlined style={{ fontSize: 48, color: '#1677ff' }} />,
      title: '实时3D预览',
      desc: '基于Three.js和WebGL的高性能3D渲染，所见即所得',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: '多风格设计',
      desc: '支持现代简约、北欧、中式、轻奢等多种装修风格',
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: '项目管理',
      desc: '完整的项目生命周期管理，从设计到交付',
    },
    {
      icon: <PlayCircleOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      title: '交互操作',
      desc: '支持拖拽、旋转、缩放等交互操作，自由设计空间',
    },
  ];

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
        }}
        bodyStyle={{ padding: 48 }}
      >
        <Row align="middle">
          <Col span={14}>
            <Title
              level={1}
              style={{ color: '#fff', marginBottom: 16, fontSize: 42 }}
            >
              装家宝室内装修预览系统
            </Title>
            <Paragraph
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32 }}
            >
              基于 Three.js + WebGL 的现代化室内装修预览平台，
              帮助设计师和业主在施工前预览装修效果，降低决策风险。
            </Paragraph>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate('/projects')}
              >
                开始设计
              </Button>
              <Button
                size="large"
                ghost
                style={{ color: '#fff', borderColor: '#fff' }}
              >
                查看演示
              </Button>
            </Space>
          </Col>
          <Col span={10} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 200,
                height: 200,
                margin: '0 auto',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <BulbOutlined style={{ fontSize: 100, color: '#fff' }} />
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                {feature.icon}
                <Title level={4} style={{ marginTop: 16 }}>
                  {feature.title}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {feature.desc}
                </Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="技术栈">
        <Space size={[8, 8]} wrap>
          <Tag color="blue">React 18</Tag>
          <Tag color="green">Three.js</Tag>
          <Tag color="orange">WebGL</Tag>
          <Tag color="purple">TypeScript</Tag>
          <Tag color="cyan">Ant Design</Tag>
          <Tag color="magenta">Express</Tag>
          <Tag color="geekblue">PostgreSQL</Tag>
          <Tag color="red">Node.js</Tag>
          <Tag color="gold">Vite</Tag>
        </Space>
      </Card>
    </div>
  );
};
