# 植物生长测试系统

## 概述

植物生长测试系统提供了完整的状态显示、动画效果、参数测试和数据记录功能，帮助开发者测试和验证不同环境参数对植物生长的影响。

## 快速开始

### 方法一：使用 TestSceneInitializer（推荐）

1. 在空场景中创建一个 GameObject
2. 添加 `TestSceneInitializer` 组件
3. 在 Inspector 中选择测试模式：
   - **SinglePlant** - 单植物详细测试
   - **MultiPlantComparison** - 多植物参数对比
   - **ParameterTest** - 自动参数测试
4. 点击 Play 开始测试

### 方法二：手动添加组件

1. 创建植物对象并添加 `BasicPlant` 组件
2. 添加 `PlantGrowthAnimator` 动画组件
3. 添加 `EnhancedPlantAnimator` 增强动画效果
4. 添加 `PlantStatusDisplay` 显示状态
5. 添加 `GrowthDataRecorder` 记录数据

## 测试模式说明

### 1. 单植物测试模式 (SinglePlant)

**包含组件：**
- 完整的植物状态显示面板
- 生长数据记录器和曲线图
- 生长测试控制面板（OnGUI）
- 环境参数调整界面

**使用场景：**
- 详细观察单株植物的生长过程
- 测试特定参数组合的效果
- 记录生长数据进行分析

### 2. 多植物对比模式 (MultiPlantComparison)

**包含测试组：**
- 最佳条件 (光照=1.0, 水分=1.0, 温度=1.0, 养分=1.0)
- 缺光 (光照=0.3, 水分=1.0, 温度=1.0, 养分=1.0)
- 缺水 (光照=1.0, 水分=0.3, 温度=1.0, 养分=1.0)
- 条件不足 (光照=0.2, 水分=0.2, 温度=0.5, 养分=0.3)
- 过度光照 (光照=2.0, 水分=1.0, 温度=1.0, 养分=1.0)

**使用场景：**
- 直观对比不同参数的生长差异
- 教学演示参数影响
- 验证参数系统的正确性

### 3. 自动参数测试模式 (ParameterTest)

**功能：**
- 自动创建多组测试植物
- 同时应用不同的参数组合
- 自动计时 30 秒测试
- 实时显示各植物的生长进度和倍率
- 测试完成后显示统计结果

**统计数据：**
- 最终生长进度
- 平均生长速度（%/秒）
- 最大/最小/平均生长倍率
- 最终健康值
- 最终生长阶段

## 核心组件说明

### PlantStatusDisplay.cs
植物状态可视化显示组件。

**显示内容：**
- 植物名称和当前阶段
- 生长状态（快速/正常/缓慢/停滞/不足）
- 健康状态（健康/良好/虚弱/危险）
- 生长进度条和数值
- 生命值条和数值
- 生长倍率条和数值
- 实际生长速度
- 四个环境参数值和颜色指示器

**使用方法：**
```csharp
PlantStatusDisplay display = GetComponent<PlantStatusDisplay>();
display.targetPlant = myPlant;
display.followPlant = true; // 跟随植物移动
```

### EnhancedPlantAnimator.cs
增强植物动画效果组件。

**动画效果：**
- **生长弹跳** - 植物随生长节奏轻微弹跳
- **阶段抖动** - 生长阶段变化时的抖动反馈
- **粒子效果** - 生长时释放粒子
- **发光效果** - 健康状态的发光指示

**配置参数：**
```csharp
EnhancedPlantAnimator anim = GetComponent<EnhancedPlantAnimator>();
anim.enableBounceEffect = true;
anim.bounceAmount = 0.05f;
anim.enableGrowthShake = true;
anim.shakeDuration = 0.3f;
```

### GrowthDataRecorder.cs
生长数据记录和曲线图组件。

**记录数据：**
- 生长进度历史
- 生长倍率历史
- 健康值历史

**曲线图显示：**
- 绿色曲线：生长倍率 (0-2)
- 蓝色曲线：生长进度 (0-100)
- 网格背景便于读数

**控制按钮：**
- 开始/停止记录
- 清空数据
- 显示/隐藏图表

**使用方法：**
```csharp
GrowthDataRecorder recorder = GetComponent<GrowthDataRecorder>();
recorder.targetPlant = myPlant;
recorder.recordInterval = 0.5f; // 每0.5秒记录一次
recorder.StartRecording();
```

### PlantParameterTester.cs
自动参数测试组件。

**预置参数组：**
1. 最佳条件 - 所有参数=1.0
2. 缺光 - 光照=0.3
3. 缺水 - 水分=0.3
4. 条件不足 - 所有参数偏低
5. 过度光照 - 光照=2.0

**自定义参数组：**
```csharp
PlantParameterTester tester = GetComponent<PlantParameterTester>();
tester.AddParameterSet("我的测试", 0.8f, 0.9f, 1.0f, 0.7f);
tester.autoStartTest = true;
tester.testDuration = 60f; // 60秒测试
```

## 参数影响详解

### 参数因子计算逻辑

```
参数值范围: 0.0 ~ 2.0

0.0 ~ 0.2: 因子 = 0 (条件不足，无法生长)
0.2 ~ 0.7: 因子 = 0 ~ 1 (线性增长)
0.7 ~ 1.3: 因子 = 1 ~ 1.5 (最佳范围，额外加成)
1.3 ~ 2.0: 因子 = 1.5 ~ 1 (过度，逐渐下降)
```

### 参数权重

| 参数 | 权重 | 说明 |
|------|------|------|
| 光照 | 35% | 影响光合作用 |
| 水分 | 35% | 影响水分吸收 |
| 温度 | 15% | 影响新陈代谢 |
| 养分 | 15% | 影响营养吸收 |

### 生长倍率计算

```
生长倍率 = 光照因子 * 0.35 
          + 水分因子 * 0.35 
          + 温度因子 * 0.15 
          + 养分因子 * 0.15

实际生长速度 = 基础生长率 * 生长倍率
```

## 预期测试结果

在默认设置下（基础生长率=5）：

| 参数组合 | 预期倍率 | 预期速度 | 预期状态 |
|---------|---------|---------|---------|
| 最佳条件 | ~1.5x | ~7.5/秒 | 快速生长 |
| 缺光 | ~0.6x | ~3.0/秒 | 生长缓慢 |
| 缺水 | ~0.6x | ~3.0/秒 | 生长缓慢 |
| 条件不足 | ~0.1x | ~0.5/秒 | 生长停滞 |
| 过度光照 | ~1.0x | ~5.0/秒 | 正常生长 |

## 调试技巧

1. **观察生长倍率** - 确保参数调整时倍率实时变化
2. **检查健康状态** - 参数过低时生命值应下降
3. **查看曲线图** - 绿色曲线应跟随参数调整变化
4. **对比多植物** - 多植物模式下差异应明显可见

## 常见问题

**Q: 调整参数后植物没有变化？**
A: 检查是否已调用 `SetSunlight()` 等方法，或者是否使用了 EnvironmentManager 全局参数。

**Q: 生长倍率总是1.0？**
A: 确保所有参数都在 0.7-1.3 范围内，这是最佳区间。

**Q: 曲线图不显示？**
A: 确保 `showGraph = true` 且 `targetPlant` 已设置。

**Q: 增强动画不生效？**
A: 检查 `EnhancedPlantAnimator.plantBase` 是否已正确引用。
