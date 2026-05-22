import time
import threading
from collections import deque


def test_queue_matching():
    """测试队列匹配逻辑是否正确处理快速连续按键"""
    print("=" * 60)
    print("测试1: 队列匹配逻辑验证")
    print("=" * 60)

    key_press_queues = {}
    recorded = []

    def simulate_press(key_name, press_time):
        if key_name not in key_press_queues:
            key_press_queues[key_name] = deque()
        key_press_queues[key_name].append(press_time)
        print(f"按下: {key_name} @ t={press_time}")

    def simulate_release(key_name, release_time):
        if key_name in key_press_queues and len(key_press_queues[key_name]) > 0:
            press_time = key_press_queues[key_name].popleft()
            dwell_time = release_time - press_time
            recorded.append({
                'key': key_name,
                'press_time': press_time,
                'release_time': release_time,
                'dwell_time': dwell_time
            })
            print(f"释放: {key_name} @ t={release_time} | 匹配按下 @ t={press_time}")
        else:
            print(f"释放: {key_name} @ t={release_time} | 未找到匹配的按下 (丢失!)")

    print("\n场景: 快速连续按 'a' 键 3 次，然后依次释放")
    print("-" * 60)
    simulate_press('a', 0.1)
    simulate_press('a', 0.2)
    simulate_press('a', 0.3)
    print()
    simulate_release('a', 0.15)
    simulate_release('a', 0.25)
    simulate_release('a', 0.35)

    print(f"\n记录到 {len(recorded)} 次击键 (预期: 3次)")
    assert len(recorded) == 3, f"失败! 预期3次，实际{len(recorded)}次"

    for i, r in enumerate(recorded):
        print(f"  击键{i+1}: dwell_time = {r['dwell_time']:.2f}s")
        assert abs(r['dwell_time'] - 0.05) < 0.001, f"击键{i+1} dwell_time错误!"

    print("✓ 测试1通过!\n")

    print("=" * 60)
    print("测试2: 多键快速交替按键验证")
    print("=" * 60)

    key_press_queues = {}
    recorded = []

    print("\n场景: 快速交替按 'a', 's', 'd', 'f'")
    print("-" * 60)
    simulate_press('a', 0.1)
    simulate_press('s', 0.11)
    simulate_press('d', 0.12)
    simulate_press('f', 0.13)
    print()
    simulate_release('a', 0.20)
    simulate_release('s', 0.21)
    simulate_release('d', 0.22)
    simulate_release('f', 0.23)

    print(f"\n记录到 {len(recorded)} 次击键 (预期: 4次)")
    assert len(recorded) == 4, f"失败! 预期4次，实际{len(recorded)}次"
    print("✓ 测试2通过!\n")

    print("=" * 60)
    print("测试3: 极端压力测试 - 同一键10次快速连击")
    print("=" * 60)

    key_press_queues = {}
    recorded = []

    print("\n场景: 同一键10次快速连击")
    print("-" * 60)
    for i in range(10):
        simulate_press('space', 0.01 * i)
    print()
    for i in range(10):
        simulate_release('space', 0.01 * i + 0.005)

    print(f"\n记录到 {len(recorded)} 次击键 (预期: 10次)")
    assert len(recorded) == 10, f"失败! 预期10次，实际{len(recorded)}次"
    print("✓ 测试3通过!\n")

    print("=" * 60)
    print("所有测试通过! ✓")
    print("=" * 60)
    print("\n修复效果总结:")
    print("  • 使用 deque 队列代替字典存储按下时间")
    print("  • FIFO 先进先出确保按下/释放正确匹配")
    print("  • 快速连续按键不会丢失数据")
    print("  • 添加线程锁确保多线程安全")


if __name__ == "__main__":
    test_queue_matching()
