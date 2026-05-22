import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['figure.dpi'] = 100
plt.rcParams['savefig.dpi'] = 300


class CoffeeFlavorAnalyzer:
    BASE_FLAVOR_COLUMNS = ['酸度', '甜度', '苦度', '醇厚度', '香气', '余韵']
    COLOR_PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C42', '#6C5CE7']
    
    def __init__(self, data_path=None):
        self.data_path = data_path
        self.data = None
        self.flavor_columns = None
        self.sample_name_col = None
        
    def load_csv(self, file_path, encoding='utf-8'):
        try:
            if not Path(file_path).exists():
                raise FileNotFoundError(f"文件不存在: {file_path}")
            
            try:
                self.data = pd.read_csv(file_path, encoding=encoding)
            except UnicodeDecodeError:
                try:
                    self.data = pd.read_csv(file_path, encoding='gbk')
                except UnicodeDecodeError:
                    self.data = pd.read_csv(file_path, encoding='utf-8-sig')
            
            if self.data is None or len(self.data) == 0:
                raise ValueError("CSV 文件为空或格式不正确")
            
            self._validate_and_setup_columns()
            self._print_data_summary()
            return self.data
            
        except FileNotFoundError as e:
            print(f"\n❌ 文件错误: {e}")
            print("   请检查文件路径是否正确")
            raise
        except pd.errors.EmptyDataError:
            print("\n❌ CSV 文件为空，请检查数据文件")
            raise
        except pd.errors.ParserError:
            print("\n❌ CSV 文件解析错误，请检查文件格式")
            raise
        except Exception as e:
            print(f"\n❌ 加载 CSV 文件时发生未知错误: {e}")
            raise
    
    def load_data(self, file_path):
        try:
            file_ext = Path(file_path).suffix.lower()
            if file_ext == '.csv':
                return self.load_csv(file_path)
            elif file_ext in ['.xlsx', '.xls']:
                try:
                    self.data = pd.read_excel(file_path)
                    self._validate_and_setup_columns()
                    self._print_data_summary()
                    return self.data
                except Exception as e:
                    print(f"\n❌ 加载 Excel 文件时发生错误: {e}")
                    raise
            else:
                raise ValueError(f"不支持的文件格式: {file_ext}")
        except Exception as e:
            print(f"\n❌ 加载数据时发生错误: {e}")
            raise
    
    def _validate_and_setup_columns(self):
        try:
            if self.data is None or len(self.data) == 0:
                raise ValueError("数据为空，请检查数据文件")
            
            all_columns = self.data.columns.tolist()
            numeric_cols = self.data.select_dtypes(include=[np.number]).columns.tolist()
            
            self.flavor_columns = [col for col in self.BASE_FLAVOR_COLUMNS if col in numeric_cols]
            
            if not self.flavor_columns:
                self.flavor_columns = numeric_cols
                if not self.flavor_columns:
                    raise ValueError("未找到数值型的风味指标列")
            
            if len(all_columns) > 0:
                if '咖啡豆名称' in all_columns:
                    self.sample_name_col = '咖啡豆名称'
                elif '名称' in all_columns:
                    self.sample_name_col = '名称'
                else:
                    self.sample_name_col = all_columns[0]
        except Exception as e:
            print(f"\n❌ 数据验证时发生错误: {e}")
            raise
    
    def _print_data_summary(self):
        print("\n" + "=" * 60)
        print("                    数据导入成功")
        print("=" * 60)
        print(f"  数据行数: {len(self.data)} 条")
        print(f"  数据列数: {len(self.data.columns)} 列")
        print()
        print("  识别到的基础风味指标:")
        for col in self.flavor_columns:
            print(f"    ✓ {col}")
        print()
        print(f"  样本名称列: {self.sample_name_col}")
        print("=" * 60)
    
    def preview_data(self, n=5, show_flavor_only=False):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            n = min(n, len(self.data))
            print(f"\n📊 前 {n} 条数据预览:")
            print("-" * 80)
            
            if show_flavor_only:
                display_cols = [self.sample_name_col] + self.flavor_columns
                preview_df = self.data[display_cols].head(n)
            else:
                preview_df = self.data.head(n)
            
            print(preview_df.to_string(index=False))
            print("-" * 80)
            return preview_df
        except Exception as e:
            print(f"\n❌ 预览数据时发生错误: {e}")
            raise
    
    def get_flavor_stats(self):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            print("\n📈 基础风味指标统计:")
            print("-" * 80)
            stats = self.data[self.flavor_columns].describe().round(2)
            print(stats)
            print("-" * 80)
            return stats
        except Exception as e:
            print(f"\n❌ 获取统计数据时发生错误: {e}")
            raise
    
    def get_sample_names(self):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            return self.data[self.sample_name_col].tolist()
        except Exception as e:
            print(f"\n❌ 获取样本名称时发生错误: {e}")
            raise
    
    def basic_stats(self):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            return self.data.describe()
        except Exception as e:
            print(f"\n❌ 获取基础统计时发生错误: {e}")
            raise
    
    def plot_single_radar(self, sample_name, save_path=None, show=True, color_index=0):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            sample = self.data[self.data[self.sample_name_col] == sample_name]
            if len(sample) == 0:
                available_samples = ', '.join(self.get_sample_names())
                raise ValueError(f"未找到样本: {sample_name}\n可用样本: {available_samples}")
            
            flavor_values = sample[self.flavor_columns].values[0].tolist()
            flavor_values += flavor_values[:1]
            
            angles = np.linspace(0, 2 * np.pi, len(self.flavor_columns), endpoint=False).tolist()
            angles += angles[:1]
            
            fig, ax = plt.subplots(figsize=(12, 12), subplot_kw=dict(projection='polar'))
            fig.patch.set_facecolor('#FAFAFA')
            ax.set_facecolor('#FFFFFF')
            
            color = self.COLOR_PALETTE[color_index % len(self.COLOR_PALETTE)]
            
            ax.plot(angles, flavor_values, 'o-', linewidth=3, color=color, 
                    markersize=12, markerfacecolor='white', markeredgewidth=2.5, 
                    markeredgecolor=color)
            ax.fill(angles, flavor_values, alpha=0.25, color=color)
            
            ax.set_xticks(angles[:-1])
            labels = ax.set_xticklabels(self.flavor_columns, fontsize=14, fontweight='bold', color='#333333')
            
            for i, label in enumerate(labels):
                angle_deg = angles[i] * 180 / np.pi
                if 90 < angle_deg < 270:
                    label.set_rotation(angle_deg + 180)
                else:
                    label.set_rotation(angle_deg)
                label.set_ha('center')
            
            ax.tick_params(axis='x', pad=25)
            
            ax.set_ylim(0, 10)
            ax.set_yticks([2, 4, 6, 8, 10])
            ax.set_yticklabels(['2', '4', '6', '8', '10'], fontsize=10, color='#666666')
            ax.grid(True, linestyle='--', alpha=0.6, color='#CCCCCC')
            ax.spines['polar'].set_color('#DDDDDD')
            
            title = f"{sample_name}\n风味强度指纹图谱"
            ax.set_title(title, fontsize=20, fontweight='bold', pad=45, color='#333333')
            
            for i, (angle, value) in enumerate(zip(angles[:-1], flavor_values[:-1])):
                ax.text(angle, value + 0.45, f'{value:.1f}', ha='center', va='center', 
                        fontsize=12, fontweight='bold', color=color,
                        bbox=dict(facecolor='white', alpha=0.95, edgecolor=color, 
                                  linewidth=1.5, pad=4, boxstyle='round,pad=0.5'))
            
            info_text = []
            for col in ['产地', '烘焙度']:
                if col in sample.columns:
                    info_text.append(f"{col}: {sample[col].values[0]}")
            if info_text:
                plt.figtext(0.02, 0.02, ' | '.join(info_text), fontsize=12, 
                            ha='left', color='#555555', style='italic')
            
            plt.tight_layout()
            
            if save_path:
                save_path = Path(save_path)
                save_path.parent.mkdir(parents=True, exist_ok=True)
                plt.savefig(save_path, dpi=300, bbox_inches='tight', 
                            facecolor=fig.get_facecolor(), edgecolor='none')
                print(f"✅ 雷达图已保存至: {save_path}")
            
            if show:
                plt.show()
            else:
                plt.close()
            
            return fig
            
        except Exception as e:
            print(f"\n❌ 生成雷达图时发生错误: {e}")
            plt.close()
            raise
    
    def plot_flavor_radar(self, sample_name, flavor_columns=None, ax=None, color_index=0):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            if flavor_columns is None:
                flavor_columns = self.flavor_columns
            
            sample = self.data[self.data[self.sample_name_col] == sample_name]
            if len(sample) == 0:
                raise ValueError(f"未找到样本: {sample_name}")
            
            values = sample[flavor_columns].values[0].tolist()
            values += values[:1]
            
            angles = np.linspace(0, 2 * np.pi, len(flavor_columns), endpoint=False).tolist()
            angles += angles[:1]
            
            if ax is None:
                fig, ax = plt.subplots(figsize=(12, 12), subplot_kw=dict(projection='polar'))
            
            color = self.COLOR_PALETTE[color_index % len(self.COLOR_PALETTE)]
            
            ax.plot(angles, values, 'o-', linewidth=2.5, label=sample_name, color=color,
                    markersize=8, markerfacecolor='white', markeredgewidth=2, markeredgecolor=color)
            ax.fill(angles, values, alpha=0.2, color=color)
            
            ax.set_xticks(angles[:-1])
            labels = ax.set_xticklabels(flavor_columns, fontsize=12, fontweight='bold', color='#333333')
            for i, label in enumerate(labels):
                angle_deg = angles[i] * 180 / np.pi
                if 90 < angle_deg < 270:
                    label.set_rotation(angle_deg + 180)
                else:
                    label.set_rotation(angle_deg)
            
            ax.tick_params(axis='x', pad=20)
            ax.set_ylim(0, 10)
            ax.grid(True, linestyle='--', alpha=0.5, color='#CCCCCC')
            
            return ax
        except Exception as e:
            print(f"\n❌ 生成风味雷达图时发生错误: {e}")
            raise
    
    def compare_samples(self, sample_names, flavor_columns=None, save_path=None, show=True):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            if flavor_columns is None:
                flavor_columns = self.flavor_columns
            
            valid_samples = []
            for name in sample_names:
                if name in self.data[self.sample_name_col].values:
                    valid_samples.append(name)
                else:
                    print(f"⚠️  跳过未找到的样本: {name}")
            
            if not valid_samples:
                raise ValueError("没有有效的样本可以对比")
            
            fig, ax = plt.subplots(figsize=(14, 14), subplot_kw=dict(projection='polar'))
            fig.patch.set_facecolor('#FAFAFA')
            ax.set_facecolor('#FFFFFF')
            
            for i, sample_name in enumerate(valid_samples):
                self.plot_flavor_radar(sample_name, flavor_columns, ax, color_index=i)
            
            ax.set_title("咖啡风味对比图谱", fontsize=20, fontweight='bold', pad=40, color='#333333')
            ax.legend(loc='upper right', bbox_to_anchor=(1.45, 1.1), fontsize=11, 
                      frameon=True, fancybox=True, shadow=True)
            ax.spines['polar'].set_color('#DDDDDD')
            
            plt.tight_layout()
            
            if save_path:
                save_path = Path(save_path)
                save_path.parent.mkdir(parents=True, exist_ok=True)
                plt.savefig(save_path, dpi=300, bbox_inches='tight',
                            facecolor=fig.get_facecolor(), edgecolor='none')
                print(f"✅ 对比图已保存至: {save_path}")
            
            if show:
                plt.show()
            else:
                plt.close()
            
            return fig
        except Exception as e:
            print(f"\n❌ 生成样本对比图时发生错误: {e}")
            plt.close()
            raise
    
    def heatmap_analysis(self, flavor_columns=None, save_path=None, show=True):
        try:
            if self.data is None:
                raise ValueError("请先加载数据")
            
            if flavor_columns is None:
                flavor_columns = self.flavor_columns
            
            flavor_data = self.data[flavor_columns]
            corr_matrix = flavor_data.corr()
            
            fig = plt.figure(figsize=(12, 10))
            fig.patch.set_facecolor('#FAFAFA')
            
            sns.heatmap(corr_matrix, annot=True, cmap='RdBu_r', center=0, 
                        square=True, linewidths=1.5, fmt='.2f',
                        annot_kws={'size': 12, 'weight': 'bold'},
                        cbar_kws={'shrink': 0.8, 'label': '相关系数'})
            
            plt.title("风味指标相关性热力图", fontsize=18, fontweight='bold', pad=25, color='#333333')
            plt.xticks(fontsize=11, fontweight='bold')
            plt.yticks(fontsize=11, fontweight='bold')
            plt.tight_layout()
            
            if save_path:
                save_path = Path(save_path)
                save_path.parent.mkdir(parents=True, exist_ok=True)
                plt.savefig(save_path, dpi=300, bbox_inches='tight',
                            facecolor=fig.get_facecolor(), edgecolor='none')
                print(f"✅ 热力图已保存至: {save_path}")
            
            if show:
                plt.show()
            else:
                plt.close()
            
            return fig
        except Exception as e:
            print(f"\n❌ 生成热力图时发生错误: {e}")
            plt.close()
            raise


def main():
    print("=" * 60)
    print("                咖啡风味指纹图谱分析器")
    print("=" * 60)
    print()
    
    analyzer = CoffeeFlavorAnalyzer()
    
    data_file = Path(__file__).parent / "data" / "coffee_flavors.csv"
    
    if data_file.exists():
        print(f"找到示例数据文件: {data_file.name}")
        print("正在自动加载示例数据...")
        
        analyzer.load_csv(str(data_file))
        analyzer.preview_data(n=5, show_flavor_only=True)
        analyzer.get_flavor_stats()
        
        print("\n已加载的咖啡豆样本:")
        samples = analyzer.get_sample_names()
        for i, sample in enumerate(samples, 1):
            print(f"  {i}. {sample}")
    else:
        print("项目结构:")
        print("  data/      - 存放原始数据文件")
        print("  src/       - 存放源代码模块")
        print("  output/    - 存放分析结果和图表")
        print("  examples/  - 存放示例数据和脚本")
        print()
        
        print("可用功能:")
        print("  1. load_csv() / load_data() - 加载数据 (CSV/Excel)")
        print("  2. preview_data() - 数据预览")
        print("  3. get_flavor_stats() - 风味指标统计")
        print("  4. plot_flavor_radar() - 单样本风味雷达图")
        print("  5. compare_samples() - 多样本风味对比")
        print("  6. heatmap_analysis() - 风味相关性热力图")
        print()
        print("提示: 将 CSV 数据文件放入 data/ 目录后开始分析")
    
    print()
    print("=" * 60)
    print("使用示例:")
    print("  analyzer = CoffeeFlavorAnalyzer()")
    print("  analyzer.load_csv('data/coffee_flavors.csv')")
    print("  analyzer.preview_data()")
    print("  analyzer.get_flavor_stats()")
    print("=" * 60)


if __name__ == "__main__":
    main()
