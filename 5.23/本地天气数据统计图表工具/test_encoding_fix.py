from data_reader import WeatherCSVReader, detect_file_encoding, read_csv_with_auto_encoding
import os


def test_encoding_detection():
    print("="*60)
    print("测试 1: 编码自动检测功能")
    print("="*60)
    
    csv_file = 'sample_weather_data.csv'
    if os.path.exists(csv_file):
        encoding = detect_file_encoding(csv_file)
        print(f"✓ 检测到 {csv_file} 的编码: {encoding}")
    else:
        print(f"✗ 文件 {csv_file} 不存在")
    print()


def test_csv_reader_with_auto_encoding():
    print("="*60)
    print("测试 2: WeatherCSVReader 自动编码读取")
    print("="*60)
    
    csv_file = 'sample_weather_data.csv'
    if not os.path.exists(csv_file):
        print(f"✗ 文件 {csv_file} 不存在")
        return
    
    try:
        reader = WeatherCSVReader(csv_file)
        print(f"✓ 创建 WeatherCSVReader 成功")
        
        data = reader.read_csv()
        print(f"✓ CSV 文件读取成功，共 {len(data)} 行数据")
        
        print(f"\n检测到的编码: {reader.detected_encoding}")
        print(f"\n数据预览:")
        print(data.head())
        print()
    except Exception as e:
        print(f"✗ 读取失败: {e}")
        print()


def test_csv_reader_with_retry():
    print("="*60)
    print("测试 3: WeatherCSVReader 带重试的读取功能")
    print("="*60)
    
    csv_file = 'sample_weather_data.csv'
    if not os.path.exists(csv_file):
        print(f"✗ 文件 {csv_file} 不存在")
        return
    
    try:
        reader = WeatherCSVReader(csv_file)
        data = reader.read_csv_with_retry()
        print(f"✓ 带重试读取成功，共 {len(data)} 行数据")
        print()
    except Exception as e:
        print(f"✗ 读取失败: {e}")
        print()


def test_temp_humidity_parsing():
    print("="*60)
    print("测试 4: 温度和湿度数据解析")
    print("="*60)
    
    csv_file = 'sample_weather_data.csv'
    if not os.path.exists(csv_file):
        print(f"✗ 文件 {csv_file} 不存在")
        return
    
    try:
        reader = WeatherCSVReader(csv_file)
        reader.read_csv()
        
        temp_data = reader.parse_temperature_data()
        print(f"✓ 温度数据解析成功，共 {len(temp_data)} 行")
        
        humidity_data = reader.parse_humidity_data()
        print(f"✓ 湿度数据解析成功，共 {len(humidity_data)} 行")
        
        temp_humidity_data = reader.parse_temp_humidity_data()
        print(f"✓ 温度和湿度数据同时解析成功，列名: {list(temp_humidity_data.columns)}")
        
        print("\n温度和湿度数据预览:")
        print(temp_humidity_data)
        print()
    except Exception as e:
        print(f"✗ 解析失败: {e}")
        import traceback
        traceback.print_exc()
        print()


def test_statistics():
    print("="*60)
    print("测试 5: 统计信息计算")
    print("="*60)
    
    csv_file = 'sample_weather_data.csv'
    if not os.path.exists(csv_file):
        print(f"✗ 文件 {csv_file} 不存在")
        return
    
    try:
        reader = WeatherCSVReader(csv_file)
        reader.read_csv()
        
        temp_stats = reader.get_temperature_stats()
        print("✓ 温度统计信息:")
        for key, value in temp_stats.items():
            print(f"  {key}: {value:.2f}°C")
        
        humidity_stats = reader.get_humidity_stats()
        print("\n✓ 湿度统计信息:")
        for key, value in humidity_stats.items():
            print(f"  {key}: {value:.2f}%")
        print()
    except Exception as e:
        print(f"✗ 统计计算失败: {e}")
        print()


def main():
    print("\n" + "="*60)
    print("编码修复测试脚本")
    print("="*60 + "\n")
    
    test_encoding_detection()
    test_csv_reader_with_auto_encoding()
    test_csv_reader_with_retry()
    test_temp_humidity_parsing()
    test_statistics()
    
    print("="*60)
    print("所有测试完成!")
    print("="*60)


if __name__ == "__main__":
    main()
