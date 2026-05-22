from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from main import CoffeeFlavorAnalyzer


def generate_single_coffee_radar():
    print("=" * 60)
    print("          单产地咖啡豆风味强度雷达图生成器")
    print("=" * 60)
    print()
    
    analyzer = CoffeeFlavorAnalyzer()
    
    data_file = Path(__file__).parent.parent / "data" / "coffee_flavors.csv"
    analyzer.load_csv(str(data_file))
    
    print("\n可用的咖啡豆样本:")
    samples = analyzer.get_sample_names()
    for i, sample in enumerate(samples, 1):
        print(f"  {i}. {sample}")
    
    output_dir = Path(__file__).parent.parent / "output"
    output_dir.mkdir(exist_ok=True)
    
    target_samples = [
        "埃塞俄比亚耶加雪菲",
        "曼特宁",
        "蓝山"
    ]
    
    print(f"\n将为以下 {len(target_samples)} 款咖啡豆生成风味雷达图:")
    for sample in target_samples:
        print(f"  - {sample}")
    
    print("\n正在生成雷达图...")
    for sample_name in target_samples:
        safe_name = sample_name.replace(' ', '_')
        save_path = output_dir / f"{safe_name}_风味雷达图.png"
        print(f"\n正在生成 {sample_name} 的风味雷达图...")
        analyzer.plot_single_radar(sample_name, save_path=str(save_path), show=False)
    
    print("\n" + "=" * 60)
    print(f"成功生成 {len(target_samples)} 张风味雷达图!")
    print(f"图表已保存至: {output_dir}/")
    print("=" * 60)
    
    print("\n使用示例:")
    print("  analyzer = CoffeeFlavorAnalyzer()")
    print("  analyzer.load_csv('data/coffee_flavors.csv')")
    print("  analyzer.plot_single_radar('埃塞俄比亚耶加雪菲', 'output/radar.png')")
    print()
    print("参数说明:")
    print("  sample_name: 咖啡豆名称 (必须在已加载的数据中)")
    print("  save_path:   保存路径 (可选)")
    print("  show:        是否显示图表 (默认 True)")


def generate_all_coffee_radars():
    analyzer = CoffeeFlavorAnalyzer()
    data_file = Path(__file__).parent.parent / "data" / "coffee_flavors.csv"
    analyzer.load_csv(str(data_file))
    
    output_dir = Path(__file__).parent.parent / "output" / "all_radars"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    samples = analyzer.get_sample_names()
    
    print(f"\n正在为全部 {len(samples)} 款咖啡豆生成风味雷达图...")
    for i, sample_name in enumerate(samples, 1):
        safe_name = sample_name.replace(' ', '_')
        save_path = output_dir / f"{i:02d}_{safe_name}.png"
        print(f"  [{i}/{len(samples)}] {sample_name}")
        analyzer.plot_single_radar(sample_name, save_path=str(save_path), show=False)
    
    print(f"\n全部 {len(samples)} 张雷达图已生成完毕!")


if __name__ == "__main__":
    generate_single_coffee_radar()
