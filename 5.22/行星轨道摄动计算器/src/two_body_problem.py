import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


class TwoBodyProblem:
    def __init__(self, m1, m2):
        self.G = 6.67430e-11
        self.m1 = m1
        self.m2 = m2
        self.mu = self.G * (m1 + m2)
        
    def derivatives(self, state):
        r1 = state[:3]
        v1 = state[3:6]
        r2 = state[6:9]
        v2 = state[9:12]
        
        r_vec = r2 - r1
        r = np.linalg.norm(r_vec)
        
        if r < 1e-10:
            raise ValueError("两个物体距离过近，可能发生碰撞!")
        
        a1 = self.G * self.m2 * r_vec / (r**3)
        a2 = -self.G * self.m1 * r_vec / (r**3)
        
        return np.concatenate([v1, a1, v2, a2])
    
    def rk4_step(self, state, dt):
        k1 = self.derivatives(state)
        k2 = self.derivatives(state + 0.5 * dt * k1)
        k3 = self.derivatives(state + 0.5 * dt * k2)
        k4 = self.derivatives(state + dt * k3)
        
        return state + (dt / 6.0) * (k1 + 2*k2 + 2*k3 + k4)
    
    def rk8_step(self, state, dt):
        c = np.array([0, 4/27, 2/9, 1/3, 1/2, 2/3, 1/6, 1, 5/6, 1/12, 1, 0, 1])
        
        a = np.zeros((13, 13))
        a[1, 0] = 4/27
        a[2, 0:2] = [1/18, 1/6]
        a[3, 0:3] = [1/12, 0, 1/4]
        a[4, 0:4] = [1/8, 0, 0, 3/8]
        a[5, 0:5] = [13/54, 0, 0, -27/54, 42/54]
        a[6, 0:6] = [386/810, 0, 0, -1350/810, 2970/810, -1155/810]
        a[7, 0:7] = [241/60, 0, 0, -594/60, 1375/60, -1280/60, 512/60] / 7.5
        a[8, 0:8] = [-1777/4920, 0, 0, -355/33, 147455/984, -12992/41, 84480/492, -107520/492] / 12.5
        a[9, 0:9] = [889/2160, 0, 0, -125/27, 13925/504, -12992/525, 84480/525, -107520/525, 0] / 20.0
        a[10, 0:10] = [-251/720, 0, 0, 1, -6375/448, 13952/525, -13952/525, 10240/525, 0, 0] / 12.5
        a[11, 0:11] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        a[12, 0:12] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        
        b = np.array([985/11136, 0, 0, 0, 12875/22272, 68025/222720, -68025/222720, 
                      107520/222720, 0, 0, 0, 0, 0])
        
        k = np.zeros((13, len(state)))
        k[0] = self.derivatives(state)
        
        for i in range(1, 13):
            ki_state = state + dt * np.dot(a[i, :i], k[:i])
            k[i] = self.derivatives(ki_state)
        
        return state + dt * np.dot(b, k)
    
    def integrate(self, initial_state, t_span, dt=None, method='rk4', steps_per_orbit=2000):
        t0, tf = t_span
        
        if dt is None:
            r_initial = np.linalg.norm(initial_state[6:9] - initial_state[:3])
            v_initial = np.linalg.norm(initial_state[9:12] - initial_state[3:6])
            a_estimate = 1 / (2 / r_initial - v_initial**2 / self.mu)
            period_estimate = 2 * np.pi * np.sqrt(abs(a_estimate)**3 / self.mu)
            dt = period_estimate / steps_per_orbit
        
        num_steps = max(int(np.ceil((tf - t0) / dt)) + 1, 2)
        times = np.linspace(t0, tf, num_steps)
        
        states = np.zeros((num_steps, 12))
        states[0] = initial_state
        
        if method == 'rk4':
            step_func = self.rk4_step
        elif method == 'rk8':
            step_func = self.rk8_step
        else:
            raise ValueError(f"未知的积分方法: {method}")
        
        current_state = initial_state
        current_time = t0
        
        for i in range(1, num_steps):
            dt_step = times[i] - current_time
            
            sub_steps = 1
            while True:
                dt_sub = dt_step / sub_steps
                temp_state = current_state
                for _ in range(sub_steps):
                    temp_state = step_func(temp_state, dt_sub)
                
                if sub_steps >= 16:
                    break
                
                state_half = current_state
                dt_half = dt_step / (2 * sub_steps)
                for _ in range(2 * sub_steps):
                    state_half = step_func(state_half, dt_half)
                
                error = np.max(np.abs(temp_state - state_half))
                if error < 1e-6:
                    break
                sub_steps *= 2
            
            dt_sub = dt_step / sub_steps
            for _ in range(sub_steps):
                current_state = step_func(current_state, dt_sub)
            
            states[i] = current_state
            current_time = times[i]
            
        return times, states
    
    def get_relative_orbit(self, states):
        return states[:, 6:9] - states[:, :3]
    
    def get_center_of_mass(self, states):
        return (self.m1 * states[:, :3] + self.m2 * states[:, 6:9]) / (self.m1 + self.m2)
    
    def orbital_energy(self, state):
        r1 = state[:3]
        v1 = state[3:6]
        r2 = state[6:9]
        v2 = state[9:12]
        
        r = np.linalg.norm(r2 - r1)
        
        ke1 = 0.5 * self.m1 * np.dot(v1, v1)
        ke2 = 0.5 * self.m2 * np.dot(v2, v2)
        pe = -self.G * self.m1 * self.m2 / r
        
        return ke1 + ke2 + pe
    
    def angular_momentum(self, state):
        r1 = state[:3]
        v1 = state[3:6]
        r2 = state[6:9]
        v2 = state[9:12]
        
        r_cm = self.get_center_of_mass(state.reshape(1, 12))[0]
        v_cm = (self.m1 * v1 + self.m2 * v2) / (self.m1 + self.m2)
        
        r1_rel = r1 - r_cm
        r2_rel = r2 - r_cm
        v1_rel = v1 - v_cm
        v2_rel = v2 - v_cm
        
        L1 = self.m1 * np.cross(r1_rel, v1_rel)
        L2 = self.m2 * np.cross(r2_rel, v2_rel)
        
        return L1 + L2
    
    def get_orbital_elements(self, relative_state):
        r = relative_state[:3]
        v = relative_state[3:6]
        
        r_mag = np.linalg.norm(r)
        v_mag = np.linalg.norm(v)
        
        h = np.cross(r, v)
        h_mag = np.linalg.norm(h)
        
        n = np.cross([0, 0, 1], h)
        n_mag = np.linalg.norm(n)
        
        e_vec = ((v_mag**2 - self.mu / r_mag) * r - np.dot(r, v) * v) / self.mu
        e_mag = np.linalg.norm(e_vec)
        
        a = 1 / (2 / r_mag - v_mag**2 / self.mu)
        
        i = np.arccos(h[2] / h_mag)
        
        if n_mag > 1e-15:
            Omega = np.arccos(n[0] / n_mag)
            if n[1] < 0:
                Omega = 2 * np.pi - Omega
        else:
            Omega = 0
            
        if n_mag > 1e-15 and e_mag > 1e-15:
            omega = np.arccos(np.dot(n, e_vec) / (n_mag * e_mag))
            if e_vec[2] < 0:
                omega = 2 * np.pi - omega
        else:
            omega = 0
            
        if e_mag > 1e-15:
            nu = np.arccos(np.dot(e_vec, r) / (e_mag * r_mag))
            if np.dot(r, v) < 0:
                nu = 2 * np.pi - nu
        else:
            nu = 0
            
        return {
            'semi_major_axis': a,
            'eccentricity': e_mag,
            'inclination': np.degrees(i),
            'longitude_of_ascending_node': np.degrees(Omega),
            'argument_of_periapsis': np.degrees(omega),
            'true_anomaly': np.degrees(nu),
            'specific_angular_momentum': h_mag,
            'specific_orbital_energy': -self.mu / (2 * a) if a > 0 else np.inf
        }
    
    def plot_orbit_2d(self, times, states, figsize=(12, 10)):
        relative_orbit = self.get_relative_orbit(states)
        
        fig, axes = plt.subplots(2, 2, figsize=figsize)
        
        ax = axes[0, 0]
        ax.plot(relative_orbit[:, 0], relative_orbit[:, 1], 'b-', linewidth=1, label='轨道')
        ax.plot(0, 0, 'yo', markersize=10, label='主天体')
        ax.plot(relative_orbit[0, 0], relative_orbit[0, 1], 'ro', markersize=8, label='初始位置')
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_title('轨道投影 (XY平面)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.set_aspect('equal')
        
        ax = axes[0, 1]
        ax.plot(relative_orbit[:, 0], relative_orbit[:, 2], 'b-', linewidth=1)
        ax.plot(0, 0, 'yo', markersize=10)
        ax.plot(relative_orbit[0, 0], relative_orbit[0, 2], 'ro', markersize=8)
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Z (m)')
        ax.set_title('轨道投影 (XZ平面)')
        ax.grid(True, alpha=0.3)
        ax.set_aspect('equal')
        
        ax = axes[1, 0]
        ax.plot(relative_orbit[:, 1], relative_orbit[:, 2], 'b-', linewidth=1)
        ax.plot(0, 0, 'yo', markersize=10)
        ax.plot(relative_orbit[0, 1], relative_orbit[0, 2], 'ro', markersize=8)
        ax.set_xlabel('Y (m)')
        ax.set_ylabel('Z (m)')
        ax.set_title('轨道投影 (YZ平面)')
        ax.grid(True, alpha=0.3)
        ax.set_aspect('equal')
        
        energies = [self.orbital_energy(s) for s in states]
        ax = axes[1, 1]
        ax.plot(times, energies, 'g-', linewidth=1)
        ax.set_xlabel('时间 (s)')
        ax.set_ylabel('总能量 (J)')
        ax.set_title('能量守恒验证')
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig, axes
    
    def plot_orbit_3d(self, times, states, figsize=(12, 10)):
        relative_orbit = self.get_relative_orbit(states)
        
        fig = plt.figure(figsize=figsize)
        ax = fig.add_subplot(111, projection='3d')
        
        ax.plot(relative_orbit[:, 0], relative_orbit[:, 1], relative_orbit[:, 2], 
                'b-', linewidth=1.5, label='轨道')
        ax.scatter([0], [0], [0], color='yellow', s=200, label='主天体', depthshade=True)
        ax.scatter([relative_orbit[0, 0]], [relative_orbit[0, 1]], [relative_orbit[0, 2]], 
                   color='red', s=100, label='初始位置', depthshade=True)
        
        max_range = np.max(np.abs(relative_orbit))
        ax.set_xlim(-max_range, max_range)
        ax.set_ylim(-max_range, max_range)
        ax.set_zlim(-max_range, max_range)
        
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_zlabel('Z (m)')
        ax.set_title('两体问题 3D 轨道')
        ax.legend()
        
        return fig, ax
