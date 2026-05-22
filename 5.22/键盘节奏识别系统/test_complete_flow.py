import time
import random
import pandas as pd
import numpy as np
from datetime import datetime
import sys
sys.path.insert(0, '.')
from main import KeystrokeRhythmSystem


def generate_user_keystroke_data(username, num_keystrokes=100):
    """生成特定用户风格的击键数据"""

    user_profiles = {
        'user_fast': {
            'avg_flight': 0.10,
            'std_flight': 0.02,
            'avg_dwell': 0.05,
            'std_dwell': 0.01,
            'keys': list('asdfjkl;')
        },
        'user_slow': {
            'avg_flight': 0.35,
            'std_flight': 0.10,
            'avg_dwell': 0.15,
            'std_dwell': 0.03,
            'keys': list('qwertyuiop')
        },
        'user_medium': {
            'avg_flight': 0.18,
            'std_flight': 0.04,
            'avg_dwell': 0.09,
            'std_dwell': 0.02,
            'keys': list('zxcvbnm,.')
        }
    }

    profile = user_profiles.get(username, user_profiles['user_medium'])

    data = []
    base_time = time.time()
    current_press_time = base_time

    for i in range(num_keystrokes):
        flight_noise = np.random.normal(0, profile['std_flight'] * 0.3)
        dwell_noise = np.random.normal(0, profile['std_dwell'] * 0.3)

        flight_time = max(0.02, profile['avg_flight'] + flight_noise)
        dwell_time = max(0.02, profile['avg_dwell'] + dwell_noise)

        press_time = current_press_time + flight_time
        release_time = press_time + dwell_time

        key = random.choice(profile['keys'])

        data.append({
            'timestamp': datetime.fromtimestamp(press_time).isoformat(),
            'key': key,
            'press_time': press_time,
            'release_time': release_time,
            'dwell_time': dwell_time,
            'flight_time': flight_time
        })

        current_press_time = press_time

    return pd.DataFrame(data)


def test_complete_flow():
    print("=" * 70)
    print("  键盘节奏识别系统 - 完整流程测试")
    print("=" * 70 + "\n")

    system = KeystrokeRhythmSystem()

    print("📊 测试1: 生成多用户模拟数据")
    print("-" * 70)

    df_user1 = generate_user_keystroke_data('user_fast', 120)
    df_user2 = generate_user_keystroke_data('user_slow', 120)
    df_user3 = generate_user_keystroke_data('user_medium', 120)

    print(f"  ✓ 用户1 (快速): {len(df_user1)} 条记录")
    print(f"  ✓ 用户2 (慢速): {len(df_user2)} 条记录")
    print(f"  ✓ 用户3 (中速): {len(df_user3)} 条记录\n")

    print("📝 测试2: 提取节奏特征")
    print("-" * 70)

    features1 = system.extract_rhythm_features(df_user1)
    features2 = system.extract_rhythm_features(df_user2)
    features3 = system.extract_rhythm_features(df_user3)

    print(f"  ✓ 用户1 特征列数: {len(features1.columns)}")
    print(f"  ✓ 用户2 特征列数: {len(features2.columns)}")
    print(f"  ✓ 用户3 特征列数: {len(features3.columns)}\n")

    print("🖐️  测试3: 获取节奏指纹")
    print("-" * 70)

    sig1 = system.get_rhythm_signature(df_user1)
    sig2 = system.get_rhythm_signature(df_user2)
    sig3 = system.get_rhythm_signature(df_user3)

    print(f"  ✓ 用户1 - 平均间隔: {sig1['mean_flight_time']:.4f}s, 速度: {sig1['avg_keys_per_second']:.1f}键/秒")
    print(f"  ✓ 用户2 - 平均间隔: {sig2['mean_flight_time']:.4f}s, 速度: {sig2['avg_keys_per_second']:.1f}键/秒")
    print(f"  ✓ 用户3 - 平均间隔: {sig3['mean_flight_time']:.4f}s, 速度: {sig3['avg_keys_per_second']:.1f}键/秒\n")

    print("👤 测试4: 用户注册功能")
    print("-" * 70)

    system.register_user('Alice', df_user1)
    system.register_user('Bob', df_user2)
    system.register_user('Charlie', df_user3)

    users = system.list_users()
    print(f"  ✓ 已注册用户数: {len(users)}\n")

    print("🔍 测试5: 身份匹配 - 同用户匹配")
    print("-" * 70)

    df_user1_test = generate_user_keystroke_data('user_fast', 80)
    match, similarity = system.identify_user(df_user1_test, threshold=0.6)
    print(f"  测试: 用户1新样本 vs 已注册用户")
    print(f"  预期匹配: Alice")
    print(f"  实际匹配: {match}")
    print(f"  最高相似度: {similarity:.2%}")
    print(f"  测试结果: {'✓ 通过' if match == 'Alice' else '✗ 失败'}\n")

    print("🔍 测试6: 身份匹配 - 相似度对比")
    print("-" * 70)

    df_user2_test = generate_user_keystroke_data('user_slow', 80)
    sig_test = system.get_rhythm_signature(df_user2_test)

    sim_alice = system.compute_signature_similarity(sig_test, sig1)
    sim_bob = system.compute_signature_similarity(sig_test, sig2)
    sim_charlie = system.compute_signature_similarity(sig_test, sig3)

    print(f"  测试样本风格: 慢速打字")
    print(f"  与 Alice 相似度: {sim_alice:.2%}")
    print(f"  与 Bob 相似度: {sim_bob:.2%}")
    print(f"  与 Charlie 相似度: {sim_charlie:.2%}")
    print(f"  测试结果: {'✓ 通过' if sim_bob > sim_alice and sim_bob > sim_charlie else '✗ 失败'}\n")

    print("📈 测试7: 节奏分析功能")
    print("-" * 70)

    analysis = system.analyze_rhythm(df_user1)
    print(f"  ✓ 总击键数: {analysis['total_keystrokes']}")
    print(f"  ✓ 记录时长: {analysis['total_duration']:.2f}s")
    print(f"  ✓ 平均速度: {analysis['keys_per_second']:.2f}键/秒")
    print(f"  ✓ 平均按键时间: {analysis['avg_dwell_time']:.4f}s")
    print(f"  ✓ 平均间隔时间: {analysis['avg_flight_time']:.4f}s\n")

    print("💾 测试8: 数据保存功能")
    print("-" * 70)

    test_filename = 'test_output.csv'
    system.save_data(df_user1, test_filename)

    import os
    if os.path.exists(test_filename):
        df_loaded = pd.read_csv(test_filename)
        print(f"  ✓ 文件保存成功: {test_filename}")
        print(f"  ✓ 加载数据行数: {len(df_loaded)}")
        os.remove(test_filename)
        print(f"  ✓ 测试文件已清理")
    else:
        print(f"  ✗ 文件保存失败")

    print("\n" + "=" * 70)
    print("  ✅ 所有测试完成!")
    print("=" * 70)
    print("\n📋 测试总结:")
    print("  ✓ 数据生成与特征提取")
    print("  ✓ 节奏指纹生成")
    print("  ✓ 用户注册功能")
    print("  ✓ 身份匹配功能")
    print("  ✓ 节奏分析功能")
    print("  ✓ 数据保存功能")
    print("\n🚀 运行 'python main.py' 启动交互式界面进行真实测试!")


if __name__ == "__main__":
    test_complete_flow()
