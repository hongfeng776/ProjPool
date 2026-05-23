import os
import sys
import argparse

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from data_importer import DataImporter
from daily_average_calculator import DailyAverageCalculator
from visualizer import StepVisualizer
from utils.config import Config


def parse_args():
    parser = argparse.ArgumentParser(description='个人运动步数分析可视化工具')
    parser.add_argument('-f', '--file', type=str, help='数据文件路径 (支持 .csv, .xlsx, .xls, .json)')
    parser.add_argument('-o', '--output', type=str, help='输出目录')
    parser.add_argument('--no-charts', action='store_true', help='不生成图表')
    parser.add_argument('--no-export', action='store_true', help='不导出统计结果')
    return parser.parse_args()


def find_data_file():
    data_dir = 'data'
    if not os.path.exists(data_dir):
        return None
    
    supported_extensions = ['.csv', '.xlsx', '.xls', '.json']
    for ext in supported_extensions:
        for file in os.listdir(data_dir):
            if file.lower().endswith(ext):
                return os.path.join(data_dir, file)
    return None


def main():
    args = parse_args()
    config = Config()
    
    print("=" * 70)
    print("               个人运动步数分析可视化工具")
    print("                   一键分析模式")
    print("=" * 70)
    
    data_file = args.file or find_data_file() or config.get('data_file', 'data/steps_data.csv')
    output_dir = args.output or config.get('output_dir', 'output')
    
    if not os.path.exists(data_file):
        print(f"\n❌ 错误: 未找到数据文件")
        print(f"   请将数据文件放入 data/ 目录，或使用 -f 参数指定文件路径")
        print(f"   支持格式: .csv, .xlsx, .xls, .json")
        print(f"\n💡 使用示例:")
        print(f"   python main.py                    # 自动查找 data/ 目录下的文件")
        print(f"   python main.py -f my_steps.csv    # 指定文件")
        print(f"   python main.py --no-charts        # 只计算不生成图表")
        return
    
    print(f"\n📂 [1/5] 数据导入中...")
    importer = DataImporter()
    
    try:
        raw_data = importer.import_data(data_file)
        print(f"   ✓ 原始数据: {len(raw_data)} 行")
    except Exception as e:
        print(f"   ❌ 导入失败: {e}")
        return
    
    print(f"\n🔍 [2/5] 数据校验中...")
    try:
        clean_df = importer.validate_and_clean(
            raw_data,
            min_steps=config.get('min_steps', 0),
            max_steps=config.get('max_steps', 100000)
        )
        
        quality_report = importer.check_data_quality(clean_df)
        is_valid, messages = importer.validate_data_requirements(clean_df)
        
        importer.print_import_report()
        
        if not is_valid:
            print(f"\n⚠️  数据校验未通过:")
            for msg in messages:
                print(f"   - {msg}")
            return
        
        print(f"   ✓ 数据校验通过，有效数据: {len(clean_df)} 行")
        
    except Exception as e:
        print(f"   ❌ 校验失败: {e}")
        return
    
    print(f"\n📊 [3/5] 统计计算中...")
    try:
        calculator = DailyAverageCalculator(clean_df)
        calculator.print_daily_average_report()
        print(f"   ✓ 统计计算完成")
    except Exception as e:
        print(f"   ❌ 计算失败: {e}")
        return
    
    if not args.no_charts:
        print(f"\n📈 [4/5] 生成图表中...")
        try:
            os.makedirs(output_dir, exist_ok=True)
            visualizer = StepVisualizer(clean_df, output_dir=output_dir)
            
            visualizer.plot_daily_steps()
            visualizer.plot_weekly_trend()
            visualizer.plot_monthly_analysis()
            visualizer.plot_steps_distribution()
            visualizer.plot_weekly_average_bar()
            visualizer.plot_weekly_extremes()
            
            print(f"   ✓ 6 张图表已保存至: {os.path.abspath(output_dir)}")
        except Exception as e:
            print(f"   ⚠️  图表生成失败: {e}")
    else:
        print(f"\n📈 [4/5] 跳过图表生成")
    
    if not args.no_export:
        print(f"\n💾 [5/5] 导出结果中...")
        try:
            os.makedirs(output_dir, exist_ok=True)
            export_results(calculator, output_dir)
            print(f"   ✓ 统计结果已导出")
        except Exception as e:
            print(f"   ⚠️  导出失败: {e}")
    else:
        print(f"\n💾 [5/5] 跳过结果导出")
    
    print("\n" + "=" * 70)
    print("                    分析完成!")
    print("=" * 70)
    print(f"\n📌 结果目录: {os.path.abspath(output_dir)}")
    print(f"📊 包含: 图表 + 统计数据 CSV")


def export_results(calculator, output_dir):
    daily_avg = calculator.calculate_daily_average()
    daily_avg.to_csv(os.path.join(output_dir, 'daily_average.csv'), encoding='utf-8-sig')
    
    weekly_avg = calculator.calculate_weekly_average()
    weekly_avg.to_csv(os.path.join(output_dir, 'weekly_average.csv'), encoding='utf-8-sig', index=False)
    
    monthly_avg = calculator.calculate_monthly_average()
    monthly_avg.to_csv(os.path.join(output_dir, 'monthly_average.csv'), encoding='utf-8-sig', index=False)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  用户中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ 程序异常: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
