# 植物生长动画系统

## 概述

植物生长动画系统实现了从种子发芽到长出第一片叶子的完整生长动画过程。系统采用程序化生成方式，无需外部资源即可运行。

## 核心组件

### 1. PlantBase.cs
植物基类，定义了植物的核心属性和生长逻辑。

**环境参数系统：**
- **光照 (Sunlight)** - 影响光合作用，权重 35%
- **水分 (Water)** - 影响水分吸收，权重 35%
- **温度 (Temperature)** - 影响新陈代谢，权重 15%
- **养分 (Nutrients)** - 影响营养吸收，权重 15%

**参数计算方式：**
```
生长倍率 = 光照因子 * 0.35 + 水分因子 * 0.35 + 温度因子 * 0.15 + 养分因子 * 0.15
实际生长速度 = 基础生长率 * 生长倍率
```

**参数范围：**
- 0.0 ~ 0.2: 条件不足，无法生长，植物会枯萎
- 0.2 ~ 0.7: 低于最佳条件，生长缓慢
- 0.7 ~ 1.3: 最佳条件，生长最快（最高 1.5x 倍率）
- 1.3 ~ 2.0: 超出最佳条件，生长速度下降

**健康状态：**
- 条件不足时植物生命值下降
- 最佳条件时植物生命值恢复
- 提供 GetHealthStatus() 和 GetGrowthStatus() 辅助方法

### 2. PlantGrowthAnimator.cs
植物生长动画控制器，负责控制各个生长阶段的视觉效果。

**主要功能：**
- 种子出现/消失动画
- 茎的伸长动画
- 叶片展开动画
- 颜色渐变效果
- 平滑的缓动曲线

**动画进度阶段：**
- 0.00 - 0.25: 种子阶段（种子出现后消失）
- 0.10 - 0.60: 茎伸长阶段
- 0.30 - 1.00: 叶片依次展开

**使用方法：**
```csharp
PlantGrowthAnimator animator = GetComponent<PlantGrowthAnimator>();
animator.seedTransform = seedObject.transform;
animator.stemTransform = stemObject.transform;
animator.leafTransforms = leafTransformsArray;

// 播放到指定进度
animator.PlayGrowthAnimation(0.5f);

// 立即设置进度
animator.SetProgressInstant(1.0f);

// 重置动画
animator.ResetAnimation();
```

### 3. ProceduralPlantGenerator.cs
程序化植物生成器，用于创建植物的各个部件。

**生成的部件：**
- **种子** (Sphere) - 棕色球体
- **茎** (Cylinder) - 绿色圆柱体
- **叶子** (Quad) - 绿色面片，左右交替排列

**使用方法：**
```csharp
ProceduralPlantGenerator generator = GetComponent<ProceduralPlantGenerator>();
generator.seedSize = 0.3f;
generator.stemHeight = 2f;
generator.leafCount = 3;
generator.GeneratePlant();

// 获取生成的部件
Transform seed = generator.GetSeedTransform();
Transform stem = generator.GetStemTransform();
Transform[] leaves = generator.GetLeafTransforms();
```

### 4. BasicPlant.cs
基础植物类，集成了生长逻辑和动画控制。

**主要特性：**
- 继承自 PlantBase
- 自动生成植物部件
- 自动关联动画控制器
- 茎的摆动效果（随生长倍率变化）
- 颜色随健康状态变化
- 强制生长到指定阶段

**使用方法：**
```csharp
BasicPlant plant = GetComponent<BasicPlant>();
plant.autoGenerateOnStart = true;
plant.enableSwaying = true;

// 设置环境参数
plant.SetSunlight(1.2f);
plant.SetWater(0.8f);
plant.SetTemperature(1.0f);
plant.SetNutrients(1.0f);

// 强制生长到指定阶段
plant.ForceGrowToStage(PlantState.Sprout);
plant.ForceGrowToStage(PlantState.Young);

// 重置生长（同时重置参数）
plant.ResetGrowth();
```

### 5. EnvironmentManager.cs
全局环境参数管理器，单例模式。

**主要功能：**
- 管理全局环境参数
- 自动参数变化（可选）
- 昼夜循环（可选）
- 注册/注销植物，统一管理

**使用方法：**
```csharp
// 设置全局参数
EnvironmentManager.Instance.SetSunlight(1.0f);
EnvironmentManager.Instance.SetWater(1.0f);

// 添加/减少参数
EnvironmentManager.Instance.AddSunlight(0.2f);
EnvironmentManager.Instance.AddWater(-0.1f);

// 启用昼夜循环
EnvironmentManager.Instance.enableDayNightCycle = true;
EnvironmentManager.Instance.dayNightCycleDuration = 120f;

// 注册植物
EnvironmentManager.Instance.RegisterPlant(plant);
```

### 6. EnvironmentPanelUI.cs
环境参数调整 UI 面板。

**功能：**
- 四个参数滑条（光照、水分、温度、养分）
- 实时数值显示
- 颜色指示器（红色=差，黄色=一般，绿色=好，青绿=最佳）
- 生长倍率和状态显示
- 健康状态显示
- 快捷按钮（重置、最佳、最低）

### 7. PlantGrowthTester.cs
植物生长测试器，用于在运行时测试生长动画。

**功能：**
- OnGUI 测试按钮（左上角）
- 支持滑条控制生长进度
- 环境参数快捷调整
- 显示当前阶段、进度、参数、状态

## 生长阶段说明

| 阶段 | 进度值 | 视觉效果 |
|------|--------|----------|
| Seed (种子) | 0-15% | 种子出现，大小渐变 |
| Sprout (发芽) | 15-35% | 种子消失，茎开始伸长 |
| Young (幼苗) | 35-60% | 第一片叶子展开 |
| Mature (成熟) | 60-85% | 更多叶子展开 |
| Flowering (开花) | 85-100% | 完全生长状态 |

## 快速开始

### 方法一：使用 SceneInitializer（推荐）

1. 在空场景中创建一个 GameObject
2. 添加 `SceneInitializer` 组件
3. 点击 Play，系统会自动创建：
   - 正交相机
   - 绿色地面
   - 环境管理器
   - 测试植物（已注册到环境管理器）
   - 生长测试 UI
   - 环境参数面板

4. 使用左上角的 OnGUI 按钮或右侧的环境面板调整参数

### 方法二：手动创建

1. 创建空 GameObject，命名为 "Plant"
2. 添加以下组件：
   - `ProceduralPlantGenerator`
   - `PlantGrowthAnimator`
   - `BasicPlant`
3. 设置 `BasicPlant.autoGenerateOnStart = true`
4. 点击 Play

## 环境参数调整指南

### 观察生长状态

通过观察 `growthMultiplier` 和 `GetGrowthStatus()` 来判断参数是否合适：

| 生长倍率 | 状态文本 | 说明 |
|---------|---------|------|
| >= 1.3x | 快速生长 | 参数最佳 |
| 0.8-1.3x | 正常生长 | 参数良好 |
| 0.4-0.8x | 生长缓慢 | 参数一般 |
| 0.1-0.4x | 生长停滞 | 参数较差 |
| <= 0.1x | 条件不足 | 参数太差，植物会死亡 |

### 测试不同参数组合

```csharp
// 最佳条件 - 快速生长
plant.SetSunlight(1.0f);
plant.SetWater(1.0f);
plant.SetTemperature(1.0f);
plant.SetNutrients(1.0f);

// 缺光 - 生长缓慢
plant.SetSunlight(0.3f);
plant.SetWater(1.0f);

// 缺水 - 生长缓慢
plant.SetSunlight(1.0f);
plant.SetWater(0.3f);

// 条件不足 - 植物枯萎
plant.SetSunlight(0.1f);
plant.SetWater(0.1f);
```

## 自定义植物外观

修改 `ProceduralPlantGenerator` 参数：

```csharp
// 种子大小和颜色
generator.seedSize = 0.4f;
generator.seedColor = new Color(0.5f, 0.3f, 0.1f);

// 茎的高度和粗细
generator.stemHeight = 2.5f;
generator.stemWidth = 0.12f;
generator.stemColor = new Color(0.2f, 0.6f, 0.2f);

// 叶子数量和大小
generator.leafCount = 5;
generator.leafSize = 0.6f;
generator.leafSpacing = 0.4f;
generator.leafColor = new Color(0.1f, 0.7f, 0.2f);
```

## 自定义动画效果

修改 `PlantGrowthAnimator` 参数：

```csharp
// 动画速度
animator.animationSpeed = 1.5f; // 更快

// 缓动曲线
animator.growthCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

// 颜色
animator.seedColor = new Color(0.6f, 0.4f, 0.2f);
animator.stemColor = Color.green;
animator.leafColor = new Color(0.2f, 0.8f, 0.3f);

// 叶子旋转范围
animator.leafRotationRange = 45f;
```

## 自定义参数权重

在 `PlantBase` 中调整参数权重：

```csharp
// 例如：让水分更重要
plant.waterWeight = 0.5f;
plant.sunlightWeight = 0.3f;
plant.temperatureWeight = 0.1f;
plant.nutrientsWeight = 0.1f;
```

## 注意事项

1. 系统使用 Unity 标准材质和内置几何体
2. 所有部件默认使用 Trigger 碰撞器
3. 摆动效果仅在发芽阶段后生效，且摆动幅度随生长倍率变化
4. 事件委托在植物阶段变化时触发
5. 环境参数低于 0.2 时植物停止生长并开始枯萎
6. 环境参数在 0.7-1.3 范围内时达到最佳生长效果

## 扩展建议

- 添加更多叶片形状
- 实现开花动画
- 添加粒子效果（花粉、掉落物）
- 实现随风摆动的物理效果
- 添加生长声音效果
- 实现不同植物种类的参数需求差异
- 添加天气系统（下雨、晴天等）
- 实现季节变化
