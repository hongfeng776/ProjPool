import matplotlib.pyplot as plt
import pandas as pd
from typing import Optional, List, Tuple
import matplotlib.dates as mdates
import os
import numpy as np


class WeatherVisualizer:
    def __init__(self, data: pd.DataFrame, output_dir: str = 'charts'):
        self.data = data
        self.output_dir = output_dir
        
        plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
        plt.rcParams['axes.unicode_minus'] = False
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 300
        plt.rcParams['axes.grid'] = True
        plt.rcParams['grid.alpha'] = 0.3
        plt.rcParams['grid.linestyle'] = '--'
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def save_figure(self, filename: str, dpi: int = 300) -> str:
        filepath = os.path.join(self.output_dir, filename)
        plt.savefig(filepath, dpi=dpi, bbox_inches='tight', facecolor='white')
        print(f"✓ 图表已保存: {filepath}")
        return filepath

    def _add_data_annotation(self, ax, x, y, value, xytext=(0, 10), 
                            fontsize=9, color='red', weight='bold'):
        ax.annotate(f'{value}',
                    xy=(x, y),
                    xytext=xytext,
                    textcoords='offset points',
                    ha='center',
                    va='bottom',
                    fontsize=fontsize,
                    color=color,
                    fontweight=weight,
                    bbox=dict(boxstyle='round,pad=0.3', 
                              facecolor='white', 
                              edgecolor=color, 
                              alpha=0.8))

    def _add_stats_annotation(self, ax, stats_text, x=0.02, y=0.98, fontsize=10):
        ax.text(x, y, stats_text,
                transform=ax.transAxes,
                fontsize=fontsize,
                verticalalignment='top',
                bbox=dict(boxstyle='round,pad=0.5',
                           facecolor='#f8f9fa',
                           edgecolor='#dee2e6',
                           alpha=0.9))

    def plot_temperature_trend(self, date_col: str, temp_col: str, 
                               title: str = "温度趋势图",
                               figsize: tuple = (14, 7),
                               save: bool = False,
                               filename: Optional[str] = None,
                               show: bool = True,
                               show_annotations: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('white')
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        line = ax.plot(df[date_col], df[temp_col], 
                     marker='o', 
                     linestyle='-', 
                     linewidth=2.5, 
                     color='#e03125',
                     markersize=7,
                     markeredgecolor='white',
                     markeredgewidth=1.5,
                     zorder=5)
        
        ax.fill_between(df[date_col], 
                       df[temp_col], 
                       alpha=0.15, 
                       color='#e03125')
        
        if show_annotations:
            max_idx = df[temp_col].idxmax()
            min_idx = df[temp_col].idxmin()
            max_val = df.loc[max_idx, temp_col]
            min_val = df.loc[min_idx, temp_col]
            mean_val = df[temp_col].mean()
            
            self._add_data_annotation(ax, df.loc[max_idx, date_col], 
                                     max_val, f'最高\n{max_val:.1f}°C',
                                     color='#e03125')
            self._add_data_annotation(ax, df.loc[min_idx, date_col], 
                                     min_val, f'最低\n{min_val:.1f}°C',
                                     color='#1982c4',
                                     xytext=(0, -20))
            
            stats_text = f'统计信息:\n最高温: {max_val:.1f}°C\n最低温: {min_val:.1f}°C\n平均温: {mean_val:.1f}°C'
            self._add_stats_annotation(ax, stats_text, x=0.75, y=0.95)
        
        ax.set_xlabel('日期', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_ylabel('温度 (°C)', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.xticks(rotation=45, fontsize=10)
        plt.yticks(fontsize=10)
        
        for spine in ax.spines.values():
            spine.set_edgecolor('#dee2e6')
        
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = f"温度趋势图_{temp_col}.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_temperature_comparison(self, date_col: str, temp_cols: List[str],
                                    title: str = "温度对比图",
                                    figsize: tuple = (14, 7),
                                    save: bool = False,
                                    filename: Optional[str] = None,
                                    show: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('white')
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        colors = ['#e03125', '#1982c4', '#6a4c93', '#1982c4', '#ffca3a']
        markers = ['o', 's', '^', 'D', '*']
        
        for i, col in enumerate(temp_cols):
            ax.plot(df[date_col], df[col], 
                   marker=markers[i % len(markers)], 
                   label=col,
                   linewidth=2, 
                   color=colors[i % len(colors)],
                   markersize=6,
                   markeredgecolor='white',
                   markeredgewidth=1.5)
        
        ax.set_xlabel('日期', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_ylabel('温度 (°C)', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.legend(fontsize=11, framealpha=0.9, loc='best')
        ax.grid(True, alpha=0.3, linestyle='--')
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.xticks(rotation=45, fontsize=10)
        plt.yticks(fontsize=10)
        
        for spine in ax.spines.values():
            spine.set_edgecolor('#dee2e6')
        
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = "温度对比图.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_humidity_bar(self, date_col: str, humidity_col: str,
                          title: str = "湿度柱状图",
                          figsize: tuple = (14, 7),
                          save: bool = False,
                          filename: Optional[str] = None,
                          show: bool = True,
                          show_annotations: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('white')
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        bar_colors = ['#8ac926' if x >= 70 else '#52b69a' if x >= 60 else '#34a0a4' 
                     for x in df[humidity_col]]
        
        bars = ax.bar(df[date_col], df[humidity_col], 
                     width=0.6,
                     color=bar_colors,
                     edgecolor='white',
                     linewidth=1,
                     alpha=0.85)
        
        if show_annotations:
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                       f'{int(height)}%',
                       ha='center', 
                       va='bottom', 
                       fontsize=9,
                       fontweight='bold',
                       color='#1a759f')
            
            max_idx = df[humidity_col].idxmax()
            min_idx = df[humidity_col].idxmin()
            max_val = df.loc[max_idx, humidity_col]
            min_val = df.loc[min_idx, humidity_col]
            mean_val = df[humidity_col].mean()
            
            stats_text = f'统计信息:\n最高湿度: {max_val:.0f}%\n最低湿度: {min_val:.0f}%\n平均湿度: {mean_val:.0f}%'
            self._add_stats_annotation(ax, stats_text, x=0.75, y=0.95)
        
        ax.set_xlabel('日期', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_ylabel('湿度 (%)', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.set_ylim(0, 105)
        ax.grid(True, alpha=0.3, linestyle='--', axis='y')
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.xticks(rotation=45, fontsize=10)
        plt.yticks(fontsize=10)
        
        for spine in ax.spines.values():
            spine.set_edgecolor('#dee2e6')
        
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = f"湿度柱状图_{humidity_col}.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_humidity_trend(self, date_col: str, humidity_col: str,
                            title: str = "湿度趋势图",
                            figsize: tuple = (14, 7),
                            save: bool = False,
                            filename: Optional[str] = None,
                            show: bool = True,
                            show_annotations: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('white')
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        ax.plot(df[date_col], df[humidity_col], 
               marker='s', 
               linestyle='-', 
               color='#52b69a',
               linewidth=2.5,
               markersize=7,
               markeredgecolor='white',
               markeredgewidth=1.5)
        
        ax.fill_between(df[date_col], 
                       df[humidity_col], 
                       alpha=0.15, 
                       color='#52b69a')
        
        if show_annotations:
            max_idx = df[humidity_col].idxmax()
            min_idx = df[humidity_col].idxmin()
            max_val = df.loc[max_idx, humidity_col]
            min_val = df.loc[min_idx, humidity_col]
            mean_val = df[humidity_col].mean()
            
            self._add_data_annotation(ax, df.loc[max_idx, date_col], 
                                     max_val, f'最高\n{max_val:.0f}%',
                                     color='#1a759f')
            self._add_data_annotation(ax, df.loc[min_idx, date_col], 
                                     min_val, f'最低\n{min_val:.0f}%',
                                     color='#e63946',
                                     xytext=(0, -20))
            
            stats_text = f'统计信息:\n最高湿度: {max_val:.0f}%\n最低湿度: {min_val:.0f}%\n平均湿度: {mean_val:.0f}%'
            self._add_stats_annotation(ax, stats_text, x=0.75, y=0.95)
        
        ax.set_xlabel('日期', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_ylabel('湿度 (%)', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.set_ylim(0, 105)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.xticks(rotation=45, fontsize=10)
        plt.yticks(fontsize=10)
        
        for spine in ax.spines.values():
            spine.set_edgecolor('#dee2e6')
        
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = f"湿度趋势图_{humidity_col}.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_wind_speed_trend(self, date_col: str, wind_col: str,
                              title: str = "风速趋势图",
                              figsize: tuple = (14, 7),
                              save: bool = False,
                              filename: Optional[str] = None,
                              show: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        ax.set_facecolor('white')
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        ax.plot(df[date_col], df[wind_col], 
               marker='^', 
               linestyle='-', 
               color='#ff9f1c',
               linewidth=2.5,
               markersize=7,
               markeredgecolor='white',
               markeredgewidth=1.5)
        
        ax.fill_between(df[date_col], 
                       df[wind_col], 
                       alpha=0.15, 
                       color='#ff9f1c')
        
        ax.set_xlabel('日期', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_ylabel('风速 (m/s)', fontsize=13, fontweight='bold', labelpad=10)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, linestyle='--')
        
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.xticks(rotation=45, fontsize=10)
        plt.yticks(fontsize=10)
        
        for spine in ax.spines.values():
            spine.set_edgecolor('#dee2e6')
        
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = f"风速趋势图_{wind_col}.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_statistics_pie(self, data_col: str, title: str = "数据统计图",
                            figsize: tuple = (10, 8),
                            save: bool = False,
                            filename: Optional[str] = None,
                            show: bool = True) -> Optional[str]:
        fig, ax = plt.subplots(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        
        stats = {
            '最大值': self.data[data_col].max(),
            '最小值': self.data[data_col].min(),
            '平均值': self.data[data_col].mean(),
            '中位数': self.data[data_col].median()
        }
        
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd166']
        wedges, texts, autotexts = ax.pie(
            stats.values(), 
            labels=stats.keys(),
            autopct='%1.1f%%',
            colors=colors,
            startangle=90,
            wedgeprops=dict(width=0.4, edgecolor='white', linewidth=2),
            textprops=dict(fontsize=12, fontweight='bold'))
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        plt.tight_layout()
        
        filepath = None
        if save:
            if filename is None:
                filename = f"数据统计图_{data_col}.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath

    def plot_comprehensive_dashboard(self, date_col: str, 
                                   temp_cols: List[str],
                                   humidity_col: str,
                                   title: str = "天气数据综合仪表盘",
                                   figsize: tuple = (16, 10),
                                   save: bool = False,
                                   filename: Optional[str] = None,
                                   show: bool = True) -> Optional[str]:
        fig = plt.figure(figsize=figsize)
        fig.patch.set_facecolor('#f8f9fa')
        
        gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.25)
        
        ax1 = fig.add_subplot(gs[0, 0])
        ax2 = fig.add_subplot(gs[0, 1])
        ax3 = fig.add_subplot(gs[1, :])
        
        df = self.data.copy()
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(date_col)
        
        ax1.set_facecolor('white')
        colors = ['#e03125', '#1982c4', '#6a4c93']
        for i, col in enumerate(temp_cols[:2]):
            ax1.plot(df[date_col], df[col], 
                    marker='o', label=col,
                    linewidth=2, color=colors[i],
                    markersize=5)
        ax1.set_title('温度变化趋势', fontsize=12, fontweight='bold')
        ax1.set_ylabel('温度 (°C)')
        ax1.legend(fontsize=9)
        ax1.grid(True, alpha=0.3)
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=30)
        
        ax2.set_facecolor('white')
        bar_colors = ['#8ac926' if x >= 70 else '#52b69a' if x >= 60 else '#34a0a4' 
                     for x in df[humidity_col]]
        ax2.bar(df[date_col], df[humidity_col], color=bar_colors, alpha=0.8, width=0.6)
        ax2.set_title('湿度分布', fontsize=12, fontweight='bold')
        ax2.set_ylabel('湿度 (%)')
        ax2.set_ylim(0, 100)
        ax2.grid(True, alpha=0.3, axis='y')
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=30)
        
        ax3.set_facecolor('white')
        ax3.plot(df[date_col], df[temp_cols[0]], 
                 marker='o', label='最高温度', color='#e03125', linewidth=2)
        ax3_twin = ax3.twinx()
        ax3_twin.bar(df[date_col], df[humidity_col], 
                     alpha=0.3, color='#52b69a', label='湿度', width=0.4)
        ax3.set_title('温湿度综合对比', fontsize=14, fontweight='bold')
        ax3.set_xlabel('日期')
        ax3.set_ylabel('温度 (°C)', color='#e03125')
        ax3_twin.set_ylabel('湿度 (%)', color='#52b69a')
        ax3.grid(True, alpha=0.3)
        ax3.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45)
        
        fig.suptitle(title, fontsize=18, fontweight='bold', y=0.98)
        
        filepath = None
        if save:
            if filename is None:
                filename = "天气数据综合仪表盘.png"
            filepath = self.save_figure(filename)
        
        if show:
            plt.show()
        else:
            plt.close()
        
        return filepath
