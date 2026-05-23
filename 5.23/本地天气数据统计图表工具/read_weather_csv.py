from data_reader import WeatherCSVReader


def main():
    csv_file = 'sample_weather_data.csv'
    
    print("="*60)
    print("本地天气 CSV 文件读取演示（编码自动检测）")
    print("="*60)
    
    reader = WeatherCSVReader(csv_file)
    
    print(f"\n[1] 正在读取 CSV 文件: {csv_file}")
    reader.read_csv()
    print("✓ CSV 文件读取成功!")
    
    print("\n[2] 自动检测数据列...")
    reader.auto_detect_columns()
    print(f"✓ 检测到日期列: {reader.date_column}")
    print(f"✓ 检测到温度列: {reader.temp_columns}")
    print(f"✓ 检测到湿度列: {reader.humidity_columns}")
    
    print("\n[3] 数据预览:")
    print(reader.preview_data())
    
    print("\n[4] 解析温度数据...")
    temp_data = reader.parse_temperature_data()
    print("✓ 温度数据解析完成!")
    print("\n温度数据预览:")
    print(temp_data)
    
    print("\n[5] 解析湿度数据...")
    humidity_data = reader.parse_humidity_data()
    print("✓ 湿度数据解析完成!")
    print("\n湿度数据预览:")
    print(humidity_data)
    
    print("\n[6] 同时解析温度和湿度数据...")
    temp_humidity_data = reader.parse_temp_humidity_data()
    print("✓ 温度和湿度数据解析完成!")
    print("\n温度和湿度数据预览:")
    print(temp_humidity_data)
    
    print("\n[7] 温度统计信息:")
    temp_stats = reader.get_temperature_stats()
    for key, value in temp_stats.items():
        print(f"  {key}: {value:.2f}°C")
    
    print("\n[8] 湿度统计信息:")
    humidity_stats = reader.get_humidity_stats()
    for key, value in humidity_stats.items():
        print(f"  {key}: {value:.2f}%")
    
    print("\n" + "="*60)
    print("数据解析完成!")
    print("="*60)
    
    return temp_humidity_data


if __name__ == "__main__":
    main()
