from data_reader import WeatherCSVReader
from visualizer import WeatherVisualizer
import os
import sys
import traceback


def safe_execute(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except Exception as e:
        print(f"✗ 执行失败: {str(e)}")
        print(f"  错误详情: {type(e).__name__}")
        return None


def main():
    csv_file = 'sample_weather_data.csv'
    output_dir = 'charts'
    
    print("="*70)
    print("天气数据图表生成工具 (优化版)")
    print("="*70)
    
    if not os.path.exists(csv_file):
        print(f"✗ 错误: 文件不存在: {csv_file}")
        print(f"  请确保天气数据文件位于当前目录下")
        return False
    
    print(f"\n[步骤 1/8] 读取天气数据: {csv_file}")
    reader = None
    data = None
    
    try:
        reader = WeatherCSVReader(csv_file)
        data = reader.read_csv()
        print(f"✓ 数据读取成功，共 {len(data)} 条记录")
    except Exception as e:
        print(f"✗ 数据读取失败: {str(e)}")
        return False
    
    print(f"\n[步骤 2/8] 检测数据列...")
    try:
        reader.auto_detect_columns()
        print(f"✓ 日期列: {reader.date_column}")
        print(f"✓ 温度列: {reader.temp_columns}")
        print(f"✓ 湿度列: {reader.humidity_columns}")
    except Exception as e:
        print(f"✗ 列检测失败: {str(e)}")
        return False
    
    if not reader.date_column:
        print("✗ 错误: 未检测到日期列")
        return False
    
    if not reader.temp_columns:
        print("✗ 警告: 未检测到温度列，温度图表将跳过")
    
    if not reader.humidity_columns:
        print("✗ 警告: 未检测到湿度列，湿度图表将跳过")
    
    print(f"\n[步骤 3/8] 初始化可视化工具...")
    visualizer = None
    try:
        visualizer = WeatherVisualizer(data, output_dir=output_dir)
        print(f"✓ 可视化工具初始化完成")
        print(f"✓ 图表输出目录: {output_dir}/")
    except Exception as e:
        print(f"✗ 可视化工具初始化失败: {str(e)}")
        return False
    
    date_col = reader.date_column
    generated_charts = []
    
    print(f"\n[步骤 4/8] 生成温度趋势图...")
    if reader.temp_columns:
        try:
            temp_col = reader.temp_columns[2] if len(reader.temp_columns) > 2 else reader.temp_columns[0]
            temp_chart = safe_execute(
                visualizer.plot_temperature_trend,
                date_col=date_col,
                temp_col=temp_col,
                title=f"温度变化趋势图 ({temp_col})",
                save=True,
                filename="温度变化趋势图.png",
                show=False,
                show_annotations=True
            )
            if temp_chart:
                generated_charts.append(temp_chart)
        except Exception as e:
            print(f"✗ 温度趋势图生成失败: {str(e)}")
    else:
        print("  ⏭  跳过（无温度数据）")
    
    print(f"\n[步骤 5/8] 生成温度对比图...")
    if len(reader.temp_columns) >= 2:
        try:
            temp_comparison_chart = safe_execute(
                visualizer.plot_temperature_comparison,
                date_col=date_col,
                temp_cols=reader.temp_columns[:3],
                title="温度对比图 (最高/最低/平均)",
                save=True,
                filename="温度对比图.png",
                show=False
            )
            if temp_comparison_chart:
                generated_charts.append(temp_comparison_chart)
        except Exception as e:
            print(f"✗ 温度对比图生成失败: {str(e)}")
    else:
        print("  ⏭  跳过（温度列不足2列）")
    
    print(f"\n[步骤 6/8] 生成湿度柱状图...")
    if reader.humidity_columns:
        try:
            humidity_col = reader.humidity_columns[0]
            humidity_chart = safe_execute(
                visualizer.plot_humidity_bar,
                date_col=date_col,
                humidity_col=humidity_col,
                title="每日湿度统计",
                save=True,
                filename="湿度柱状图.png",
                show=False,
                show_annotations=True
            )
            if humidity_chart:
                generated_charts.append(humidity_chart)
        except Exception as e:
            print(f"✗ 湿度柱状图生成失败: {str(e)}")
    else:
        print("  ⏭  跳过（无湿度数据）")
    
    print(f"\n[步骤 7/8] 生成湿度趋势图...")
    if reader.humidity_columns:
        try:
            humidity_trend_chart = safe_execute(
                visualizer.plot_humidity_trend,
                date_col=date_col,
                humidity_col=humidity_col,
                title="湿度变化趋势图",
                save=True,
                filename="湿度趋势图.png",
                show=False,
                show_annotations=True
            )
            if humidity_trend_chart:
                generated_charts.append(humidity_trend_chart)
        except Exception as e:
            print(f"✗ 湿度趋势图生成失败: {str(e)}")
    else:
        print("  ⏭  跳过（无湿度数据）")
    
    print(f"\n[步骤 8/8] 生成综合仪表盘...")
    if reader.temp_columns and reader.humidity_columns:
        try:
            dashboard_chart = safe_execute(
                visualizer.plot_comprehensive_dashboard,
                date_col=date_col,
                temp_cols=reader.temp_columns,
                humidity_col=reader.humidity_columns[0],
                title="天气数据综合仪表盘",
                save=True,
                filename="天气数据综合仪表盘.png",
                show=False
            )
            if dashboard_chart:
                generated_charts.append(dashboard_chart)
        except Exception as e:
            print(f"✗ 综合仪表盘生成失败: {str(e)}")
    else:
        print("  ⏭  跳过（缺少温度或湿度数据）")
    
    print("\n" + "="*70)
    print("图表生成完成!")
    print("="*70)
    
    if generated_charts:
        print(f"\n✓ 成功生成 {len(generated_charts)} 个图表文件:")
        
        for chart in generated_charts:
            try:
                file_size = os.path.getsize(chart) / 1024
                filename = os.path.basename(chart)
                print(f"  - {filename} ({file_size:.1f} KB)")
            except:
                print(f"  - {chart}")
    else:
        print("\n✗ 没有成功生成任何图表")
        return False
    
    print("\n📊 所有图表已保存在 'charts' 文件夹中")
    print("="*70)
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
