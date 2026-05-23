import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from data_importer import DataImporter
from daily_average_calculator import DailyAverageCalculator


def test_data_import():
    print("=" * 60)
    print("          测试数据导入功能")
    print("=" * 60)
    
    importer = DataImporter()
    
    data_file = 'data/steps_data.csv'
    
    try:
        print(f"\n[1/3] 正在导入数据: {data_file}")
        raw_data = importer.import_data(data_file)
        print(f"✓ 数据导入成功，原始数据: {len(raw_data)} 行")
        
        print(f"\n[2/3] 正在验证和清洗数据")
        clean_data = importer.validate_and_clean(raw_data)
        print(f"✓ 数据验证完成，有效数据: {len(clean_data)} 行")
        
        print(f"\n[3/3] 打印导入报告")
        importer.print_import_report()
        
        return clean_data
        
    except Exception as e:
        print(f"✗ 错误: {e}")
        return None


def test_daily_average_calculator(df):
    print("\n" + "=" * 60)
    print("          测试日均步数计算功能")
    print("=" * 60)
    
    calculator = DailyAverageCalculator(df)
    
    print("\n[1/6] 总体日均步数计算")
    overall = calculator.calculate_overall_average()
    print(f"  ✓ 日均步数: {overall['average_steps']:,} 步")
    print(f"  ✓ 总步数: {overall['total_steps']:,} 步")
    print(f"  ✓ 统计天数: {overall['total_days']} 天")
    
    print("\n[2/6] 工作日 vs 周末日均步数")
    weekday_weekend = calculator.calculate_weekday_weekend_average()
    print(f"  ✓ 工作日日均: {weekday_weekend['weekday']['average_steps']:,} 步")
    print(f"  ✓ 周末日均: {weekday_weekend['weekend']['average_steps']:,} 步")
    
    print("\n[3/6] 各周日均步数")
    daily_avg = calculator.calculate_daily_average()
    for day, row in daily_avg.iterrows():
        print(f"  ✓ {row['day_cn']}: {row['average_steps']:,} 步")
    
    print("\n[4/6] 每周日均步数")
    weekly_avg = calculator.calculate_weekly_average()
    for _, row in weekly_avg.iterrows():
        print(f"  ✓ {row['period']}: {row['average_steps']:,} 步")
    
    print("\n[5/6] 每月日均步数")
    monthly_avg = calculator.calculate_monthly_average()
    for _, row in monthly_avg.iterrows():
        print(f"  ✓ {row['period']}: {row['average_steps']:,} 步")
    
    print("\n[6/6] 移动平均计算 (7天)")
    ma_df = calculator.calculate_moving_average(window=7)
    print(f"  ✓ 计算完成，共 {len(ma_df)} 条记录")
    
    print("\n" + "-" * 60)
    print("📊 完整日均统计报告:")
    calculator.print_daily_average_report()


def main():
    clean_data = test_data_import()
    
    if clean_data is not None and len(clean_data) > 0:
        test_daily_average_calculator(clean_data)
        print("\n" + "=" * 60)
        print("          所有测试完成!")
        print("=" * 60)
    else:
        print("\n✗ 数据导入失败，无法继续测试")


if __name__ == "__main__":
    main()
