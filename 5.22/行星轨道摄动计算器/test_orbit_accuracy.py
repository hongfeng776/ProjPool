import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import matplotlib.pyplot as plt
from src import TwoBodyProblem


def test_orbit_accuracy():
    print("=" * 60)
    print("轨道精度测试")
    print("=" * 60)
    
    sun_mass = 1.989e30
    earth_mass = 5.972e24
    two_body = TwoBodyProblem(sun_mass, earth_mass)
    
    semi_major = 1.496e11
    eccentricity = 0.5
    
    print(f"\n理论轨道参数:")
    print(f"  半长轴 a = {semi_major:.3e} m")
    print(f"  偏心率 e = {eccentricity}")
    print(f"  半短轴 b = {semi_major * np.sqrt(1 - eccentricity**2):.3e} m")
    print(f"  近心点 r_p = {semi_major * (1 - eccentricity):.3e} m")
    print(f"  远心点 r_a = {semi_major * (1 + eccentricity):.3e} m")
    print(f"  焦距 c = {semi_major * eccentricity:.3e} m")
    
    perihelion = semi_major * (1 - eccentricity)
    v_perihelion = np.sqrt(two_body.mu * (2 / perihelion - 1 / semi_major))
    
    initial_state = np.array([
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        perihelion, 0.0, 0.0, 0.0, v_perihelion, 0.0
    ])
    
    period = 2 * np.pi * np.sqrt(semi_major**3 / two_body.mu)
    
    dt_list = [period / 100, period / 500, period / 2000]
    
    results = []
    
    for dt in dt_list:
        print(f"\n" + "-" * 60)
        print(f"测试时间步长: dt = {dt / 3600:.2f} 小时 (每轨道 {period/dt:.0f} 步)")
        
        t_span = (0, period)
        times, states = two_body.integrate(initial_state, t_span, dt)
        relative_orbit = two_body.get_relative_orbit(states)
        
        distances = np.linalg.norm(relative_orbit, axis=1)
        r_min = np.min(distances)
        r_max = np.max(distances)
        
        a_calc = (r_min + r_max) / 2
        e_calc = (r_max - r_min) / (r_max + r_min)
        b_calc = a_calc * np.sqrt(1 - e_calc**2)
        
        focus_x = -(r_max - a_calc)
        focus_offset = np.abs(focus_x - 0) / a_calc * 100
        
        initial_energy = two_body.orbital_energy(states[0])
        final_energy = two_body.orbital_energy(states[-1])
        energy_error = abs((final_energy - initial_energy) / initial_energy) * 100
        
        pos_error = np.linalg.norm(relative_orbit[-1] - relative_orbit[0]) / a_calc * 100
        
        print(f"\n  计算得到的轨道参数:")
        print(f"    近心点 r_p = {r_min:.3e} m (误差: {abs(r_min - perihelion) / perihelion * 100:.6e} %)")
        print(f"    远心点 r_a = {r_max:.3e} m (误差: {abs(r_max - semi_major * (1 + eccentricity)) / (semi_major * (1 + eccentricity)) * 100:.6e} %)")
        print(f"    半长轴 a = {a_calc:.3e} m (误差: {abs(a_calc - semi_major) / semi_major * 100:.6e} %)")
        print(f"    偏心率 e = {e_calc:.8f} (误差: {abs(e_calc - eccentricity) / eccentricity * 100:.6e} %)")
        print(f"    半短轴 b = {b_calc:.3e} m")
        print(f"    焦点位置偏移: {focus_offset:.6e} %")
        
        print(f"\n  数值积分精度:")
        print(f"    能量守恒误差: {energy_error:.6e} %")
        print(f"    轨道闭合误差: {pos_error:.6e} %")
        
        results.append({
            'dt': dt,
            'times': times,
            'orbit': relative_orbit,
            'a_calc': a_calc,
            'e_calc': e_calc,
            'energy_error': energy_error,
            'pos_error': pos_error
        })
    
    print("\n" + "=" * 60)
    print("轨道几何验证 - 椭圆方程检查")
    print("=" * 60)
    
    best_result = results[-1]
    orbit = best_result['orbit']
    a = best_result['a_calc']
    e = best_result['e_calc']
    c = a * e
    
    x = orbit[:, 0]
    y = orbit[:, 1]
    
    x_centered = x + c
    b = a * np.sqrt(1 - e**2)
    
    ellipse_eq = (x_centered**2 / a**2) + (y**2 / b**2)
    eq_error = np.abs(ellipse_eq - 1) * 100
    
    print(f"\n  椭圆方程 (x-c)²/a² + y²/b² = 1 验证:")
    print(f"    平均误差: {np.mean(eq_error):.6e} %")
    print(f"    最大误差: {np.max(eq_error):.6e} %")
    print(f"    均方根误差: {np.sqrt(np.mean(eq_error**2)):.6e} %")
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    
    ax = axes[0, 0]
    colors = ['r', 'g', 'b']
    labels = [f'dt = {r["dt"] / 3600:.1f}h' for r in results]
    
    for i, (result, color, label) in enumerate(zip(results, colors, labels)):
        orbit = result['orbit']
        ax.plot(orbit[:, 0], orbit[:, 1], color=color, linewidth=1.5, 
                label=label, alpha=0.7)
    
    ax.plot(0, 0, 'yo', markersize=10, label='焦点 (太阳)')
    ax.set_xlabel('X (m)')
    ax.set_ylabel('Y (m)')
    ax.set_title('不同时间步长的轨道对比')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')
    
    ax = axes[0, 1]
    orbit = results[-1]['orbit']
    a = results[-1]['a_calc']
    e = results[-1]['e_calc']
    c = a * e
    b = a * np.sqrt(1 - e**2)
    
    theta = np.linspace(0, 2 * np.pi, 1000)
    x_ellipse = a * np.cos(theta) - c
    y_ellipse = b * np.sin(theta)
    
    ax.plot(orbit[:, 0], orbit[:, 1], 'b-', linewidth=2, label='计算轨道')
    ax.plot(x_ellipse, y_ellipse, 'r--', linewidth=1.5, label='理论椭圆')
    ax.plot(0, 0, 'yo', markersize=10, label='焦点')
    ax.plot(-c, 0, 'go', markersize=8, label='椭圆中心')
    
    ax.set_xlabel('X (m)')
    ax.set_ylabel('Y (m)')
    ax.set_title('计算轨道 vs 理论椭圆')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')
    
    ax = axes[1, 0]
    dts = [r['dt'] for r in results]
    energy_errors = [r['energy_error'] for r in results]
    pos_errors = [r['pos_error'] for r in results]
    
    ax.plot(dts, energy_errors, 'bo-', label='能量误差')
    ax.plot(dts, pos_errors, 'ro-', label='轨道闭合误差')
    ax.set_xlabel('时间步长 dt (s)')
    ax.set_ylabel('误差 (%)')
    ax.set_title('时间步长 vs 积分误差')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_xscale('log')
    ax.set_yscale('log')
    
    ax = axes[1, 1]
    ax.plot(best_result['times'], eq_error, 'b-', linewidth=1)
    ax.set_xlabel('时间 (s)')
    ax.set_ylabel('椭圆方程误差 (%)')
    ax.set_title('椭圆方程误差随时间变化')
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('orbit_accuracy_test.png', dpi=150, bbox_inches='tight')
    print("\n精度测试图已保存为 orbit_accuracy_test.png")
    
    plt.show()
    
    return results


if __name__ == '__main__':
    test_orbit_accuracy()
