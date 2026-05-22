import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import time
import threading
from datetime import datetime
from collections import deque
from pynput import keyboard


class KeystrokeRhythmSystem:
    def __init__(self):
        self.keystroke_data = []
        self.key_press_queues = {}
        self.last_release_time = None
        self.is_recording = False
        self.listener = None
        self.listener_thread = None
        self._lock = threading.Lock()
        self.user_templates = {}
        self.signature_weights = {
            'mean_flight_time': 0.25,
            'std_flight_time': 0.2,
            'cv_flight_time': 0.15,
            'mean_dwell_time': 0.2,
            'std_dwell_time': 0.1,
            'cv_dwell_time': 0.1
        }

    def _on_press(self, key):
        if not self.is_recording:
            return True

        try:
            key_name = key.char if hasattr(key, 'char') and key.char else str(key)
        except AttributeError:
            key_name = str(key)

        press_time = time.time()

        with self._lock:
            if key_name not in self.key_press_queues:
                self.key_press_queues[key_name] = deque()
            self.key_press_queues[key_name].append(press_time)

        return True

    def _on_release(self, key):
        if not self.is_recording:
            return True

        try:
            key_name = key.char if hasattr(key, 'char') and key.char else str(key)
        except AttributeError:
            key_name = str(key)

        release_time = time.time()

        with self._lock:
            if key_name in self.key_press_queues and len(self.key_press_queues[key_name]) > 0:
                press_time = self.key_press_queues[key_name].popleft()
                dwell_time = release_time - press_time

                flight_time = release_time - self.last_release_time if self.last_release_time else 0

                keystroke = {
                    'timestamp': datetime.now().isoformat(),
                    'key': key_name,
                    'press_time': press_time,
                    'release_time': release_time,
                    'dwell_time': dwell_time,
                    'flight_time': flight_time
                }

                self.keystroke_data.append(keystroke)
                self.last_release_time = release_time
                print(f"记录: {key_name:<15} | 按键时间: {dwell_time:.4f}s | 间隔时间: {flight_time:.4f}s")

        return True

    def start_recording(self):
        if self.is_recording:
            print("已经在记录中...")
            return

        self.is_recording = True
        self.keystroke_data = []
        self.key_press_queues = {}
        self.last_release_time = None

        self.listener = keyboard.Listener(on_press=self._on_press, on_release=self._on_release)
        self.listener_thread = threading.Thread(target=self.listener.start, daemon=True)
        self.listener_thread.start()

        print(f"[{datetime.now().strftime('%H:%M:%S')}] 开始记录键盘节奏...")
        print("请开始敲击键盘，快速连续按键也能完整记录！\n")

    def stop_recording(self):
        if not self.is_recording:
            print("当前没有在记录")
            return pd.DataFrame()

        self.is_recording = False

        if self.listener:
            self.listener.stop()
            self.listener = None

        if self.listener_thread:
            self.listener_thread.join(timeout=1.0)
            self.listener_thread = None

        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 停止记录，共记录 {len(self.keystroke_data)} 次击键")
        return pd.DataFrame(self.keystroke_data)

    def analyze_rhythm(self, df):
        if df.empty:
            print("没有数据可分析")
            return None

        analysis = {
            'total_keystrokes': len(df),
            'avg_dwell_time': df['dwell_time'].mean(),
            'std_dwell_time': df['dwell_time'].std(),
            'avg_flight_time': df['flight_time'].mean(),
            'std_flight_time': df['flight_time'].std(),
            'median_flight_time': df['flight_time'].median(),
            'total_duration': df['release_time'].iloc[-1] - df['press_time'].iloc[0],
            'keys_per_second': len(df) / (df['release_time'].iloc[-1] - df['press_time'].iloc[0])
        }

        return analysis

    def visualize_rhythm(self, df):
        if df.empty:
            print("没有数据可可视化")
            return

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('键盘节奏分析', fontsize=16, fontweight='bold')

        axes[0, 0].plot(df.index, df['flight_time'], 'b-o', markersize=4, linewidth=1.5, label='间隔时间')
        axes[0, 0].plot(df.index, df['dwell_time'], 'r-s', markersize=4, linewidth=1.5, label='按键时间')
        axes[0, 0].set_title('击键时间序列')
        axes[0, 0].set_xlabel('击键序号')
        axes[0, 0].set_ylabel('时间 (秒)')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)

        axes[0, 1].hist(df['flight_time'], bins=20, color='skyblue', edgecolor='black', alpha=0.7, label='间隔时间')
        axes[0, 1].hist(df['dwell_time'], bins=20, color='salmon', edgecolor='black', alpha=0.7, label='按键时间')
        axes[0, 1].set_title('击键时间分布')
        axes[0, 1].set_xlabel('时间 (秒)')
        axes[0, 1].set_ylabel('频次')
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3, axis='y')

        key_counts = df['key'].value_counts().head(15)
        axes[1, 0].barh(key_counts.index, key_counts.values, color='lightcoral')
        axes[1, 0].set_title('按键频率统计 (Top 15)')
        axes[1, 0].set_xlabel('频次')
        axes[1, 0].grid(True, alpha=0.3, axis='x')

        box_data = [df['dwell_time'].dropna(), df['flight_time'].dropna()]
        bp = axes[1, 1].boxplot(box_data, patch_artist=True, labels=['按键时间', '间隔时间'])
        colors = ['lightgreen', 'lightblue']
        for patch, color in zip(bp['boxes'], colors):
            patch.set_facecolor(color)
            patch.set_alpha(0.7)
        axes[1, 1].set_title('击键时间箱线图')
        axes[1, 1].set_ylabel('时间 (秒)')
        axes[1, 1].grid(True, alpha=0.3, axis='y')

        plt.tight_layout()
        plt.show()

    def extract_rhythm_features(self, df, window_size=5):
        if df.empty or len(df) < window_size:
            print("数据不足，无法提取节奏特征")
            return None

        features = df.copy()

        features['flight_time_ma'] = features['flight_time'].rolling(window=window_size, min_periods=1).mean()
        features['dwell_time_ma'] = features['dwell_time'].rolling(window=window_size, min_periods=1).mean()

        features['flight_time_std'] = features['flight_time'].rolling(window=window_size, min_periods=1).std()
        features['dwell_time_std'] = features['dwell_time'].rolling(window=window_size, min_periods=1).std()

        features['rhythm_variability'] = features['flight_time_std'] / features['flight_time_ma']

        features['relative_time'] = features['release_time'] - features['press_time'].iloc[0]

        features['speed_trend'] = pd.Series(range(len(features))).rolling(window=window_size, min_periods=1).mean()

        return features

    def plot_rhythm_curve(self, df, features=None):
        if df.empty:
            print("没有数据可生成节奏曲线")
            return

        if features is None:
            features = self.extract_rhythm_features(df)

        if features is None:
            return

        fig = plt.figure(figsize=(16, 12))
        fig.suptitle('用户敲击节奏特征曲线分析', fontsize=18, fontweight='bold', y=0.995)

        gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.25)

        ax1 = fig.add_subplot(gs[0, :])
        ax1.plot(features['relative_time'], features['flight_time'], 'b-', alpha=0.5, linewidth=1, label='原始间隔时间')
        ax1.plot(features['relative_time'], features['flight_time_ma'], 'r-', linewidth=2.5, label=f'移动平均 (窗口={5})')
        ax1.fill_between(features['relative_time'],
                         features['flight_time_ma'] - features['flight_time_std'].fillna(0),
                         features['flight_time_ma'] + features['flight_time_std'].fillna(0),
                         color='red', alpha=0.2, label='±1 标准差范围')
        ax1.set_title('击键间隔时间 (Flight Time) 节奏曲线', fontsize=14, fontweight='bold')
        ax1.set_xlabel('相对时间 (秒)')
        ax1.set_ylabel('间隔时间 (秒)')
        ax1.legend(loc='upper right')
        ax1.grid(True, alpha=0.3)

        ax2 = fig.add_subplot(gs[1, 0])
        ax2.plot(features['relative_time'], features['dwell_time'], 'g-', alpha=0.5, linewidth=1, label='原始按键时间')
        ax2.plot(features['relative_time'], features['dwell_time_ma'], 'orange', linewidth=2.5, label='移动平均')
        ax2.set_title('按键持续时间 (Dwell Time) 曲线', fontsize=12, fontweight='bold')
        ax2.set_xlabel('相对时间 (秒)')
        ax2.set_ylabel('按键时间 (秒)')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        ax3 = fig.add_subplot(gs[1, 1])
        ax3.plot(features['relative_time'], features['rhythm_variability'], 'purple', linewidth=2)
        ax3.axhline(y=features['rhythm_variability'].mean(), color='r', linestyle='--', alpha=0.7, label='平均变异系数')
        ax3.set_title('节奏稳定性变异系数曲线', fontsize=12, fontweight='bold')
        ax3.set_xlabel('相对时间 (秒)')
        ax3.set_ylabel('变异系数 (σ/μ)')
        ax3.legend()
        ax3.grid(True, alpha=0.3)

        ax4 = fig.add_subplot(gs[2, 0])
        valid_flight = features['flight_time'].dropna()
        ax4.hist(valid_flight, bins=30, density=True, alpha=0.6, color='skyblue', edgecolor='black')
        from scipy.stats import norm
        mu, std = norm.fit(valid_flight)
        xmin, xmax = ax4.get_xlim()
        x = np.linspace(xmin, xmax, 100)
        p = norm.pdf(x, mu, std)
        ax4.plot(x, p, 'k', linewidth=2, label=f'正态分布\nμ={mu:.4f}, σ={std:.4f}')
        ax4.set_title('间隔时间分布与正态拟合', fontsize=12, fontweight='bold')
        ax4.set_xlabel('间隔时间 (秒)')
        ax4.set_ylabel('概率密度')
        ax4.legend()
        ax4.grid(True, alpha=0.3, axis='y')

        ax5 = fig.add_subplot(gs[2, 1])
        cumulative_keys = np.arange(1, len(features) + 1)
        ax5.plot(features['relative_time'], cumulative_keys, 'b-', linewidth=2)
        z = np.polyfit(features['relative_time'], cumulative_keys, 1)
        p = np.poly1d(z)
        ax5.plot(features['relative_time'], p(features['relative_time']), 'r--', linewidth=2,
                 label=f'线性拟合\n速度={z[0]:.2f} 键/秒')
        ax5.set_title('击键累积曲线与打字速度', fontsize=12, fontweight='bold')
        ax5.set_xlabel('相对时间 (秒)')
        ax5.set_ylabel('累积击键数')
        ax5.legend()
        ax5.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()

    def get_rhythm_signature(self, df):
        if df.empty:
            return None

        features = self.extract_rhythm_features(df)
        if features is None:
            return None

        signature = {
            'mean_flight_time': features['flight_time'].mean(),
            'std_flight_time': features['flight_time'].std(),
            'cv_flight_time': features['flight_time'].std() / features['flight_time'].mean(),
            'mean_dwell_time': features['dwell_time'].mean(),
            'std_dwell_time': features['dwell_time'].std(),
            'cv_dwell_time': features['dwell_time'].std() / features['dwell_time'].mean(),
            'avg_keys_per_second': len(df) / (df['release_time'].iloc[-1] - df['press_time'].iloc[0]),
            'rhythm_consistency': 1 - (features['rhythm_variability'].mean() if 'rhythm_variability' in features else 0)
        }

        return signature

    def register_user(self, username, df):
        signature = self.get_rhythm_signature(df)
        if signature is None:
            print("无法提取节奏特征，注册失败")
            return False

        self.user_templates[username] = signature
        print(f"✓ 用户 '{username}' 注册成功！")
        return True

    def compute_signature_similarity(self, sig1, sig2):
        if sig1 is None or sig2 is None:
            return 0.0

        weighted_distance = 0.0
        total_weight = 0.0

        for feature, weight in self.signature_weights.items():
            if feature in sig1 and feature in sig2:
                v1 = sig1[feature]
                v2 = sig2[feature]

                if abs(v2) > 1e-10:
                    normalized_diff = abs(v1 - v2) / abs(v2)
                else:
                    normalized_diff = abs(v1 - v2)

                weighted_distance += weight * normalized_diff
                total_weight += weight

        if total_weight > 0:
            weighted_distance /= total_weight

        similarity = max(0.0, 1.0 - weighted_distance)
        return similarity

    def identify_user(self, df, threshold=0.7):
        current_sig = self.get_rhythm_signature(df)
        if current_sig is None:
            return None, 0.0

        if not self.user_templates:
            print("没有已注册的用户模板")
            return None, 0.0

        best_match = None
        best_similarity = 0.0

        print("\n" + "=" * 50)
        print("         身份匹配结果")
        print("=" * 50)

        for username, template_sig in self.user_templates.items():
            similarity = self.compute_signature_similarity(current_sig, template_sig)
            print(f"  与 '{username}' 相似度: {similarity:.2%}")

            if similarity > best_similarity:
                best_similarity = similarity
                best_match = username

        print("-" * 50)
        if best_similarity >= threshold:
            print(f"✓ 匹配成功: 用户 '{best_match}'")
            print(f"  相似度: {best_similarity:.2%} (阈值: {threshold:.0%})")
        else:
            print(f"✗ 未找到匹配用户")
            print(f"  最高相似度: {best_similarity:.2%} (阈值: {threshold:.0%})")
        print("=" * 50 + "\n")

        return best_match, best_similarity

    def list_users(self):
        if not self.user_templates:
            print("没有已注册的用户")
            return []

        print("\n已注册用户列表:")
        for i, username in enumerate(self.user_templates.keys(), 1):
            print(f"  {i}. {username}")
        print()
        return list(self.user_templates.keys())

    def save_data(self, df, filename='keystroke_data.csv'):
        if df.empty:
            print("没有数据可保存")
            return
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"数据已保存到 {filename}")


def print_analysis(analysis):
    if not analysis:
        return
    print("\n" + "=" * 50)
    print("         节奏分析结果")
    print("=" * 50)
    print(f"总击键次数:        {analysis['total_keystrokes']} 次")
    print(f"记录总时长:        {analysis['total_duration']:.2f} 秒")
    print(f"平均击键速度:      {analysis['keys_per_second']:.2f} 键/秒")
    print()
    print(f"平均按键时间:      {analysis['avg_dwell_time']:.4f} 秒")
    print(f"按键时间标准差:    {analysis['std_dwell_time']:.4f} 秒")
    print()
    print(f"平均间隔时间:      {analysis['avg_flight_time']:.4f} 秒")
    print(f"间隔时间标准差:    {analysis['std_flight_time']:.4f} 秒")
    print(f"间隔时间中位数:    {analysis['median_flight_time']:.4f} 秒")
    print("=" * 50 + "\n")


def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def main():
    print_header("键盘节奏识别系统 v1.0")
    print()
    print("  基于击键时序分析的用户身份识别系统")
    print("=" * 60)
    print()

    system = KeystrokeRhythmSystem()

    print("📋 环境配置:")
    print(f"  • Python: 3.10+    • Pandas: {pd.__version__}")
    print(f"  • NumPy: {np.__version__:<8} • Matplotlib: {plt.matplotlib.__version__}")
    print()

    print("🎯 核心功能:")
    print("  • 实时键盘监听采集    • 节奏特征曲线分析")
    print("  • 用户节奏指纹提取    • 身份识别匹配")
    print()

    current_df = None

    while True:
        print_header("主菜单")
        print("  [1] 🎹  采集键盘节奏数据")
        print("  [2] 📊  生成节奏特征曲线")
        print("  [3] 👆  查看节奏指纹")
        print("  [4] 👤  用户身份管理")
        print("  [5] 📈  基础数据可视化")
        print("  [6] 💾  保存数据到 CSV")
        print("  [0] 🚪  退出程序")
        print("-" * 60)
        if current_df is not None:
            print(f"  当前数据: {len(current_df)} 次击键记录")
        else:
            print("  当前数据: 无")

        choice = input("\n请选择操作 [0-6]: ").strip()

        if choice == '1':
            print_header("数据采集模式")
            duration = input("  采集时长(秒，回车手动停止): ").strip()

            system.start_recording()

            if duration and duration.isdigit():
                duration = int(duration)
                print(f"  自动采集 {duration} 秒...")
                time.sleep(duration)
                df = system.stop_recording()
            else:
                print("  正在采集... (按回车停止)")
                input()
                df = system.stop_recording()

            if not df.empty:
                current_df = df
                analysis = system.analyze_rhythm(df)
                print_analysis(analysis)

                while True:
                    sub_choice = input("\n是否生成节奏特征曲线? (y/n): ").strip().lower()
                    if sub_choice == 'y':
                        system.plot_rhythm_curve(df)
                        break
                    elif sub_choice == 'n':
                        break

                while True:
                    sub_choice = input("是否保存数据? (y/n): ").strip().lower()
                    if sub_choice == 'y':
                        filename = input("请输入文件名 (默认 keystroke_data.csv): ").strip()
                        if not filename:
                            filename = 'keystroke_data.csv'
                        system.save_data(df, filename)
                        break
                    elif sub_choice == 'n':
                        break

        elif choice == '2':
            if current_df is not None:
                print("\n📈 正在生成节奏特征曲线...")
                system.plot_rhythm_curve(current_df)
            else:
                print("⚠️  请先采集键盘节奏数据")

        elif choice == '3':
            if current_df is not None:
                signature = system.get_rhythm_signature(current_df)
                if signature:
                    print_header("用户节奏指纹")
                    print(f"  🕐 平均间隔时间:      {signature['mean_flight_time']:.4f} 秒")
                    print(f"  📊 间隔时间标准差:    {signature['std_flight_time']:.4f} 秒")
                    print(f"  📉 间隔时间变异系数:  {signature['cv_flight_time']:.4f}")
                    print()
                    print(f"  ⌨️  平均按键时间:      {signature['mean_dwell_time']:.4f} 秒")
                    print(f"  📊 按键时间标准差:    {signature['std_dwell_time']:.4f} 秒")
                    print(f"  📉 按键时间变异系数:  {signature['cv_dwell_time']:.4f}")
                    print()
                    print(f"  ⚡ 平均打字速度:      {signature['avg_keys_per_second']:.2f} 键/秒")
                    print(f"  🎯 节奏一致性评分:    {signature['rhythm_consistency']:.2%}")
                    print("=" * 60 + "\n")
            else:
                print("⚠️  请先采集键盘节奏数据")

        elif choice == '4':
            while True:
                print_header("用户身份管理")
                print("  [1] 📝  注册新用户模板")
                print("  [2] 🔍  用户身份识别")
                print("  [3] 📋  列出已注册用户")
                print("  [0] ↩️  返回主菜单")
                print("-" * 60)

                sub_choice = input("\n请选择操作 [0-3]: ").strip()

                if sub_choice == '1':
                    if current_df is not None:
                        username = input("  请输入用户名: ").strip()
                        if username:
                            system.register_user(username, current_df)
                    else:
                        print("⚠️  请先采集键盘节奏数据")

                elif sub_choice == '2':
                    if current_df is not None:
                        threshold = input("  匹配阈值(默认 0.70): ").strip()
                        threshold = float(threshold) if threshold else 0.7
                        system.identify_user(current_df, threshold)
                    else:
                        print("⚠️  请先采集键盘节奏数据")

                elif sub_choice == '3':
                    system.list_users()

                elif sub_choice == '0':
                    break

                else:
                    print("⚠️  无效选项")

                input("\n按回车继续...")

        elif choice == '5':
            if current_df is not None:
                system.visualize_rhythm(current_df)
            else:
                print("⚠️  请先采集键盘节奏数据")

        elif choice == '6':
            if current_df is not None:
                filename = input("  请输入文件名 (默认 keystroke_data.csv): ").strip()
                if not filename:
                    filename = 'keystroke_data.csv'
                system.save_data(current_df, filename)
            else:
                print("⚠️  请先采集键盘节奏数据")

        elif choice == '0':
            print("\n👋 感谢使用键盘节奏识别系统，再见！\n")
            break

        else:
            print("⚠️  无效的选项，请重新选择")

        if choice not in ['4']:
            input("\n按回车继续...")


if __name__ == "__main__":
    main()
