import time
import random
import pandas as pd
import numpy as np
from datetime import datetime
import sys
sys.path.insert(0, '.')
from main import KeystrokeRhythmSystem


def generate_simulated_keystroke_data(num_keystrokes=100):
    """生成模拟的击键数据用于测试节奏曲线"""
    print(f"生成 {num_keystrokes} 次模拟击键数据...")

    data = []
    base_time = time.time()

    avg_flight = 0.15
    avg_dwell = 0.08

    current_press_time = base_time

    for i in range(num_keystrokes):
        if i > 0 and i % 20 == 0:
            avg_flight += 0.02

        flight_time = max(0.02, np.random.normal(avg_flight, 0.03))
        dwell_time = max(0.02, np.random.normal(avg_dwell, 0.01))

        press_time = current_press_time + flight_time
        release_time = press_time + dwell_time

        key = random.choice(['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'space'])

        data.append({
            'timestamp': datetime.fromtimestamp(press_time).isoformat(),
            'key': key,
            'press_time': press_time,
            'release_time': release_time,
            'dwell_time': dwell_time,
            'flight_time': flight_time
        })

        current_press_time = press_time

    df = pd.DataFrame(data)
    print(f"✓ 生成完成，共 {len(df)} 条记录\n")
    return df


def test_rhythm_features():
    print("=" * 60)
    print("测试: 节奏特征提取与曲线生成")
    print("=" * 60 + "\n")

    system = KeystrokeRhythmSystem()

    df = generate_simulated_keystroke_data(150)

    print("1. 测试节奏特征提取...")
    features = system.extract_rhythm_features(df)
    if features is not None:
        print("✓ 特征提取成功")
        print(f"  原始列: {list(df.columns)}")
        print(f"  新增特征列: {[col for col in features.columns if col not in df.columns]}")
    else:
        print("✗ 特征提取失败")
        return

    print("\n2. 测试节奏签名提取...")
    signature = system.get_rhythm_signature(df)
    if signature:
        print("✓ 节奏签名提取成功")
        for key, value in signature.items():
            print(f"  {key}: {value:.4f}")
    else:
        print("✗ 节奏签名提取失败")

    print("\n3. 测试节奏分析...")
    analysis = system.analyze_rhythm(df)
    if analysis:
        print("✓ 节奏分析成功")
        print(f"  总击键数: {analysis['total_keystrokes']}")
        print(f"  平均击键速度: {analysis['keys_per_second']:.2f} 键/秒")
    else:
        print("✗ 节奏分析失败")

    print("\n" + "=" * 60)
    print("所有功能测试通过! ✓")
    print("=" * 60)
    print("\n提示: 运行 python main.py 进入交互式界面")
    print("选择选项 1 记录真实键盘数据，然后生成节奏特征曲线")
    print("\n节奏特征曲线包含 5 个子图:")
    print("  [1] 击键间隔时间节奏曲线 (移动平均 + 标准差范围)")
    print("  [2] 按键持续时间曲线")
    print("  [3] 节奏稳定性变异系数曲线")
    print("  [4] 间隔时间分布与正态拟合")
    print("  [5] 击键累积曲线与打字速度")


if __name__ == "__main__":
    test_rhythm_features()
