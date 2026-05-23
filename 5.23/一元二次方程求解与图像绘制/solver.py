import numpy as np
import matplotlib.pyplot as plt
import cmath

plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False


class QuadraticEquation:
    def __init__(self, a, b, c):
        self.a = a
        self.b = b
        self.c = c

    def discriminant(self):
        return self.b ** 2 - 4 * self.a * self.c

    def solve(self):
        if self.a == 0:
            if self.b == 0:
                if self.c == 0:
                    return {'type': 'infinite', 'roots': []}
                else:
                    return {'type': 'none', 'roots': []}
            else:
                x = -self.c / self.b
                return {'type': 'linear', 'roots': [x]}

        d = self.discriminant()

        if d > 0:
            x1 = (-self.b + np.sqrt(d)) / (2 * self.a)
            x2 = (-self.b - np.sqrt(d)) / (2 * self.a)
            return {'type': 'real_distinct', 'roots': [x1, x2]}
        elif d == 0:
            x = -self.b / (2 * self.a)
            return {'type': 'real_equal', 'roots': [x]}
        else:
            x1 = (-self.b + cmath.sqrt(d)) / (2 * self.a)
            x2 = (-self.b - cmath.sqrt(d)) / (2 * self.a)
            return {'type': 'complex', 'roots': [x1, x2]}

    def get_real_roots(self):
        solution = self.solve()
        if solution['type'] in ['real_distinct', 'real_equal', 'linear']:
            return solution['roots']
        return []

    def vertex(self):
        if self.a == 0:
            return None
        x = -self.b / (2 * self.a)
        y = self.a * x ** 2 + self.b * x + self.c
        return (x, y)

    def plot(self, x_range=None, num_points=400):
        if self.a == 0 and self.b == 0:
            return None

        if x_range is None:
            vertex = self.vertex()
            if vertex:
                center_x = vertex[0]
                x_min = center_x - 10
                x_max = center_x + 10
            else:
                real_roots = self.get_real_roots()
                if real_roots:
                    center_x = sum(real_roots) / len(real_roots)
                    x_min = center_x - 10
                    x_max = center_x + 10
                else:
                    x_min, x_max = -10, 10
            x_range = (x_min, x_max)

        x = np.linspace(x_range[0], x_range[1], num_points)
        y = self.a * x ** 2 + self.b * x + self.c

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8),
                                       gridspec_kw={'height_ratios': [3, 1]})

        ax_main = ax1
        ax_main.plot(x, y, label=f'y = {self.a}x² + {self.b}x + {self.c}',
                     linewidth=2, color='blue')

        ax_main.axhline(y=0, color='black', linestyle='-', linewidth=0.5)
        ax_main.axvline(x=0, color='black', linestyle='-', linewidth=0.5)

        solution = self.solve()
        legend_items = [f'y = {self.a}x² + {self.b}x + {self.c}']

        if solution['type'] in ['real_distinct', 'real_equal', 'linear']:
            for i, root in enumerate(solution['roots'], 1):
                ax_main.plot(root, 0, 'ro', markersize=10, zorder=5)
                ax_main.annotate(f'x{i} = {root:.4f}',
                                 xy=(root, 0),
                                 xytext=(10, 20),
                                 textcoords='offset points',
                                 bbox=dict(boxstyle='round,pad=0.5',
                                           fc='red', alpha=0.3),
                                 fontsize=10,
                                 zorder=6)
                legend_items.append(f'实根 x{i} = {root:.4f}')

        vertex = self.vertex()
        if vertex:
            ax_main.plot(vertex[0], vertex[1], 'go', markersize=10, zorder=5)
            ax_main.annotate(f'顶点\n({vertex[0]:.2f}, {vertex[1]:.2f})',
                             xy=(vertex[0], vertex[1]),
                             xytext=(10, -30),
                             textcoords='offset points',
                             bbox=dict(boxstyle='round,pad=0.5',
                                       fc='green', alpha=0.3),
                             fontsize=10,
                             zorder=6)
            legend_items.append(f'顶点 ({vertex[0]:.2f}, {vertex[1]:.2f})')

        ax_main.set_xlabel('x', fontsize=12)
        ax_main.set_ylabel('y', fontsize=12)
        ax_main.set_title(f'方程 {self} 的函数图像', fontsize=14, fontweight='bold')
        ax_main.legend(legend_items, loc='best', fontsize=10)
        ax_main.grid(True, linestyle='--', alpha=0.7)

        ax_info = ax2
        ax_info.axis('off')

        info_text = self._get_solution_info_text()
        ax_info.text(0.02, 0.95, info_text,
                     transform=ax_info.transAxes,
                     fontsize=11,
                     verticalalignment='top',
                     bbox=dict(boxstyle='round,pad=0.8',
                               fc='lightblue', alpha=0.3),
                     family='monospace')

        plt.tight_layout()
        return fig

    def _get_solution_info_text(self):
        solution = self.solve()
        lines = []
        lines.append(f'方程: {self}')
        lines.append('=' * 50)

        if solution['type'] == 'infinite':
            lines.append('结果: 方程有无穷多解')
        elif solution['type'] == 'none':
            lines.append('结果: 方程无解')
        elif solution['type'] == 'linear':
            lines.append('类型: 一元一次方程')
            lines.append(f'解: x = {solution["roots"][0]:.6f}')
        else:
            d = self.discriminant()
            lines.append(f'判别式 Δ = {d:.6f}')

            if solution['type'] == 'real_distinct':
                lines.append('结果: 有两个不相等的实根')
                lines.append(f'  x₁ = {solution["roots"][0]:.6f}')
                lines.append(f'  x₂ = {solution["roots"][1]:.6f}')
            elif solution['type'] == 'real_equal':
                lines.append('结果: 有两个相等的实根')
                lines.append(f'  x₁ = x₂ = {solution["roots"][0]:.6f}')
            elif solution['type'] == 'complex':
                lines.append('结果: 无实根，有两个共轭复根')
                lines.append(f'  x₁ = {solution["roots"][0]}')
                lines.append(f'  x₂ = {solution["roots"][1]}')

        vertex = self.vertex()
        if vertex:
            lines.append('-' * 50)
            lines.append(f'顶点坐标: ({vertex[0]:.6f}, {vertex[1]:.6f})')
            if self.a > 0:
                lines.append(f'开口向上，最小值: {vertex[1]:.6f}')
            elif self.a < 0:
                lines.append(f'开口向下，最大值: {vertex[1]:.6f}')

        return '\n'.join(lines)

    def __str__(self):
        equation_str = f"{self.a}x² + {self.b}x + {self.c} = 0"
        return equation_str
