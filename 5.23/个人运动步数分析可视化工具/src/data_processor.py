import os
import pandas as pd
import numpy as np
from datetime import datetime


class DataProcessor:
    def __init__(self, data_file):
        self.data_file = data_file
        self.df = None
        self.stats = {}

    def load_data(self):
        file_ext = os.path.splitext(self.data_file)[1].lower()
        
        try:
            if file_ext == '.csv':
                self.df = pd.read_csv(self.data_file)
            elif file_ext in ['.xlsx', '.xls']:
                self.df = pd.read_excel(self.data_file)
            else:
                raise ValueError(f"不支持的文件格式: {file_ext}")
            
            return True
        except Exception as e:
            print(f"[错误] 加载数据失败: {e}")
            return False

    def clean_data(self):
        if self.df is None:
            return

        self._normalize_columns()
        self._convert_date_column()
        self._convert_steps_column()
        self._remove_duplicates()
        self._handle_missing_values()
        self._sort_by_date()
        self._add_time_features()

    def _normalize_columns(self):
        self.df.columns = self.df.columns.str.strip().str.lower()
        
        date_aliases = ['date', '日期', '时间', 'datestr']
        steps_aliases = ['steps', '步数', 'step_count', '步行数']
        
        for col in self.df.columns:
            if col in date_aliases:
                self.df.rename(columns={col: 'date'}, inplace=True)
                break
        
        for col in self.df.columns:
            if col in steps_aliases:
                self.df.rename(columns={col: 'steps'}, inplace=True)
                break

    def _convert_date_column(self):
        if 'date' not in self.df.columns:
            raise ValueError("数据中缺少日期列")
        
        self.df['date'] = pd.to_datetime(self.df['date'], errors='coerce')
        self.df = self.df.dropna(subset=['date'])

    def _convert_steps_column(self):
        if 'steps' not in self.df.columns:
            raise ValueError("数据中缺少步数列")
        
        self.df['steps'] = pd.to_numeric(self.df['steps'], errors='coerce')
        self.df = self.df.dropna(subset=['steps'])
        self.df['steps'] = self.df['steps'].astype(int)

    def _remove_duplicates(self):
        self.df = self.df.drop_duplicates(subset=['date'], keep='last')

    def _handle_missing_values(self):
        self.df = self.df[self.df['steps'] >= 0]

    def _sort_by_date(self):
        self.df = self.df.sort_values('date').reset_index(drop=True)

    def _add_time_features(self):
        self.df['year'] = self.df['date'].dt.year
        self.df['month'] = self.df['date'].dt.month
        self.df['week'] = self.df['date'].dt.isocalendar().week
        self.df['day_of_week'] = self.df['date'].dt.dayofweek
        self.df['day_name'] = self.df['date'].dt.day_name()
        self.df['is_weekend'] = self.df['day_of_week'].isin([5, 6]).astype(int)

    def calculate_statistics(self):
        if self.df is None or len(self.df) == 0:
            return

        steps = self.df['steps']
        
        self.stats = {
            'total_days': len(self.df),
            'total_steps': int(steps.sum()),
            'avg_steps': int(steps.mean()),
            'median_steps': int(steps.median()),
            'max_steps': int(steps.max()),
            'min_steps': int(steps.min()),
            'std_steps': int(steps.std()),
            'max_date': self.df.loc[steps.idxmax(), 'date'].strftime('%Y-%m-%d'),
            'min_date': self.df.loc[steps.idxmin(), 'date'].strftime('%Y-%m-%d'),
            'start_date': self.df['date'].min().strftime('%Y-%m-%d'),
            'end_date': self.df['date'].max().strftime('%Y-%m-%d'),
            'days_above_10000': int((steps >= 10000).sum()),
            'days_above_8000': int((steps >= 8000).sum()),
            'days_below_5000': int((steps < 5000).sum()),
        }

        self.stats['pct_above_10000'] = round(
            self.stats['days_above_10000'] / self.stats['total_days'] * 100, 1
        )
        
        weekday_avg = self.df[self.df['is_weekend'] == 0]['steps'].mean()
        weekend_avg = self.df[self.df['is_weekend'] == 1]['steps'].mean()
        
        self.stats['weekday_avg'] = int(weekday_avg) if not np.isnan(weekday_avg) else 0
        self.stats['weekend_avg'] = int(weekend_avg) if not np.isnan(weekend_avg) else 0

    def get_weekly_summary(self):
        weekly = self.df.groupby(['year', 'week'])['steps'].agg([
            'sum', 'mean', 'max', 'min', 'count'
        ]).reset_index()
        weekly.columns = ['year', 'week', 'total_steps', 'avg_steps', 'max_steps', 'min_steps', 'days']
        return weekly

    def get_monthly_summary(self):
        monthly = self.df.groupby(['year', 'month'])['steps'].agg([
            'sum', 'mean', 'max', 'min', 'count'
        ]).reset_index()
        monthly.columns = ['year', 'month', 'total_steps', 'avg_steps', 'max_steps', 'min_steps', 'days']
        return monthly

    def get_weekday_summary(self):
        weekday = self.df.groupby('day_name')['steps'].agg([
            'mean', 'count'
        ]).reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        return weekday
