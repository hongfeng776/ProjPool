from data_reader import WeatherDataReader
from visualizer import WeatherVisualizer
import pandas as pd


class WeatherDataTool:
    def __init__(self, file_path: str):
        self.reader = WeatherDataReader(file_path)
        self.data = None
        self.visualizer = None

    def load_data(self, auto_detect_encoding: bool = True, **kwargs):
        print("正在加载数据...")
        self.data = self.reader.read_data(auto_detect_encoding=auto_detect_encoding, **kwargs)
        self.visualizer = WeatherVisualizer(self.data)
        print(f"数据加载完成！共 {len(self.data)} 条记录")
        return self.data

    def show_data_info(self):
        if self.data is None:
            print("请先加载数据！")
            return
        
        info = self.reader.get_data_info()
        print("\n" + "="*50)
        print("数据信息")
        print("="*50)
        print(f"数据行数: {info['rows']}")
        print(f"列名: {', '.join(info['columns'])}")
        print("\n数据类型:")
        for col, dtype in info['dtypes'].items():
            print(f"  {col}: {dtype}")
        print("\n缺失值统计:")
        for col, missing in info['missing_values'].items():
            print(f"  {col}: {missing}")
        print("="*50 + "\n")

    def preview_data(self, n: int = 5):
        if self.data is None:
            print("请先加载数据！")
            return
        
        print(f"\n前 {n} 条数据预览:")
        print(self.reader.preview_data(n))
        print()

    def plot_temperature(self, date_col: str, temp_col: str):
        if self.visualizer is None:
            print("请先加载数据！")
            return
        self.visualizer.plot_temperature_trend(date_col, temp_col)

    def plot_temperature_comparison(self, date_col: str, temp_cols: list):
        if self.visualizer is None:
            print("请先加载数据！")
            return
        self.visualizer.plot_temperature_comparison(date_col, temp_cols)

    def plot_precipitation(self, date_col: str, precip_col: str):
        if self.visualizer is None:
            print("请先加载数据！")
            return
        self.visualizer.plot_precipitation_bar(date_col, precip_col)

    def plot_humidity(self, date_col: str, humidity_col: str):
        if self.visualizer is None:
            print("请先加载数据！")
            return
        self.visualizer.plot_humidity_trend(date_col, humidity_col)

    def plot_wind_speed(self, date_col: str, wind_col: str):
        if self.visualizer is None:
            print("请先加载数据！")
            return
        self.visualizer.plot_wind_speed_trend(date_col, wind_col)

    def get_statistics(self, data_col: str):
        if self.data is None:
            print("请先加载数据！")
            return
        
        series = self.data[data_col]
        stats = {
            '最大值': series.max(),
            '最小值': series.min(),
            '平均值': series.mean(),
            '中位数': series.median(),
            '标准差': series.std(),
            '总和': series.sum()
        }
        
        print(f"\n{data_col} 统计信息:")
        for key, value in stats.items():
            print(f"  {key}: {value:.2f}")
        return stats


def main():
    print("="*50)
    print("本地天气数据统计图表工具")
    print("="*50)
    print("\n支持的数据格式: CSV, Excel, JSON")
    print("\n使用示例:")
    print("  tool = WeatherDataTool('weather_data.csv')")
    print("  tool.load_data()")
    print("  tool.show_data_info()")
    print("  tool.preview_data()")
    print("  tool.plot_temperature('日期', '平均温度')")
    print("="*50)


if __name__ == "__main__":
    main()
