import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def generate_sample_data(days: int = 60, output_file: str = 'data/steps_data.csv') -> str:
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days - 1)
    
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    np.random.seed(42)
    base_steps = np.random.normal(loc=8000, scale=2000, size=days)
    
    weekday_effect = np.where(
        dates.dayofweek < 5,
        np.random.normal(loc=1500, scale=500, size=days),
        np.random.normal(loc=-1000, scale=800, size=days)
    )
    
    steps = base_steps + weekday_effect
    steps = np.clip(steps, 1000, 25000)
    steps = steps.astype(int)
    
    df = pd.DataFrame({
        'date': dates.strftime('%Y-%m-%d'),
        'steps': steps
    })
    
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    return output_file


def generate_sample_excel(output_file: str = 'data/steps_data.xlsx') -> str:
    csv_file = generate_sample_data(days=60, output_file='data/temp_steps.csv')
    df = pd.read_csv(csv_file)
    df.to_excel(output_file, index=False, sheet_name='步数数据')
    os.remove(csv_file)
    return output_file


def is_data_file_exists(config=None) -> bool:
    if config is None:
        from utils.config import Config
        config = Config()
    
    data_file = config.get('data_file', 'data/steps_data.csv')
    return os.path.exists(data_file)


def ensure_sample_data(config=None, force: bool = False) -> str:
    if config is None:
        from utils.config import Config
        config = Config()
    
    data_file = config.get('data_file', 'data/steps_data.csv')
    
    if force or not os.path.exists(data_file):
        print(f"  [自动生成] 正在创建示例数据: {data_file}")
        return generate_sample_data(output_file=data_file)
    
    return data_file
