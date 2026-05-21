import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.calculator import LoadCalculator, LOAD_PARAMS
from database.db_manager import DatabaseManager


def test_calculator():
    print("=" * 60)
    print("测试荷载计算模块")
    print("=" * 60)

    calc = LoadCalculator()

    print("\n1. 可用建筑类型:")
    options = calc.get_live_load_options()
    for opt in options:
        params = LOAD_PARAMS[opt]
        print(f"  - {opt}: 活载={params['live_load']}kN/m², "
              f"墙密度={params['wall_density']}kN/m³, "
              f"板厚={params['floor_thickness']}m")

    print("\n2. 测试办公楼计算 (面积=100m², 层高=3.0m, 墙厚=0.2m):")
    results = calc.calculate(
        area=100,
        floor_height=3.0,
        wall_thickness=0.2,
        building_type="办公楼",
        building_name="测试办公楼"
    )

    for name, data in results.items():
        print(f"  {name:<25} {data['value']:>10.3f} {data['unit']}")

    print("\n3. 测试住宅计算 (面积=80m², 层高=2.9m, 墙厚=0.2m):")
    results2 = calc.calculate(
        area=80,
        floor_height=2.9,
        wall_thickness=0.2,
        building_type="住宅",
        building_name="测试住宅"
    )

    for name, data in results2.items():
        print(f"  {name:<25} {data['value']:>10.3f} {data['unit']}")

    print("\n4. 验证核心计算逻辑:")
    g_k_total = results["恒载标准值(面荷载)"]["value"]
    q_k_total = results["活载标准值(面荷载)"]["value"]
    print(f"  办公楼 - 恒载标准值: {g_k_total:.2f} kN/m²")
    print(f"  办公楼 - 活载标准值: {q_k_total:.2f} kN/m²")
    print(f"  办公楼 - 总面荷载: {g_k_total + q_k_total:.2f} kN/m²")
    print(f"  办公楼 - 1.2恒+1.4活: {1.2 * g_k_total + 1.4 * q_k_total:.2f} kN/m²")

    assert abs(g_k_total - 8.38) < 0.1, f"恒载计算错误: {g_k_total}"
    assert abs(q_k_total - 2.0) < 0.01, f"活载计算错误: {q_k_total}"

    print("\n✅ 所有计算测试通过!")
    print("=" * 60)


def test_database():
    print("\n" + "=" * 60)
    print("测试数据库集成")
    print("=" * 60)

    db = DatabaseManager()
    calc = LoadCalculator(db_manager=db)

    print("\n1. 计算并保存到数据库...")
    results = calc.calculate(
        area=120,
        floor_height=3.2,
        wall_thickness=0.24,
        building_type="商场",
        building_name="测试商场项目"
    )
    print("  ✅ 计算完成并已保存")

    print("\n2. 查询数据库中的建筑记录:")
    buildings = db.query("SELECT id, name, building_type, area FROM buildings ORDER BY id DESC LIMIT 5")
    for b in buildings:
        print(f"  [{b['id']}] {b['name']:<15} 类型:{b['building_type']:<8} 面积:{b['area']:.0f}m²")

    print("\n3. 查询计算结果:")
    if buildings:
        building_id = buildings[0]["id"]
        calc_results = db.query(
            "SELECT result_name, result_value, result_unit FROM calculation_results WHERE building_id = ?",
            (building_id,)
        )
        print(f"  建筑 ID={building_id} 的计算结果:")
        for r in calc_results:
            print(f"    {r['result_name']:<20} {r['result_value']:>10.3f} {r['result_unit']}")

    print("\n4. 查询荷载工况:")
    load_cases = db.query("SELECT id, case_name, load_type, magnitude, unit FROM load_cases ORDER BY id DESC LIMIT 5")
    for lc in load_cases:
        print(f"  [{lc['id']}] {lc['case_name']:<15} 类型:{lc['load_type']:<6} {lc['magnitude']:.2f} {lc['unit']}")

    db.close()
    print("\n✅ 数据库测试通过!")
    print("=" * 60)


if __name__ == "__main__":
    test_calculator()
    test_database()
    print("\n🎉 所有测试完成!")
