import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta


class DailyAverageCalculator:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self._add_time_features()
        self.results = {}

    def _add_time_features(self):
        if 'year' not in self.df.columns:
            self.df['year'] = self.df['date'].dt.year
        if 'month' not in self.df.columns:
            self.df['month'] = self.df['date'].dt.month
        if 'week' not in self.df.columns:
            self.df['week'] = self.df['date'].dt.isocalendar().week
        if 'day_of_week' not in self.df.columns:
            self.df['day_of_week'] = self.df['date'].dt.dayofweek
        if 'day_name' not in self.df.columns:
            self.df['day_name'] = self.df['date'].dt.day_name()
        if 'is_weekend' not in self.df.columns:
            self.df['is_weekend'] = self.df['day_of_week'].isin([5, 6]).astype(int)
        if 'quarter' not in self.df.columns:
            self.df['quarter'] = self.df['date'].dt.quarter

    def calculate_overall_average(self) -> Dict[str, float]:
        total_steps = self.df['steps'].sum()
        total_days = len(self.df)
        avg_steps = self.df['steps'].mean()
        median_steps = self.df['steps'].median()
        
        result = {
            'total_steps': int(total_steps),
            'total_days': total_days,
            'average_steps': int(avg_steps),
            'median_steps': int(median_steps),
            'std_steps': int(self.df['steps'].std()),
            'min_steps': int(self.df['steps'].min()),
            'max_steps': int(self.df['steps'].max())
        }
        
        self.results['overall'] = result
        return result

    def calculate_weekday_weekend_average(self) -> Dict[str, Dict[str, float]]:
        weekday_df = self.df[self.df['is_weekend'] == 0]
        weekend_df = self.df[self.df['is_weekend'] == 1]
        
        result = {
            'weekday': {
                'average_steps': int(weekday_df['steps'].mean()) if len(weekday_df) > 0 else 0,
                'total_days': len(weekday_df),
                'total_steps': int(weekday_df['steps'].sum()) if len(weekday_df) > 0 else 0,
                'median_steps': int(weekday_df['steps'].median()) if len(weekday_df) > 0 else 0
            },
            'weekend': {
                'average_steps': int(weekend_df['steps'].mean()) if len(weekend_df) > 0 else 0,
                'total_days': len(weekend_df),
                'total_steps': int(weekend_df['steps'].sum()) if len(weekend_df) > 0 else 0,
                'median_steps': int(weekend_df['steps'].median()) if len(weekend_df) > 0 else 0
            }
        }
        
        result['difference'] = result['weekday']['average_steps'] - result['weekend']['average_steps']
        result['difference_pct'] = round(
            (result['difference'] / result['weekend']['average_steps'] * 100) 
            if result['weekend']['average_steps'] > 0 else 0, 1
        )
        
        self.results['weekday_weekend'] = result
        return result

    def calculate_daily_average(self) -> pd.DataFrame:
        daily_avg = self.df.groupby('day_name')['steps'].agg([
            'mean', 'median', 'count', 'sum', 'min', 'max', 'std'
        ]).reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        
        daily_avg.columns = [
            'average_steps', 'median_steps', 'total_days', 
            'total_steps', 'min_steps', 'max_steps', 'std_steps'
        ]
        
        daily_avg = daily_avg.fillna(0)
        daily_avg['average_steps'] = daily_avg['average_steps'].astype(int)
        daily_avg['median_steps'] = daily_avg['median_steps'].astype(int)
        daily_avg['total_steps'] = daily_avg['total_steps'].astype(int)
        daily_avg['min_steps'] = daily_avg['min_steps'].astype(int)
        daily_avg['max_steps'] = daily_avg['max_steps'].astype(int)
        daily_avg['std_steps'] = daily_avg['std_steps'].astype(int)
        
        day_name_map = {
            'Monday': '周一', 'Tuesday': '周二', 'Wednesday': '周三',
            'Thursday': '周四', 'Friday': '周五', 'Saturday': '周六', 'Sunday': '周日'
        }
        daily_avg['day_cn'] = daily_avg.index.map(day_name_map)
        
        self.results['daily'] = daily_avg.to_dict('index')
        return daily_avg

    def calculate_weekly_average(self) -> pd.DataFrame:
        weekly_avg = self.df.groupby(['year', 'week'])['steps'].agg([
            'mean', 'median', 'count', 'sum', 'min', 'max'
        ]).reset_index()
        
        weekly_avg.columns = [
            'year', 'week', 'average_steps', 'median_steps', 
            'total_days', 'total_steps', 'min_steps', 'max_steps'
        ]
        
        weekly_avg['period'] = weekly_avg.apply(
            lambda x: f"{int(x['year'])}年第{int(x['week'])}周", axis=1
        )
        
        weekly_avg['average_steps'] = weekly_avg['average_steps'].astype(int)
        weekly_avg['median_steps'] = weekly_avg['median_steps'].astype(int)
        weekly_avg['total_steps'] = weekly_avg['total_steps'].astype(int)
        
        self.results['weekly'] = weekly_avg.to_dict('records')
        return weekly_avg

    def calculate_monthly_average(self) -> pd.DataFrame:
        monthly_avg = self.df.groupby(['year', 'month'])['steps'].agg([
            'mean', 'median', 'count', 'sum', 'min', 'max'
        ]).reset_index()
        
        monthly_avg.columns = [
            'year', 'month', 'average_steps', 'median_steps', 
            'total_days', 'total_steps', 'min_steps', 'max_steps'
        ]
        
        monthly_avg['period'] = monthly_avg.apply(
            lambda x: f"{int(x['year'])}年{int(x['month'])}月", axis=1
        )
        
        monthly_avg['average_steps'] = monthly_avg['average_steps'].astype(int)
        monthly_avg['median_steps'] = monthly_avg['median_steps'].astype(int)
        monthly_avg['total_steps'] = monthly_avg['total_steps'].astype(int)
        
        self.results['monthly'] = monthly_avg.to_dict('records')
        return monthly_avg

    def calculate_quarterly_average(self) -> pd.DataFrame:
        quarterly_avg = self.df.groupby(['year', 'quarter'])['steps'].agg([
            'mean', 'median', 'count', 'sum', 'min', 'max'
        ]).reset_index()
        
        quarterly_avg.columns = [
            'year', 'quarter', 'average_steps', 'median_steps', 
            'total_days', 'total_steps', 'min_steps', 'max_steps'
        ]
        
        quarterly_avg['period'] = quarterly_avg.apply(
            lambda x: f"{int(x['year'])}年Q{int(x['quarter'])}", axis=1
        )
        
        quarterly_avg['average_steps'] = quarterly_avg['average_steps'].astype(int)
        quarterly_avg['median_steps'] = quarterly_avg['median_steps'].astype(int)
        quarterly_avg['total_steps'] = quarterly_avg['total_steps'].astype(int)
        
        self.results['quarterly'] = quarterly_avg.to_dict('records')
        return quarterly_avg

    def calculate_yearly_average(self) -> pd.DataFrame:
        yearly_avg = self.df.groupby('year')['steps'].agg([
            'mean', 'median', 'count', 'sum', 'min', 'max'
        ]).reset_index()
        
        yearly_avg.columns = [
            'year', 'average_steps', 'median_steps', 
            'total_days', 'total_steps', 'min_steps', 'max_steps'
        ]
        
        yearly_avg['period'] = yearly_avg['year'].astype(str) + '年'
        
        yearly_avg['average_steps'] = yearly_avg['average_steps'].astype(int)
        yearly_avg['median_steps'] = yearly_avg['median_steps'].astype(int)
        yearly_avg['total_steps'] = yearly_avg['total_steps'].astype(int)
        
        self.results['yearly'] = yearly_avg.to_dict('records')
        return yearly_avg

    def calculate_moving_average(self, window: int = 7) -> pd.DataFrame:
        df_sorted = self.df.sort_values('date').copy()
        df_sorted[f'ma_{window}'] = df_sorted['steps'].rolling(window=window, center=True).mean()
        df_sorted[f'ma_{window}'] = df_sorted[f'ma_{window}'].fillna(df_sorted['steps'])
        
        result = df_sorted[['date', 'steps', f'ma_{window}']].copy()
        result[f'ma_{window}'] = result[f'ma_{window}'].astype(int)
        
        return result

    def calculate_cumulative_average(self) -> pd.DataFrame:
        df_sorted = self.df.sort_values('date').copy()
        df_sorted['cumulative_steps'] = df_sorted['steps'].cumsum()
        df_sorted['cumulative_days'] = range(1, len(df_sorted) + 1)
        df_sorted['cumulative_avg'] = (df_sorted['cumulative_steps'] / df_sorted['cumulative_days']).astype(int)
        
        return df_sorted[['date', 'steps', 'cumulative_steps', 'cumulative_days', 'cumulative_avg']]

    def calculate_period_average(self, start_date: str, end_date: str) -> Dict[str, float]:
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        mask = (self.df['date'] >= start) & (self.df['date'] <= end)
        period_df = self.df[mask]
        
        if len(period_df) == 0:
            return {'average_steps': 0, 'total_days': 0, 'total_steps': 0}
        
        result = {
            'average_steps': int(period_df['steps'].mean()),
            'total_days': len(period_df),
            'total_steps': int(period_df['steps'].sum()),
            'median_steps': int(period_df['steps'].median()),
            'start_date': start_date,
            'end_date': end_date
        }
        
        return result

    def get_top_days(self, n: int = 10, highest: bool = True) -> pd.DataFrame:
        sorted_df = self.df.sort_values('steps', ascending=not highest).head(n)
        return sorted_df[['date', 'steps', 'day_name']].copy()

    def get_all_results(self) -> Dict:
        self.calculate_overall_average()
        self.calculate_weekday_weekend_average()
        self.calculate_daily_average()
        self.calculate_weekly_average()
        self.calculate_monthly_average()
        return self.results

    def print_daily_average_report(self):
        overall = self.calculate_overall_average()
        weekday_weekend = self.calculate_weekday_weekend_average()
        daily_avg = self.calculate_daily_average()
        
        print("\n" + "=" * 70)
        print("                    日均步数统计报告")
        print("=" * 70)
        
        print(f"\n📊 总体统计:")
        print(f"  统计天数: {overall['total_days']} 天")
        print(f"  总步数: {overall['total_steps']:,} 步")
        print(f"  日均步数: {overall['average_steps']:,} 步")
        print(f"  中位数: {overall['median_steps']:,} 步")
        print(f"  步数范围: {overall['min_steps']:,} - {overall['max_steps']:,} 步")
        
        print(f"\n📅 工作日 vs 周末:")
        print(f"  工作日日均: {weekday_weekend['weekday']['average_steps']:,} 步 (共 {weekday_weekend['weekday']['total_days']} 天)")
        print(f"  周末日均: {weekday_weekend['weekend']['average_steps']:,} 步 (共 {weekday_weekend['weekend']['total_days']} 天)")
        diff = weekday_weekend['difference']
        diff_pct = weekday_weekend['difference_pct']
        if diff > 0:
            print(f"  差异: 工作日比周末多 {diff:,} 步 (+{diff_pct}%)")
        else:
            print(f"  差异: 工作日比周末少 {abs(diff):,} 步 ({diff_pct}%)")
        
        print(f"\n📆 各周日均步数排行:")
        daily_sorted = daily_avg.sort_values('average_steps', ascending=False)
        for idx, (day, row) in enumerate(daily_sorted.iterrows(), 1):
            bar = '█' * int(row['average_steps'] / 500)
            print(f"  {idx}. {row['day_cn']}: {row['average_steps']:,} 步 {bar}")
        
        print("\n" + "=" * 70)
