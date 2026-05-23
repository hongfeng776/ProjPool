import pandas as pd
import os
import re
from typing import Optional, Dict, Any, List, Tuple


def detect_file_encoding(file_path: str, sample_size: int = 10000) -> str:
    encodings_to_try = ['utf-8-sig', 'utf-8', 'gbk', 'gb2312', 'gb18030', 'latin1']
    
    for encoding in encodings_to_try:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                f.read(sample_size)
            return encoding
        except UnicodeDecodeError:
            continue
        except Exception:
            continue
    
    return 'utf-8'


def read_csv_with_auto_encoding(file_path: str, **kwargs) -> pd.DataFrame:
    encodings_to_try = ['utf-8-sig', 'utf-8', 'gbk', 'gb2312', 'gb18030', 'latin1']
    
    last_error = None
    for encoding in encodings_to_try:
        try:
            return pd.read_csv(file_path, encoding=encoding, **kwargs)
        except UnicodeDecodeError as e:
            last_error = e
            continue
        except Exception as e:
            last_error = e
            continue
    
    raise ValueError(f"无法读取文件，尝试了以下编码: {encodings_to_try}。最后一个错误: {last_error}")


class WeatherDataReader:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.data: Optional[pd.DataFrame] = None
        self.file_format = self._detect_format()
        self.temp_columns: List[str] = []
        self.humidity_columns: List[str] = []
        self.date_column: Optional[str] = None

    def _detect_format(self) -> str:
        _, ext = os.path.splitext(self.file_path)
        ext = ext.lower()
        if ext == '.csv':
            return 'csv'
        elif ext in ['.xlsx', '.xls']:
            return 'excel'
        elif ext == '.json':
            return 'json'
        else:
            raise ValueError(f"不支持的文件格式: {ext}")

    def read_data(self, auto_detect_encoding: bool = True, **kwargs) -> pd.DataFrame:
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"文件不存在: {self.file_path}")

        if self.file_format == 'csv':
            if auto_detect_encoding and 'encoding' not in kwargs:
                self.data = read_csv_with_auto_encoding(self.file_path, **kwargs)
            else:
                self.data = pd.read_csv(self.file_path, **kwargs)
        elif self.file_format == 'excel':
            self.data = pd.read_excel(self.file_path, **kwargs)
        elif self.file_format == 'json':
            if auto_detect_encoding and 'encoding' not in kwargs:
                encoding = detect_file_encoding(self.file_path)
                self.data = pd.read_json(self.file_path, encoding=encoding, **kwargs)
            else:
                self.data = pd.read_json(self.file_path, **kwargs)

        return self.data

    def get_data_info(self) -> Dict[str, Any]:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        return {
            'rows': len(self.data),
            'columns': list(self.data.columns),
            'dtypes': self.data.dtypes.to_dict(),
            'missing_values': self.data.isnull().sum().to_dict()
        }

    def preview_data(self, n: int = 5) -> pd.DataFrame:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        return self.data.head(n)

    def filter_by_date_range(self, date_col: str, start_date: str, end_date: str) -> pd.DataFrame:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        mask = (df[date_col] >= start_date) & (df[date_col] <= end_date)
        return df.loc[mask]

    def auto_detect_columns(self) -> None:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        temp_keywords = ['温度', 'temp', 'temperature']
        humidity_keywords = ['湿度', 'humidity', 'hum']
        date_keywords = ['日期', '时间', 'date', 'time']

        for col in self.data.columns:
            col_lower = col.lower()
            
            if any(keyword in col_lower for keyword in date_keywords):
                self.date_column = col
            
            if any(keyword in col_lower for keyword in temp_keywords):
                self.temp_columns.append(col)
            
            if any(keyword in col_lower for keyword in humidity_keywords):
                self.humidity_columns.append(col)

    def parse_temperature_data(self, temp_col: Optional[str] = None) -> pd.DataFrame:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        if temp_col is None:
            if not self.temp_columns:
                self.auto_detect_columns()
            if not self.temp_columns:
                raise ValueError("未找到温度列，请手动指定温度列名")
            temp_col = self.temp_columns[0]
        
        if self.date_column:
            temp_data = self.data.loc[:, [self.date_column, temp_col]].copy()
        else:
            temp_data = self.data.loc[:, [temp_col]].copy()
        
        temp_data.loc[:, temp_col] = pd.to_numeric(temp_data.loc[:, temp_col], errors='coerce')
        
        return temp_data

    def parse_humidity_data(self, humidity_col: Optional[str] = None) -> pd.DataFrame:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        if humidity_col is None:
            if not self.humidity_columns:
                self.auto_detect_columns()
            if not self.humidity_columns:
                raise ValueError("未找到湿度列，请手动指定湿度列名")
            humidity_col = self.humidity_columns[0]
        
        if self.date_column:
            humidity_data = self.data.loc[:, [self.date_column, humidity_col]].copy()
        else:
            humidity_data = self.data.loc[:, [humidity_col]].copy()
        
        humidity_data.loc[:, humidity_col] = pd.to_numeric(humidity_data.loc[:, humidity_col], errors='coerce')
        
        return humidity_data

    def parse_temp_humidity_data(self) -> pd.DataFrame:
        if self.data is None:
            raise ValueError("数据尚未加载，请先调用 read_data()")
        
        self.auto_detect_columns()
        
        if not self.temp_columns:
            raise ValueError("未找到温度列")
        if not self.humidity_columns:
            raise ValueError("未找到湿度列")
        
        columns_to_keep = []
        if self.date_column:
            columns_to_keep.append(self.date_column)
        
        for col in self.temp_columns:
            if col not in columns_to_keep:
                columns_to_keep.append(col)
        
        for col in self.humidity_columns:
            if col not in columns_to_keep:
                columns_to_keep.append(col)
        
        result = self.data.loc[:, columns_to_keep].copy()
        
        for col in self.temp_columns + self.humidity_columns:
            if col in result.columns:
                result.loc[:, col] = pd.to_numeric(result.loc[:, col].squeeze(), errors='coerce')
        
        return result

    def get_temperature_stats(self, temp_col: Optional[str] = None) -> Dict[str, float]:
        temp_data = self.parse_temperature_data(temp_col)
        col = temp_data.columns[-1]
        return {
            '最大值': float(temp_data[col].max()),
            '最小值': float(temp_data[col].min()),
            '平均值': float(temp_data[col].mean()),
            '中位数': float(temp_data[col].median()),
            '标准差': float(temp_data[col].std())
        }

    def get_humidity_stats(self, humidity_col: Optional[str] = None) -> Dict[str, float]:
        humidity_data = self.parse_humidity_data(humidity_col)
        col = humidity_data.columns[-1]
        return {
            '最大值': float(humidity_data[col].max()),
            '最小值': float(humidity_data[col].min()),
            '平均值': float(humidity_data[col].mean()),
            '中位数': float(humidity_data[col].median()),
            '标准差': float(humidity_data[col].std())
        }


class WeatherCSVReader(WeatherDataReader):
    def __init__(self, file_path: str):
        super().__init__(file_path)
        if self.file_format != 'csv':
            raise ValueError("WeatherCSVReader 仅支持 CSV 文件格式")
        self.detected_encoding: Optional[str] = None

    def detect_encoding(self) -> str:
        self.detected_encoding = detect_file_encoding(self.file_path)
        return self.detected_encoding

    def read_csv(self, encoding: Optional[str] = None, auto_detect: bool = True, **kwargs) -> pd.DataFrame:
        if encoding is not None:
            return self.read_data(encoding=encoding, auto_detect_encoding=False, **kwargs)
        elif auto_detect:
            self.detect_encoding()
            print(f"自动检测到文件编码: {self.detected_encoding}")
            return self.read_data(encoding=self.detected_encoding, auto_detect_encoding=False, **kwargs)
        else:
            return self.read_data(auto_detect_encoding=True, **kwargs)

    def read_csv_with_retry(self, **kwargs) -> pd.DataFrame:
        print("正在尝试读取 CSV 文件（自动尝试多种编码）...")
        try:
            return self.read_csv(**kwargs)
        except Exception as e:
            print(f"使用指定参数读取失败: {e}")
            print("尝试使用自动编码检测...")
            return self.read_data(auto_detect_encoding=True, **kwargs)


if __name__ == "__main__":
    print("天气数据读取模块")
    print("支持的格式: CSV, Excel, JSON")
    print("\n支持的编码自动检测: utf-8-sig, utf-8, gbk, gb2312, gb18030, latin1")
    print("\n使用方法:")
    print("  reader = WeatherCSVReader('weather_data.csv')")
    print("  reader.read_csv()  # 自动检测编码")
    print("  reader.read_csv(encoding='gbk')  # 指定编码")
    print("  temp_data = reader.parse_temperature_data()")
    print("  humidity_data = reader.parse_humidity_data()")
    print("  temp_humidity_data = reader.parse_temp_humidity_data()")
