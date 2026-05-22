import numpy as np
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider, Button, RadioButtons
import os
from datetime import datetime

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

class InteractiveInterference:
    def __init__(self, width=800, height=500, resolution=2.0):
        self.width = width
        self.height = height
        self.resolution = resolution
        
        self.x = np.linspace(0, width, int(width / resolution))
        self.y = np.linspace(0, height, int(height / resolution))
        self.X, self.Y = np.meshgrid(self.x, self.y)
        
        self.wavelength = 40.0
        self.k = 2 * np.pi / self.wavelength
        self.phase1 = 0.0
        self.phase2 = 0.0
        self.source_distance = 200.0
        
        self.center_x = width / 2
        self.center_y = height / 2
        
        self.presets = {
            '稀疏条纹': {'wavelength': 80, 'phase1': 0, 'phase2': 0, 'distance': 100},
            '密集条纹': {'wavelength': 30, 'phase1': 0, 'phase2': 0, 'distance': 300},
            'π相位差': {'wavelength': 50, 'phase1': 0, 'phase2': np.pi, 'distance': 200},
            'π/2相位差': {'wavelength': 50, 'phase1': 0, 'phase2': np.pi/2, 'distance': 200},
            '近距离': {'wavelength': 50, 'phase1': 0, 'phase2': 0, 'distance': 80},
            '远距离': {'wavelength': 50, 'phase1': 0, 'phase2': 0, 'distance': 350}
        }
        
    def update_parameters(self, wavelength, phase1, phase2, source_distance):
        self.wavelength = wavelength
        self.k = 2 * np.pi / wavelength
        self.phase1 = phase1
        self.phase2 = phase2
        self.source_distance = source_distance
        
    def calculate_wave(self):
        x1 = self.center_x - self.source_distance / 2
        y1 = self.center_y
        x2 = self.center_x + self.source_distance / 2
        y2 = self.center_y
        
        d1 = np.sqrt((self.X - x1)**2 + (self.Y - y1)**2)
        d2 = np.sqrt((self.X - x2)**2 + (self.Y - y2)**2)
        
        wave1 = np.sin(self.k * d1 + self.phase1)
        wave2 = np.sin(self.k * d2 + self.phase2)
        
        wave1 /= (d1 + 1e-6) * 0.015
        wave2 /= (d2 + 1e-6) * 0.015
        
        total_wave = wave1 + wave2
        return total_wave, x1, y1, x2, y2
    
    def calculate_intensity(self):
        x1 = self.center_x - self.source_distance / 2
        y1 = self.center_y
        x2 = self.center_x + self.source_distance / 2
        y2 = self.center_y
        
        d1 = np.sqrt((self.X - x1)**2 + (self.Y - y1)**2)
        d2 = np.sqrt((self.X - x2)**2 + (self.Y - y2)**2)
        
        phase_diff = self.k * (d2 - d1) + (self.phase2 - self.phase1)
        intensity = 2 + 2 * np.cos(phase_diff)
        
        attenuation = 1 / ((d1 + 1e-6) * (d2 + 1e-6) * 1e-4)
        intensity *= attenuation
        
        return intensity, x1, y1, x2, y2
    
    def save_pattern(self, fig):
        if not os.path.exists('output'):
            os.makedirs('output')
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'output/interference_{timestamp}.png'
        
        fig.savefig(filename, dpi=150, bbox_inches='tight')
        print(f"图案已保存至: {filename}")
        
    def generate_test_patterns(self):
        print("\n" + "=" * 60)
        print("正在生成测试图案...")
        print("=" * 60)
        
        if not os.path.exists('output'):
            os.makedirs('output')
        
        for name, params in self.presets.items():
            self.update_parameters(params['wavelength'], params['phase1'], 
                                   params['phase2'], params['distance'])
            
            wave, x1, y1, x2, y2 = self.calculate_wave()
            intensity, _, _, _, _ = self.calculate_intensity()
            
            fig, axes = plt.subplots(1, 2, figsize=(14, 6))
            
            axes[0].imshow(wave, cmap='RdBu_r', vmin=-3, vmax=3,
                          extent=[0, self.width, 0, self.height], origin='lower')
            axes[0].plot(x1, y1, 'ro', markersize=10, label='S1')
            axes[0].plot(x2, y2, 'bo', markersize=10, label='S2')
            axes[0].set_title(f'{name} - 瞬时波形', fontsize=12, fontweight='bold')
            axes[0].axis('equal')
            axes[0].legend()
            
            vmax = np.percentile(intensity, 95)
            axes[1].imshow(intensity, cmap='hot', vmin=0, vmax=vmax,
                          extent=[0, self.width, 0, self.height], origin='lower')
            axes[1].plot(x1, y1, 'wo', markersize=10, label='S1')
            axes[1].plot(x2, y2, 'wo', markersize=10, label='S2')
            axes[1].set_title(f'{name} - 干涉强度', fontsize=12, fontweight='bold')
            axes[1].axis('equal')
            axes[1].legend()
            
            fig.suptitle(f'预设参数: {name} (λ={params["wavelength"]}, d={params["distance"]}, '
                        f'Δφ={params["phase2"]-params["phase1"]:.2f}rad)',
                        fontsize=14, fontweight='bold')
            
            filename = f'output/test_{name}.png'
            fig.savefig(filename, dpi=120, bbox_inches='tight')
            plt.close(fig)
            print(f"✓ 已生成: {filename}")
        
        print("=" * 60)
        print("所有测试图案生成完成！")
        print("=" * 60 + "\n")
    
    def create_interactive_plot(self):
        fig = plt.figure(figsize=(16, 11))
        gs = fig.add_gridspec(4, 3, height_ratios=[3, 3, 0.8, 1], 
                              width_ratios=[2, 2, 1], hspace=0.25, wspace=0.15)
        
        ax_wave = fig.add_subplot(gs[0:2, 0])
        ax_intensity = fig.add_subplot(gs[0:2, 1])
        ax_preset = fig.add_subplot(gs[0:2, 2])
        ax_info = fig.add_subplot(gs[2, :])
        
        wave, x1, y1, x2, y2 = self.calculate_wave()
        intensity, _, _, _, _ = self.calculate_intensity()
        
        im_wave = ax_wave.imshow(wave, cmap='RdBu_r', vmin=-3, vmax=3,
                                 extent=[0, self.width, 0, self.height], origin='lower')
        source1_wave, = ax_wave.plot(x1, y1, 'ro', markersize=12, label='S1')
        source2_wave, = ax_wave.plot(x2, y2, 'bo', markersize=12, label='S2')
        ax_wave.set_title('瞬时波形分布', fontsize=13, fontweight='bold')
        ax_wave.axis('equal')
        ax_wave.legend(loc='upper right')
        plt.colorbar(im_wave, ax=ax_wave, label='振幅', shrink=0.8)
        
        vmax_int = np.percentile(intensity, 95)
        im_intensity = ax_intensity.imshow(intensity, cmap='hot', vmin=0, vmax=vmax_int,
                                           extent=[0, self.width, 0, self.height], origin='lower')
        source1_int, = ax_intensity.plot(x1, y1, 'wo', markersize=12, label='S1')
        source2_int, = ax_intensity.plot(x2, y2, 'wo', markersize=12, label='S2')
        ax_intensity.set_title('干涉强度分布', fontsize=13, fontweight='bold')
        ax_intensity.axis('equal')
        ax_intensity.legend(loc='upper right')
        plt.colorbar(im_intensity, ax=ax_intensity, label='相对强度', shrink=0.8)
        
        ax_preset.set_title('快速预设', fontsize=13, fontweight='bold')
        ax_preset.axis('off')
        radio = RadioButtons(ax_preset, list(self.presets.keys()), active=0)
        
        ax_info.axis('off')
        info_text = ax_info.text(0.5, 0.5, '', ha='center', va='center', fontsize=11,
                                 bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        
        slider_y_pos = 0.12
        slider_height = 0.03
        ax_wavelength = plt.axes([0.12, slider_y_pos, 0.5, slider_height])
        ax_phase1 = plt.axes([0.12, slider_y_pos - 0.04, 0.5, slider_height])
        ax_phase2 = plt.axes([0.12, slider_y_pos - 0.08, 0.5, slider_height])
        ax_distance = plt.axes([0.12, slider_y_pos - 0.12, 0.5, slider_height])
        
        s_wavelength = Slider(ax_wavelength, '波长 λ', 20, 100, valinit=40, valfmt='%.0f 像素')
        s_phase1 = Slider(ax_phase1, 'S1 相位', 0, 2*np.pi, valinit=0, valfmt='%.2f rad')
        s_phase2 = Slider(ax_phase2, 'S2 相位', 0, 2*np.pi, valinit=0, valfmt='%.2f rad')
        s_distance = Slider(ax_distance, '波源间距', 50, 400, valinit=200, valfmt='%.0f 像素')
        
        def update(val=None):
            wavelength = s_wavelength.val
            phase1 = s_phase1.val
            phase2 = s_phase2.val
            distance = s_distance.val
            
            self.update_parameters(wavelength, phase1, phase2, distance)
            
            wave, x1_new, y1_new, x2_new, y2_new = self.calculate_wave()
            intensity, _, _, _, _ = self.calculate_intensity()
            
            im_wave.set_data(wave)
            im_intensity.set_data(intensity)
            im_intensity.set_clim(vmin=0, vmax=np.percentile(intensity, 95))
            
            source1_wave.set_data([x1_new], [y1_new])
            source2_wave.set_data([x2_new], [y2_new])
            source1_int.set_data([x1_new], [y1_new])
            source2_int.set_data([x2_new], [y2_new])
            
            phase_diff = phase2 - phase1
            info_str = (f'波长 λ = {wavelength:.1f} 像素 | '
                       f'波源间距 d = {distance:.1f} 像素 | '
                       f'd/λ = {distance/wavelength:.2f}\n'
                       f'S1 相位 = {phase1:.2f} rad | '
                       f'S2 相位 = {phase2:.2f} rad | '
                       f'相位差 Δφ = {phase_diff:.2f} rad')
            info_text.set_text(info_str)
            
            fig.canvas.draw_idle()
        
        def apply_preset(label):
            params = self.presets[label]
            s_wavelength.set_val(params['wavelength'])
            s_phase1.set_val(params['phase1'])
            s_phase2.set_val(params['phase2'])
            s_distance.set_val(params['distance'])
        
        s_wavelength.on_changed(update)
        s_phase1.on_changed(update)
        s_phase2.on_changed(update)
        s_distance.on_changed(update)
        radio.on_clicked(apply_preset)
        
        ax_save = plt.axes([0.72, 0.08, 0.1, 0.05])
        ax_gen_test = plt.axes([0.84, 0.08, 0.12, 0.05])
        ax_reset = plt.axes([0.72, 0.02, 0.1, 0.05])
        ax_quit = plt.axes([0.84, 0.02, 0.12, 0.05])
        
        button_save = Button(ax_save, '保存图案', color='lightgreen', hovercolor='limegreen')
        button_gen_test = Button(ax_gen_test, '生成测试图案', color='lightblue', hovercolor='skyblue')
        button_reset = Button(ax_reset, '重置参数', color='lightgray', hovercolor='gray')
        button_quit = Button(ax_quit, '关闭窗口', color='lightcoral', hovercolor='indianred')
        
        def save_callback(event):
            self.save_pattern(fig)
        
        def gen_test_callback(event):
            plt.close(fig)
            self.generate_test_patterns()
            self.update_parameters(40, 0, 0, 200)
            self.create_interactive_plot()
        
        def reset_callback(event):
            s_wavelength.reset()
            s_phase1.reset()
            s_phase2.reset()
            s_distance.reset()
        
        def quit_callback(event):
            plt.close(fig)
        
        button_save.on_clicked(save_callback)
        button_gen_test.on_clicked(gen_test_callback)
        button_reset.on_clicked(reset_callback)
        button_quit.on_clicked(quit_callback)
        
        update(0)
        
        fig.suptitle('双声源干涉图案 - 交互式控制面板', fontsize=18, fontweight='bold', y=0.98)
        plt.show()

def main():
    print("=" * 65)
    print("双声源干涉图案生成器 - 增强版")
    print("=" * 65)
    print("功能列表：")
    print("  ✓ 实时调整参数 - 波长、相位、波源间距")
    print("  ✓ 快速预设 - 6种典型干涉图案")
    print("  ✓ 保存当前图案 - PNG高分辨率")
    print("  ✓ 生成测试图案 - 批量输出所有预设")
    print("=" * 65)
    print("操作说明：")
    print("- 拖动滑块调整参数，实时更新干涉图案")
    print("- 点击右侧「快速预设」可快速切换典型参数")
    print("- 点击「保存图案」保存当前显示的图案")
    print("- 点击「生成测试图案」批量生成6种典型图案")
    print("=" * 65)
    print("\n正在启动交互式界面...")
    
    app = InteractiveInterference(width=800, height=500, resolution=2.0)
    app.create_interactive_plot()
    
    print("\n程序已退出，感谢使用！")

if __name__ == "__main__":
    main()
