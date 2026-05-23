import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
import pandas as pd
import numpy as np


class StepVisualizer:
    def __init__(self, df, output_dir='output'):
        self.df = df
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        sns.set_style('whitegrid')
        sns.set_palette('husl')
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
        plt.rcParams['axes.unicode_minus'] = False
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 150
        plt.rcParams['figure.figsize'] = (12, 6)

    def plot_daily_steps(self):
        fig, ax = plt.subplots(figsize=(14, 7))
        
        ax.plot(self.df['date'], self.df['steps'], 
                marker='o', markersize=4, linewidth=1.5, 
                color='#2E86AB', label='每日步数')
        
        ax.axhline(y=10000, color='#F24236', linestyle='--', 
                   linewidth=1.5, alpha=0.8, label='1万步目标')
        ax.axhline(y=self.df['steps'].mean(), color='#F6AE2D', 
                   linestyle='-.', linewidth=1.5, alpha=0.8, 
                   label=f'平均步数 ({int(self.df["steps"].mean())})')
        
        ax.fill_between(self.df['date'], self.df['steps'], alpha=0.2, color='#2E86AB')
        
        ax.set_title('每日运动步数趋势', fontsize=16, pad=20, fontweight='bold')
        ax.set_xlabel('日期', fontsize=12)
        ax.set_ylabel('步数', fontsize=12)
        ax.legend(loc='upper left', fontsize=10)
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.xticks(rotation=45)
        
        try:
            max_step = self.df['steps'].max()
            min_step = self.df['steps'].min()
            
            max_row = self.df[self.df['steps'] == max_step].iloc[0]
            min_row = self.df[self.df['steps'] == min_step].iloc[0]
            
            ax.annotate(f'最高: {max_step:,}\n({max_row["date"].strftime("%m-%d")})',
                       xy=(max_row['date'], max_step),
                       xytext=(10, 10), textcoords='offset points',
                       bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.5),
                       arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
            
            ax.annotate(f'最低: {min_step:,}\n({min_row["date"].strftime("%m-%d")})',
                       xy=(min_row['date'], min_step),
                       xytext=(10, -30), textcoords='offset points',
                       bbox=dict(boxstyle='round,pad=0.5', fc='lightblue', alpha=0.5),
                       arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
        except Exception as e:
            print(f"警告: 标注日期时出错: {e}")
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'daily_steps_trend.png'), 
                   bbox_inches='tight', facecolor='white')
        plt.close()

    def plot_weekly_trend(self):
        weekly_data = self.df.groupby(['year', 'week'])['steps'].agg([
            'sum', 'mean'
        ]).reset_index()
        weekly_data['period'] = weekly_data.apply(
            lambda x: f'{x["year"]}-W{int(x["week"]):02d}', axis=1
        )
        
        fig, ax1 = plt.subplots(figsize=(14, 7))
        
        x = np.arange(len(weekly_data))
        width = 0.6
        
        bars = ax1.bar(x, weekly_data['sum'], width, 
                       color='#4ECDC4', alpha=0.7, label='周总步数')
        
        ax1.set_title('每周运动步数统计', fontsize=16, pad=20, fontweight='bold')
        ax1.set_xlabel('周', fontsize=12)
        ax1.set_ylabel('总步数', fontsize=12, color='#4ECDC4')
        ax1.tick_params(axis='y', labelcolor='#4ECDC4')
        ax1.set_xticks(x)
        ax1.set_xticklabels(weekly_data['period'], rotation=45, ha='right')
        
        ax2 = ax1.twinx()
        ax2.plot(x, weekly_data['mean'], color='#FF6B6B', 
                marker='s', markersize=6, linewidth=2, label='周平均步数')
        ax2.set_ylabel('平均步数', fontsize=12, color='#FF6B6B')
        ax2.tick_params(axis='y', labelcolor='#FF6B6B')
        
        for i, v in enumerate(weekly_data['sum']):
            ax1.text(i, v, f'{v:,}', ha='center', va='bottom', fontsize=8)
        
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'weekly_analysis.png'), 
                   bbox_inches='tight', facecolor='white')
        plt.close()

    def plot_monthly_analysis(self):
        monthly_data = self.df.groupby(['year', 'month'])['steps'].agg([
            'sum', 'mean', 'max', 'min'
        ]).reset_index()
        monthly_data['period'] = monthly_data.apply(
            lambda x: f'{x["year"]}-{int(x["month"]):02d}', axis=1
        )
        
        fig, axes = plt.subplots(2, 1, figsize=(14, 10))
        
        x = np.arange(len(monthly_data))
        width = 0.5
        
        bars = axes[0].bar(x, monthly_data['sum'], width, 
                          color='#9B5DE5', alpha=0.7)
        axes[0].set_title('每月总步数', fontsize=14, pad=15, fontweight='bold')
        axes[0].set_ylabel('总步数', fontsize=11)
        axes[0].set_xticks(x)
        axes[0].set_xticklabels(monthly_data['period'], rotation=45, ha='right')
        
        for i, v in enumerate(monthly_data['sum']):
            axes[0].text(i, v, f'{v:,}', ha='center', va='bottom', fontsize=9)
        
        axes[1].plot(x, monthly_data['mean'], color='#00BBF9', 
                    marker='o', markersize=8, linewidth=2, label='平均')
        axes[1].plot(x, monthly_data['max'], color='#F15BB5', 
                    marker='^', markersize=6, linewidth=1.5, label='最高')
        axes[1].plot(x, monthly_data['min'], color='#FEE440', 
                    marker='v', markersize=6, linewidth=1.5, label='最低')
        
        axes[1].set_title('每月步数统计', fontsize=14, pad=15, fontweight='bold')
        axes[1].set_xlabel('月份', fontsize=11)
        axes[1].set_ylabel('步数', fontsize=11)
        axes[1].set_xticks(x)
        axes[1].set_xticklabels(monthly_data['period'], rotation=45, ha='right')
        axes[1].legend()
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'monthly_analysis.png'), 
                   bbox_inches='tight', facecolor='white')
        plt.close()

    def plot_steps_distribution(self):
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        axes[0, 0].hist(self.df['steps'], bins=20, color='#2A9D8F', 
                       edgecolor='black', alpha=0.7)
        axes[0, 0].axvline(self.df['steps'].mean(), color='#E76F51', 
                          linestyle='--', linewidth=2, label='均值')
        axes[0, 0].axvline(self.df['steps'].median(), color='#F4A261', 
                          linestyle='-.', linewidth=2, label='中位数')
        axes[0, 0].set_title('步数分布直方图', fontsize=12, pad=10, fontweight='bold')
        axes[0, 0].set_xlabel('步数')
        axes[0, 0].set_ylabel('天数')
        axes[0, 0].legend()
        
        sns.boxplot(y=self.df['steps'], ax=axes[0, 1], color='#E9C46A')
        axes[0, 1].set_title('步数箱线图', fontsize=12, pad=10, fontweight='bold')
        axes[0, 1].set_ylabel('步数')
        
        weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 
                        'Friday', 'Saturday', 'Sunday']
        weekday_names_cn = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        weekday_data = self.df.groupby('day_name')['steps'].mean().reindex(weekday_order)
        
        axes[1, 0].bar(weekday_names_cn, weekday_data.values, 
                      color=['#264653']*5 + ['#E76F51']*2, alpha=0.7)
        axes[1, 0].set_title('各周日平均步数', fontsize=12, pad=10, fontweight='bold')
        axes[1, 0].set_ylabel('平均步数')
        axes[1, 0].tick_params(axis='x', rotation=0)
        
        for i, v in enumerate(weekday_data.values):
            axes[1, 0].text(i, v, f'{int(v)}', ha='center', va='bottom', fontsize=9)
        
        ranges = [0, 5000, 8000, 10000, 15000, float('inf')]
        labels = ['<5000', '5000-8000', '8000-10000', '10000-15000', '>15000']
        colors = ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#264653']
        
        self.df['step_range'] = pd.cut(self.df['steps'], bins=ranges, 
                                       labels=labels, right=False)
        range_counts = self.df['step_range'].value_counts().sort_index()
        
        wedges, texts, autotexts = axes[1, 1].pie(
            range_counts.values, labels=range_counts.index,
            autopct='%1.1f%%', colors=colors, startangle=90
        )
        axes[1, 1].set_title('步数区间分布', fontsize=12, pad=10, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'steps_distribution.png'), 
                   bbox_inches='tight', facecolor='white')
        plt.close()

    def plot_heatmap(self):
        pivot_data = self.df.pivot_table(
            index='day_of_week', 
            columns='week', 
            values='steps', 
            aggfunc='mean'
        )
        
        weekday_names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        pivot_data.index = weekday_names
        
        fig, ax = plt.subplots(figsize=(14, 6))
        
        sns.heatmap(pivot_data, cmap='YlGnBu', annot=True, fmt='.0f', 
                   cbar_kws={'label': '平均步数'}, ax=ax)
        
        ax.set_title('周-日步数热力图', fontsize=14, pad=15, fontweight='bold')
        ax.set_xlabel('周数')
        ax.set_ylabel('星期')
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'weekly_heatmap.png'), 
                   bbox_inches='tight', facecolor='white')
        plt.close()

    def plot_weekly_average_bar(self):
        weekly_data = self.df.groupby(['year', 'week']).agg({
            'steps': ['mean', 'max', 'min', 'count']
        }).reset_index()
        weekly_data.columns = ['year', 'week', 'avg_steps', 'max_steps', 'min_steps', 'days']
        weekly_data['period'] = weekly_data.apply(
            lambda x: f'{int(x["year"])}年第{int(x["week"])}周', axis=1
        )
        
        max_dates = []
        min_dates = []
        for _, row in weekly_data.iterrows():
            try:
                year_val = int(row['year'])
                week_val = int(row['week'])
                week_mask = (self.df['year'] == year_val) & (self.df['week'] == week_val)
                week_df = self.df[week_mask]
                
                if len(week_df) > 0:
                    max_step = week_df['steps'].max()
                    min_step = week_df['steps'].min()
                    
                    max_row = week_df[week_df['steps'] == max_step].iloc[0]
                    min_row = week_df[week_df['steps'] == min_step].iloc[0]
                    
                    max_date = max_row['date'].strftime('%m-%d')
                    min_date = min_row['date'].strftime('%m-%d')
                    max_dates.append(max_date)
                    min_dates.append(min_date)
                else:
                    max_dates.append('N/A')
                    min_dates.append('N/A')
            except Exception as e:
                print(f"警告: 处理第 {row['week']} 周时出错: {e}")
                max_dates.append('N/A')
                min_dates.append('N/A')
        
        weekly_data['max_date'] = max_dates
        weekly_data['min_date'] = min_dates
        
        fig, ax = plt.subplots(figsize=(14, 8))
        
        x = np.arange(len(weekly_data))
        width = 0.6
        
        colors = ['#5DADE2'] * len(weekly_data)
        max_idx = weekly_data['avg_steps'].idxmax()
        min_idx = weekly_data['avg_steps'].idxmin()
        colors[max_idx] = '#E74C3C'
        colors[min_idx] = '#3498DB'
        
        bars = ax.bar(x, weekly_data['avg_steps'], width, color=colors, alpha=0.85, edgecolor='white', linewidth=1)
        
        ax.axhline(y=self.df['steps'].mean(), color='#F39C12', linestyle='--', 
                   linewidth=2, alpha=0.8, label=f'总体平均 ({int(self.df["steps"].mean())}步)')
        
        for i, (bar, avg, max_s, min_s, max_d, min_d) in enumerate(zip(
                bars, weekly_data['avg_steps'], weekly_data['max_steps'], 
                weekly_data['min_steps'], weekly_data['max_date'], weekly_data['min_date'])):
            
            height = bar.get_height()
            
            ax.text(bar.get_x() + bar.get_width()/2., height + 50,
                    f'{int(avg)}步',
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
            
            annotation_text = f'最高:{max_d}({max_s})\n最低:{min_d}({min_s})'
            ax.text(bar.get_x() + bar.get_width()/2., height/2,
                    annotation_text,
                    ha='center', va='center', fontsize=7.5,
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='white', 
                             alpha=0.9, edgecolor='#BDC3C7', linewidth=0.5))
        
        ax.set_title('周均步数统计（标注每周最高/最低日期）', fontsize=16, pad=20, fontweight='bold')
        ax.set_xlabel('统计周期', fontsize=12, labelpad=10)
        ax.set_ylabel('平均步数', fontsize=12, labelpad=10)
        ax.set_xticks(x)
        ax.set_xticklabels(weekly_data['period'], rotation=30, ha='right', fontsize=10)
        
        legend_elements = [
            plt.Rectangle((0, 0), 1, 1, facecolor='#E74C3C', alpha=0.85, label='最高周均'),
            plt.Rectangle((0, 0), 1, 1, facecolor='#3498DB', alpha=0.85, label='最低周均'),
            plt.Line2D([0], [0], color='#F39C12', linestyle='--', linewidth=2, label=f'总体平均 ({int(self.df["steps"].mean())}步)')
        ]
        ax.legend(handles=legend_elements, loc='upper right', fontsize=10, framealpha=0.9)
        
        ax.grid(axis='y', linestyle='--', alpha=0.3)
        ax.set_axisbelow(True)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'weekly_average_bar.png'), 
                   bbox_inches='tight', facecolor='white', dpi=150)
        plt.close()

    def plot_weekly_extremes(self):
        weekly_data = self.df.groupby(['year', 'week']).agg({
            'steps': ['max', 'min', 'mean']
        }).reset_index()
        weekly_data.columns = ['year', 'week', 'max_steps', 'min_steps', 'avg_steps']
        weekly_data['period'] = weekly_data.apply(
            lambda x: f'{int(x["year"])}W{int(x["week"]):02d}', axis=1
        )
        
        max_dates = []
        min_dates = []
        for _, row in weekly_data.iterrows():
            try:
                year_val = int(row['year'])
                week_val = int(row['week'])
                week_mask = (self.df['year'] == year_val) & (self.df['week'] == week_val)
                week_df = self.df[week_mask]
                
                if len(week_df) > 0:
                    max_step = week_df['steps'].max()
                    min_step = week_df['steps'].min()
                    
                    max_row = week_df[week_df['steps'] == max_step].iloc[0]
                    min_row = week_df[week_df['steps'] == min_step].iloc[0]
                    
                    max_date = max_row['date'].strftime('%m-%d')
                    min_date = min_row['date'].strftime('%m-%d')
                    max_dates.append(max_date)
                    min_dates.append(min_date)
                else:
                    max_dates.append('N/A')
                    min_dates.append('N/A')
            except Exception as e:
                print(f"警告: 处理极值第 {row['week']} 周时出错: {e}")
                max_dates.append('N/A')
                min_dates.append('N/A')
        
        weekly_data['max_date'] = max_dates
        weekly_data['min_date'] = min_dates
        
        fig, ax = plt.subplots(figsize=(14, 7))
        
        x = np.arange(len(weekly_data))
        width = 0.35
        
        bars1 = ax.bar(x - width/2, weekly_data['max_steps'], width, 
                       label='周最高步数', color='#E74C3C', alpha=0.8, edgecolor='white')
        bars2 = ax.bar(x + width/2, weekly_data['min_steps'], width, 
                       label='周最低步数', color='#3498DB', alpha=0.8, edgecolor='white')
        
        ax.plot(x, weekly_data['avg_steps'], color='#2ECC71', marker='o', 
                linewidth=2, markersize=6, label='周平均步数', linestyle='-')
        
        for i, (bar, date) in enumerate(zip(bars1, weekly_data['max_date'])):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 100,
                    date, ha='center', va='bottom', fontsize=8, 
                    bbox=dict(boxstyle='round,pad=0.2', fc='red', alpha=0.1, ec='red'))
        
        for i, (bar, date) in enumerate(zip(bars2, weekly_data['min_date'])):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height - 500,
                    date, ha='center', va='top', fontsize=8, 
                    bbox=dict(boxstyle='round,pad=0.2', fc='blue', alpha=0.1, ec='blue'))
        
        ax.set_title('每周最高 vs 最低步数（标注对应日期）', fontsize=16, pad=20, fontweight='bold')
        ax.set_xlabel('周', fontsize=12)
        ax.set_ylabel('步数', fontsize=12)
        ax.set_xticks(x)
        ax.set_xticklabels(weekly_data['period'], fontsize=10)
        ax.legend(loc='upper right', fontsize=10)
        ax.grid(axis='y', linestyle='--', alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'weekly_extremes.png'), 
                   bbox_inches='tight', facecolor='white', dpi=150)
        plt.close()
