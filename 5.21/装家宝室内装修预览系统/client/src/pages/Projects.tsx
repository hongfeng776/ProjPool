import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { projectApi, uploadApi } from '../services/api';
import {
  Project,
  ProjectCreate,
  ROOM_TYPES,
  DESIGN_STYLES,
  STATUS_OPTIONS,
} from '../types';

export const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [form] = Form.useForm();

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    try {
      const res = await projectApi.getAll({ page, limit: 10 });
      setProjects(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setThumbnailUrl(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setThumbnailUrl(project.thumbnail);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      roomType: project.roomType,
      area: project.area,
      style: project.style,
      budget: project.budget,
      status: project.status,
    });
    setModalVisible(true);
  };

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const originFile = (file as any).originFileObj || file;
      const res = await uploadApi.uploadFloorPlan(originFile as File);
      if (res.success && res.data) {
        setThumbnailUrl(res.data.url);
        message.success('户型图上传成功');
        onSuccess?.(res.data);
      } else {
        message.error(res.message || '上传失败');
        onError?.(new Error(res.message));
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '上传失败');
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await projectApi.delete(id);
      message.success('删除成功');
      fetchProjects(pagination.page);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = { ...values, thumbnail: thumbnailUrl };
      if (editingProject) {
        await projectApi.update(editingProject.id, submitData);
        message.success('更新成功');
      } else {
        await projectApi.create(submitData as ProjectCreate);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchProjects(pagination.page);
    } catch (error) {
      // 表单校验失败
    }
  };

  const getStatusTag = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return <Tag color={option?.color as string}>{option?.label}</Tag>;
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    draft: projects.filter((p) => p.status === 'draft').length,
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: '空间类型',
      dataIndex: 'roomType',
      key: 'roomType',
      width: 100,
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (val: number) => `${val} ㎡`,
    },
    {
      title: '风格',
      dataIndex: 'style',
      key: 'style',
      width: 120,
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (val: number) => `¥${Number(val).toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Project) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/scene/${record.id}`)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该项目？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={pagination.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#1677ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              valueStyle={{ color: '#999' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="项目列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建项目
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={projects}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => fetchProjects(page),
          }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="确定"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomType"
                label="空间类型"
                rules={[{ required: true, message: '请选择空间类型' }]}
              >
                <Select placeholder="请选择空间类型" options={ROOM_TYPES} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="area"
                label="面积（㎡）"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber
                  placeholder="请输入面积"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="style"
                label="装修风格"
                rules={[{ required: true, message: '请选择装修风格' }]}
              >
                <Select placeholder="请选择装修风格" options={DESIGN_STYLES} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="预算（元）"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <InputNumber
                  placeholder="请输入预算"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          {editingProject && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="状态">
                  <Select
                    placeholder="请选择状态"
                    options={STATUS_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="户型图">
                <Upload
                  listType="picture-card"
                  customRequest={handleUpload}
                  maxCount={1}
                  accept="image/*"
                  fileList={
                    thumbnailUrl
                      ? [
                          {
                            uid: '-1',
                            name: 'floorplan.jpg',
                            status: 'done',
                            url: thumbnailUrl.startsWith('http')
                              ? thumbnailUrl
                              : `http://localhost:3001${thumbnailUrl}`,
                          },
                        ]
                      : []
                  }
                  onRemove={() => {
                    setThumbnailUrl(undefined);
                    return true;
                  }}
                >
                  {!thumbnailUrl && !uploading && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>上传户型图</div>
                    </div>
                  )}
                  {uploading && (
                    <div>
                      <UploadOutlined spin />
                      <div style={{ marginTop: 8 }}>上传中...</div>
                    </div>
                  )}
                </Upload>
                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  支持 JPG、PNG、GIF、WebP 格式，最大 10MB
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="项目描述">
                <Input.TextArea
                  placeholder="请输入项目描述"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
