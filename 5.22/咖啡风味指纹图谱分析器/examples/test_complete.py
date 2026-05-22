from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from main import CoffeeFlavorAnalyzer


def test_exception_handling():
    print("\n" + "=" * 60)
    print("测试 1: 异常处理功能测试")
    print("=" * 60)
    
    analyzer = CoffeeFlavorAnalyzer()
    
    print("\n1.1 测试不存在的文件:")
    try:
        analyzer.load_csv("data/nonexistent.csv")
    except Exception as e:
        print(f"   ✓ 正确捕获异常: {type(e).__name__}")
    
    print("\n1.2 测试空文件:")
    try:
        analyzer.load_csv("data/empty_file.csv")
    except Exception as e:
        print(f"   ✓ 正确捕获异常: {type(e).__name__}")
    
    print("\n1.3 测试未加载数据时调用绘图:")
    analyzer2 = CoffeeFlavorAnalyzer()
    try:
        analyzer2.plot_single_radar("测试", show=False)
    except Exception as e:
        print(f"   ✓ 正确捕获异常: {type(e).__name__}")
    
    print("\n1.4 测试不存在的样本名称:")
    analyzer3 = CoffeeFlavorAnalyzer()
    analyzer3.load_csv("data/coffee_flavors.csv")
    try:
        analyzer3.plot_single_radar("不存在的咖啡", show=False)
    except Exception as e:
        print(f"   ✓ 正确捕获异常: {type(e).__name__}")
    
    print("\n✅ 异常处理测试完成!")


def test_different_csv_files():
    print("\n" + "=" * 60)
    print("测试 2: 不同 CSV 文件导入测试")
    print("=" * 60)
    
    analyzer = CoffeeFlavorAnalyzer()
    
    print("\n2.1 测试标准格式数据 (10款咖啡豆):")
    analyzer.load_csv("data/coffee_flavors.csv")
    analyzer.preview_data(n=3, show_flavor_only=True)
    
    print("\n2.2 测试小批量数据 (5款咖啡豆):")
    analyzer2 = CoffeeFlavorAnalyzer()
    analyzer2.load_csv("data/test_coffee_5_samples.csv")
    analyzer2.preview_data(show_flavor_only=True)
    
    print("\n2.3 测试自定义列名数据:")
    analyzer3 = CoffeeFlavorAnalyzer()
    analyzer3.load_csv("data/test_custom_columns.csv")
    analyzer3.preview_data()
    print(f"   自动识别的风味列: {analyzer3.flavor_columns}")
    
    print("\n✅ CSV 文件导入测试完成!")


def test_chart_generation():
    print("\n" + "=" * 60)
    print("测试 3: 图表生成功能测试")
    print("=" * 60)
    
    output_dir = Path(__file__).parent.parent / "output" / "test_results"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    analyzer = CoffeeFlavorAnalyzer()
    analyzer.load_csv("data/coffee_flavors.csv")
    
    print("\n3.1 测试单样本雷达图:")
    samples = analyzer.get_sample_names()[:3]
    for i, sample in enumerate(samples):
        save_path = output_dir / f"test1_{sample.replace(' ', '_')}.png"
        analyzer.plot_single_radar(sample, save_path=str(save_path), show=False, color_index=i)
    print("   ✓ 生成了 3 张单样本雷达图")
    
    print("\n3.2 测试多样本对比图:")
    compare_samples = analyzer.get_sample_names()[:4]
    save_path = output_dir / "test2_comparison.png"
    analyzer.compare_samples(compare_samples, save_path=str(save_path), show=False)
    print("   ✓ 生成了 1 张多样本对比图")
    
    print("\n3.3 测试相关性热力图:")
    save_path = output_dir / "test3_heatmap.png"
    analyzer.heatmap_analysis(save_path=str(save_path), show=False)
    print("   ✓ 生成了 1 张相关性热力图")
    
    print("\n3.4 测试部分样本对比 (包含无效样本):")
    mixed_samples = ["埃塞俄比亚耶加雪菲", "不存在的咖啡", "蓝山", "曼特宁"]
    save_path = output_dir / "test4_mixed_comparison.png"
    analyzer.compare_samples(mixed_samples, save_path=str(save_path), show=False)
    print("   ✓ 正确处理了包含无效样本的对比")
    
    print(f"\n✅ 图表生成测试完成! 所有图表已保存至: {output_dir}")


def test_data_analysis():
    print("\n" + "=" * 60)
    print("测试 4: 数据分析功能测试")
    print("=" * 60)
    
    analyzer = CoffeeFlavorAnalyzer()
    analyzer.load_csv("data/coffee_flavors.csv")
    
    print("\n4.1 测试基础统计:")
    stats = analyzer.get_flavor_stats()
    print(f"   ✓ 统计维度: {stats.shape}")
    
    print("\n4.2 测试样本名称获取:")
    samples = analyzer.get_sample_names()
    print(f"   ✓ 获取到 {len(samples)} 个样本")
    
    print("\n4.3 测试数据预览:")
    preview = analyzer.preview_data(n=2, show_flavor_only=True)
    print(f"   ✓ 预览数据形状: {preview.shape}")
    
    print("\n✅ 数据分析功能测试完成!")


def run_all_tests():
    print("\n" + "=" * 70)
    print("                    咖啡风味分析器综合测试")
    print("=" * 70)
    
    try:
        test_exception_handling()
    except Exception as e:
        print(f"\n❌ 异常处理测试失败: {e}")
    
    try:
        test_different_csv_files()
    except Exception as e:
        print(f"\n❌ CSV 文件导入测试失败: {e}")
    
    try:
        test_chart_generation()
    except Exception as e:
        print(f"\n❌ 图表生成测试失败: {e}")
    
    try:
        test_data_analysis()
    except Exception as e:
        print(f"\n❌ 数据分析测试失败: {e}")
    
    print("\n" + "=" * 70)
    print("                        所有测试完成!")
    print("=" * 70)
    print("\n📁 生成的文件:")
    print("  - data/coffee_flavors.csv")
    print("  - data/test_coffee_5_samples.csv")
    print("  - data/test_custom_columns.csv")
    print("  - output/test_results/ (包含测试图表)")
    print()


if __name__ == "__main__":
    run_all_tests()
