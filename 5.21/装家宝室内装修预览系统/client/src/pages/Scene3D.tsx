import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  Layout,
  Menu,
  Card,
  Button,
  Space,
  InputNumber,
  Typography,
  Tag,
  Empty,
  Tooltip,
  Divider,
  Collapse,
  message,
  Segmented,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  HomeOutlined,
  ArrowsAltOutlined,
  SaveOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
  BgColorsOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { SceneManager, SelectedObjectInfo } from '../three/sceneManager';
import {
  FURNITURE_LIBRARY,
  FURNITURE_CATEGORIES,
  FurnitureItem,
  PlacedFurniture,
} from '../three/types';
import {
  MaterialPreset,
  MaterialCategory,
  WALL_MATERIALS,
  FLOOR_MATERIALS,
  WOOD_MATERIALS,
  FABRIC_MATERIALS,
  LEATHER_MATERIALS,
  METAL_MATERIALS,
  MARBLE_MATERIALS,
  getFriendlyCategoryName,
} from '../three/materialLibrary';
import { projectApi } from '../services/api';
import { Project } from '../types';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const MATERIAL_CATEGORY_TABS = [
  { key: 'furniture-wood', label: '木质' },
  { key: 'furniture-fabric', label: '布艺' },
  { key: 'furniture-leather', label: '皮革' },
  { key: 'furniture-metal', label: '金属' },
  { key: 'furniture-marble', label: '大理石' },
];

export const Scene3D = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedFurniture, setSelectedFurniture] = useState<PlacedFurniture | null>(null);
  const [selectedObject, setSelectedObject] = useState<SelectedObjectInfo | null>(null);
  const [placedList, setPlacedList] = useState<PlacedFurniture[]>([]);
  const [activePanel, setActivePanel] = useState<string[]>(['furniture', 'materials']);
  const [materialCategory, setMaterialCategory] = useState<MaterialCategory>('furniture-wood');
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [applyToAllWalls, setApplyToAllWalls] = useState(true);

  useEffect(() => {
    if (!id) return;

    projectApi.getById(Number(id)).then((res) => {
      if (res.success && res.data) {
        setProject(res.data);

        if (canvasContainerRef.current && !sceneManagerRef.current) {
          const sm = new SceneManager(canvasContainerRef.current, {
            onFurnitureSelect: (f) => {
              setSelectedFurniture(f);
              if (f) {
                setSelectedObject(null);
                setMaterialCategory('furniture-wood');
              }
            },
            onFurnitureUpdate: () => {
              if (sceneManagerRef.current) {
                setPlacedList(sceneManagerRef.current.getAllFurniture());
              }
            },
            onFurnitureAdd: () => {
              if (sceneManagerRef.current) {
                setPlacedList(sceneManagerRef.current.getAllFurniture());
              }
            },
            onFurnitureRemove: () => {
              if (sceneManagerRef.current) {
                setPlacedList(sceneManagerRef.current.getAllFurniture());
              }
            },
            onObjectSelect: (info) => {
              setSelectedObject(info);
              if (info) {
                setSelectedFurniture(null);
                if (info.type === 'wall') {
                  setMaterialCategory('wall');
                } else if (info.type === 'floor') {
                  setMaterialCategory('floor');
                }
              }
            },
          });

          sceneManagerRef.current = sm;
          sm.buildRoomFromArea(res.data.area, res.data.roomType, res.data.style);
        }
      }
    });

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, [id]);

  const handleAddFurniture = useCallback((item: FurnitureItem) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.addFurniture(item);
    }
  }, []);

  const handleRemoveFurniture = useCallback((furnitureId: string) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.removeFurniture(furnitureId);
    }
  }, []);

  const handleRotate = useCallback((deg: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.rotateSelected(deg);
    }
  }, []);

  const handleScale = useCallback((factor: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.scaleSelected(factor);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!sceneManagerRef.current || !project) return;
    const furniture = sceneManagerRef.current.getAllFurniture();
    const room = sceneManagerRef.current.getRoomConfig();

    const sceneData = {
      room,
      furniture: furniture.map((f) => ({
        id: f.id,
        furnitureId: f.furnitureId,
        position: { x: f.position.x, y: f.position.y, z: f.position.z },
        rotation: { x: f.rotation.x, y: f.rotation.y, z: f.rotation.z },
        scale: { x: f.scale.x, y: f.scale.y, z: f.scale.z },
      })),
    };

    try {
      await projectApi.update(project.id, { sceneData });
      message.success('场景保存成功');
    } catch {
      message.error('场景保存失败');
    }
  }, [project]);

  const getMaterialsForCategory = (cat: MaterialCategory): MaterialPreset[] => {
    switch (cat) {
      case 'wall':
        return WALL_MATERIALS;
      case 'floor':
        return FLOOR_MATERIALS;
      case 'furniture-wood':
        return WOOD_MATERIALS;
      case 'furniture-fabric':
        return FABRIC_MATERIALS;
      case 'furniture-leather':
        return LEATHER_MATERIALS;
      case 'furniture-metal':
        return METAL_MATERIALS;
      case 'furniture-marble':
        return MARBLE_MATERIALS;
      default:
        return WOOD_MATERIALS;
    }
  };

  const handleMaterialHover = useCallback((preset: MaterialPreset | null) => {
    if (!previewEnabled || !sceneManagerRef.current) return;
    sceneManagerRef.current.previewMaterial(preset);
  }, [previewEnabled]);

  const handleMaterialSelect = useCallback((preset: MaterialPreset) => {
    if (!sceneManagerRef.current) return;
    
    const success = sceneManagerRef.current.applyMaterialToSelected(preset, applyToAllWalls);
    if (success) {
      message.success(`已应用材质: ${preset.name}`);
    }
  }, [applyToAllWalls]);

  const filteredFurniture =
    selectedCategory === '全部'
      ? FURNITURE_LIBRARY
      : FURNITURE_LIBRARY.filter((f) => f.category === selectedCategory);

  const categoryCounts = FURNITURE_CATEGORIES.map((cat) => ({
    category: cat,
    count:
      cat === '全部'
        ? FURNITURE_LIBRARY.length
        : FURNITURE_LIBRARY.filter((f) => f.category === cat).length,
  }));

  const furnitureMenuItems = categoryCounts.map(({ category, count }) => ({
    key: category,
    icon: <AppstoreOutlined />,
    label: (
      <span>
        {category}
        <Tag
          style={{ marginLeft: 8 }}
          color={selectedCategory === category ? 'blue' : 'default'}
        >
          {count}
        </Tag>
      </span>
    ),
    onClick: () => setSelectedCategory(category),
  }));

  const roomConfig = sceneManagerRef.current?.getRoomConfig();

  const currentMaterials = getMaterialsForCategory(materialCategory);

  return (
    <Layout style={{ height: 'calc(100vh - 64px - 70px)', minHeight: 500 }}>
      <Sider
        width={260}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <Space style={{ marginBottom: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              size="small"
              onClick={() => navigate('/projects')}
            >
              返回
            </Button>
            <Text strong style={{ fontSize: 16 }}>
              3D 设计
            </Text>
          </Space>

          {project && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Text strong>{project.name}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{project.roomType}</Tag>
                <Tag color="green">{project.style}</Tag>
                <Tag>{project.area} ㎡</Tag>
              </div>
              {roomConfig && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  房间尺寸: {roomConfig.width}m × {roomConfig.depth}m × {roomConfig.height}m
                </div>
              )}
            </Card>
          )}

          <Collapse
            activeKey={activePanel}
            onChange={(keys) => setActivePanel(keys as string[])}
            ghost
            items={[
              {
                key: 'furniture',
                label: <Text strong>家具库</Text>,
                children: (
                  <div>
                    <Menu
                      mode="inline"
                      selectedKeys={[selectedCategory]}
                      items={furnitureMenuItems}
                      style={{ borderRight: 'none', marginBottom: 12 }}
                    />
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      {filteredFurniture.map((item) => (
                        <Tooltip key={item.id} title={item.name}>
                          <div
                            onClick={() => handleAddFurniture(item)}
                            style={{
                              padding: 12,
                              border: '1px solid #f0f0f0',
                              borderRadius: 8,
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: '#fafafa',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#1677ff';
                              e.currentTarget.style.background = '#e6f4ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#f0f0f0';
                              e.currentTarget.style.background = '#fafafa';
                            }}
                          >
                            <div style={{ fontSize: 24 }}>{item.icon}</div>
                            <div
                              style={{
                                fontSize: 11,
                                marginTop: 4,
                                color: '#666',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.name}
                            </div>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'placed',
                label: (
                  <span>
                    <Text strong>场景列表</Text>
                    <Tag style={{ marginLeft: 8 }}>{placedList.length}</Tag>
                  </span>
                ),
                children:
                  placedList.length === 0 ? (
                    <Empty description="暂无家具" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <div>
                      {placedList.map((f) => {
                        const libItem = FURNITURE_LIBRARY.find(
                          (l) => l.id === f.furnitureId
                        );
                        const isSelected = selectedFurniture?.id === f.id;
                        return (
                          <div
                            key={f.id}
                            style={{
                              padding: 8,
                              marginBottom: 4,
                              borderRadius: 4,
                              background: isSelected ? '#e6f4ff' : 'transparent',
                              border: isSelected ? '1px solid #1677ff' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              if (sceneManagerRef.current) {
                                const all = sceneManagerRef.current.getAllFurniture();
                                const found = all.find((x) => x.id === f.id);
                                if (found) {
                                  setSelectedFurniture(found);
                                  setSelectedObject(null);
                                }
                              }
                            }}
                          >
                            <Space>
                              <span style={{ fontSize: 18 }}>{libItem?.icon || '📦'}</span>
                              <Text style={{ fontSize: 12 }}>{libItem?.name || f.furnitureId}</Text>
                            </Space>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFurniture(f.id);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ),
              },
            ]}
          />
        </div>
      </Sider>

      <Content style={{ position: 'relative', background: '#1a1a1a' }}>
        <div
          ref={canvasContainerRef}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        />

        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Space size="middle">
            <Tooltip title="保存场景">
              <Button icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
            </Tooltip>
            <Divider type="vertical" />
            <Tooltip title="重置视图">
              <Button
                icon={<HomeOutlined />}
                onClick={() => {
                  if (sceneManagerRef.current && project) {
                    sceneManagerRef.current.buildRoomFromArea(
                      project.area,
                      project.roomType,
                      project.style
                    );
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="全屏">
              <Button icon={<ArrowsAltOutlined />} />
            </Tooltip>
          </Space>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 276,
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Space size="middle">
            <Space size="small">
              <ExperimentOutlined style={{ color: previewEnabled ? '#1677ff' : '#999' }} />
              <Text style={{ fontSize: 12 }}>实时预览</Text>
              <Switch
                size="small"
                checked={previewEnabled}
                onChange={setPreviewEnabled}
              />
            </Space>
          </Space>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Space size="large">
            <Text type="secondary" style={{ fontSize: 12 }}>
              🖱️ 左键拖拽移动 · 右键旋转视角 · 滚轮缩放 · 点击墙面/地面/家具更换材质
            </Text>
          </Space>
        </div>
      </Content>

      <Sider
        width={280}
        theme="light"
        style={{
          borderLeft: '1px solid #f0f0f0',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
            <BgColorsOutlined style={{ marginRight: 8 }} />
            材质编辑
          </Title>

          {(selectedObject || selectedFurniture) ? (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space>
                  {selectedFurniture ? (
                    <>
                      <span style={{ fontSize: 24 }}>
                        {FURNITURE_LIBRARY.find((l) => l.id === selectedFurniture.furnitureId)?.icon || '📦'}
                      </span>
                      <div>
                        <Text strong>
                          {FURNITURE_LIBRARY.find((l) => l.id === selectedFurniture.furnitureId)?.name ||
                            selectedFurniture.furnitureId}
                        </Text>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          家具 · {getFriendlyCategoryName(materialCategory)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 24 }}>
                        {selectedObject?.type === 'wall' ? '🧱' : selectedObject?.type === 'floor' ? '⬜' : '🏠'}
                      </span>
                      <div>
                        <Text strong>{selectedObject?.name || selectedObject?.type}</Text>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {selectedObject?.type === 'wall' ? '墙面' : selectedObject?.type === 'floor' ? '地面' : '建筑'}
                          {selectedObject?.type === 'wall' && (
                            <span style={{ marginLeft: 8, color: '#1677ff' }}>
                              {applyToAllWalls ? '· 应用到全部墙面' : '· 仅当前墙面'}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Space>
                {selectedObject?.type === 'wall' && (
                  <div style={{ marginTop: 12 }}>
                    <Space size="small">
                      <Text style={{ fontSize: 12 }}>应用到全部墙面</Text>
                      <Switch size="small" checked={applyToAllWalls} onChange={setApplyToAllWalls} />
                    </Space>
                  </div>
                )}
              </Card>

              {selectedFurniture && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                    家具材质分类
                  </Text>
                  <Segmented
                    size="small"
                    value={materialCategory}
                    onChange={(val) => setMaterialCategory(val as MaterialCategory)}
                    options={MATERIAL_CATEGORY_TABS}
                    style={{ marginBottom: 12, width: '100%', display: 'flex', flexWrap: 'wrap', gap: 4 }}
                  />
                </div>
              )}

              <div>
                <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                  {getFriendlyCategoryName(materialCategory)} ({currentMaterials.length}种)
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                  }}
                >
                  {currentMaterials.map((mat) => (
                    <Tooltip key={mat.id} title={mat.name}>
                      <div
                        style={{
                          padding: 8,
                          border: '1px solid #e8e8e8',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#fff',
                        }}
                        onClick={() => handleMaterialSelect(mat)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1677ff';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.2)';
                          handleMaterialHover(mat);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.boxShadow = 'none';
                          handleMaterialHover(null);
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: 36,
                            borderRadius: 4,
                            marginBottom: 6,
                            background: mat.previewColor || '#ccc',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        />
                        <div
                          style={{
                            fontSize: 11,
                            textAlign: 'center',
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mat.name}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {selectedFurniture && (
                <>
                  <Divider />
                  <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
                    变换操作
                  </Title>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      旋转
                    </Text>
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <Space>
                        <Tooltip title="逆时针旋转 90°">
                          <Button
                            shape="circle"
                            icon={<RotateLeftOutlined />}
                            onClick={() => handleRotate(-90)}
                          />
                        </Tooltip>
                        <Tooltip title="顺时针旋转 90°">
                          <Button
                            shape="circle"
                            icon={<RotateRightOutlined />}
                            onClick={() => handleRotate(90)}
                          />
                        </Tooltip>
                        <Tooltip title="旋转 15°">
                          <Button size="small" onClick={() => handleRotate(15)}>
                            +15°
                          </Button>
                        </Tooltip>
                        <Tooltip title="旋转 -15°">
                          <Button size="small" onClick={() => handleRotate(-15)}>
                            -15°
                          </Button>
                        </Tooltip>
                      </Space>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      缩放
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Space style={{ marginBottom: 8 }}>
                        <Tooltip title="缩小">
                          <Button
                            shape="circle"
                            size="small"
                            icon={<ZoomOutOutlined />}
                            onClick={() => handleScale(0.9)}
                          />
                        </Tooltip>
                        <Tooltip title="放大">
                          <Button
                            shape="circle"
                            size="small"
                            icon={<ZoomInOutlined />}
                            onClick={() => handleScale(1.1)}
                          />
                        </Tooltip>
                        <Tooltip title="恢复原始大小">
                          <Button
                            size="small"
                            onClick={() => {
                              if (sceneManagerRef.current && selectedFurniture && selectedFurniture.mesh) {
                                selectedFurniture.mesh.scale.set(1, 1, 1);
                                selectedFurniture.scale.set(1, 1, 1);
                              }
                            }}
                          >
                            重置
                          </Button>
                        </Tooltip>
                      </Space>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#999',
                          textAlign: 'center',
                        }}
                      >
                        {(selectedFurniture.scale.x * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <Button
                    danger
                    block
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFurniture(selectedFurniture.id)}
                  >
                    删除家具
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <ExclamationCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 12, color: '#999' }}>
                点击场景中的物体
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#ccc' }}>
                选择墙面、地面或家具来编辑材质
              </div>
            </div>
          )}
        </div>
      </Sider>
    </Layout>
  );
};
