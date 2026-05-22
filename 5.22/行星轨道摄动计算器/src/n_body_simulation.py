import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


class NBodySimulation:
    def __init__(self):
        self.G = 6.67430e-11
        self.bodies = []
        self._masses = None
        self._n_bodies = 0
        
    def add_body(self, name, mass, position, velocity):
        self.bodies.append({
            'name': name,
            'mass': mass,
            'position': np.array(position, dtype=np.float64),
            'velocity': np.array(velocity, dtype=np.float64)
        })
        self._n_bodies = len(self.bodies)
        self._masses = np.array([b['mass'] for b in self.bodies], dtype=np.float64)
        
    def get_state_vector(self):
        state = np.zeros(self._n_bodies * 6, dtype=np.float64)
        for i, body in enumerate(self.bodies):
            idx = i * 6
            state[idx:idx+3] = body['position']
            state[idx+3:idx+6] = body['velocity']
        return state
    
    def set_state_vector(self, state):
        for i in range(self._n_bodies):
            idx = i * 6
            self.bodies[i]['position'] = state[idx:idx+3].copy()
            self.bodies[i]['velocity'] = state[idx+3:idx+6].copy()
    
    def compute_accelerations_vectorized(self, positions):
        n = self._n_bodies
        accelerations = np.zeros((n, 3), dtype=np.float64)
        
        for i in range(n):
            r_vec = positions - positions[i]
            r_sq = np.sum(r_vec**2, axis=1)
            r_sq[i] = np.inf
            r_cubed = r_sq * np.sqrt(r_sq)
            
            accelerations[i] = self.G * np.sum(
                self._masses[:, np.newaxis] * r_vec / r_cubed[:, np.newaxis],
                axis=0
            )
        
        return accelerations
    
    def derivatives(self, state):
        n = self._n_bodies
        positions = state.reshape(n, 6)[:, :3]
        
        accelerations = self.compute_accelerations_vectorized(positions)
        
        derivs = np.zeros_like(state)
        pos_idx = np.arange(0, n*6, 6)
        vel_idx = pos_idx + 3
        
        derivs[pos_idx[:, np.newaxis] + np.arange(3)] = state[vel_idx[:, np.newaxis] + np.arange(3)]
        derivs[vel_idx[:, np.newaxis] + np.arange(3)] = accelerations
        
        return derivs
    
    def rk4_step(self, state, dt):
        k1 = self.derivatives(state)
        k2 = self.derivatives(state + 0.5 * dt * k1)
        k3 = self.derivatives(state + 0.5 * dt * k2)
        k4 = self.derivatives(state + dt * k3)
        
        return state + (dt / 6.0) * (k1 + 2*k2 + 2*k3 + k4)
    
    def integrate(self, t_span, dt, progress_callback=None):
        t0, tf = t_span
        num_steps = int(np.ceil((tf - t0) / dt))
        times = np.linspace(t0, tf, num_steps, dtype=np.float64)
        
        n = self._n_bodies
        states = np.zeros((num_steps, n * 6), dtype=np.float64)
        states[0] = self.get_state_vector()
        
        for i in range(1, num_steps):
            states[i] = self.rk4_step(states[i-1], dt)
            if progress_callback and i % max(1, num_steps // 100) == 0:
                progress_callback(i / num_steps * 100)
        
        return times, states
    
    def get_body_trajectory(self, states, body_index):
        idx = body_index * 6
        positions = states[:, idx:idx+3]
        velocities = states[:, idx+3:idx+6]
        return positions, velocities
    
    def get_relative_trajectory(self, states, body_index, central_index=0):
        pos1, _ = self.get_body_trajectory(states, body_index)
        pos2, _ = self.get_body_trajectory(states, central_index)
        return pos1 - pos2
    
    def total_energy(self, state):
        n = self._n_bodies
        positions = state.reshape(n, 6)[:, :3]
        velocities = state.reshape(n, 6)[:, 3:6]
        
        ke = 0.5 * np.sum(self._masses * np.sum(velocities**2, axis=1))
        
        pe = 0.0
        for i in range(n):
            for j in range(i+1, n):
                r = np.linalg.norm(positions[j] - positions[i])
                pe -= self.G * self._masses[i] * self._masses[j] / r
        
        return ke + pe
    
    def compute_perturbation_acceleration(self, states, target_index, central_index=0):
        n = self._n_bodies
        n_times = len(states)
        perturbations = np.zeros((n_times, 3), dtype=np.float64)
        
        positions_all = states.reshape(n_times, n, 6)[:, :, :3]
        target_positions = positions_all[:, target_index, :]
        
        for j in range(n):
            if j != target_index and j != central_index:
                r_vec = positions_all[:, j, :] - target_positions
                r = np.linalg.norm(r_vec, axis=1, keepdims=True)
                r_safe = np.maximum(r, 1e-10)
                perturbations += self.G * self._masses[j] * r_vec / (r_safe**3)
        
        return perturbations
    
    def plot_trajectories(self, times, states, central_index=0, figsize=(14, 10)):
        fig = plt.figure(figsize=figsize)
        ax = fig.add_subplot(111, projection='3d')
        
        colors = ['gold', 'blue', 'red', 'green', 'orange', 'purple']
        
        for i, body in enumerate(self.bodies):
            if i == central_index:
                rel_pos = np.zeros((len(times), 3))
            else:
                rel_pos = self.get_relative_trajectory(states, i, central_index)
            
            color = colors[i % len(colors)]
            ax.plot(rel_pos[:, 0], rel_pos[:, 1], rel_pos[:, 2], 
                   color=color, linewidth=1.5, label=f'{body["name"]}')
            ax.scatter([rel_pos[0, 0]], [rel_pos[0, 1]], [rel_pos[0, 2]], 
                      color=color, s=50, zorder=5)
        
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_zlabel('Z (m)')
        ax.set_title('N-body System Orbits')
        ax.legend()
        
        return fig, ax
    
    def plot_perturbation_comparison(self, times, perturbed_states, unperturbed_states, 
                                     target_index, central_index=0, figsize=(16, 12)):
        fig, axes = plt.subplots(2, 2, figsize=figsize)
        
        pos_pert = self.get_relative_trajectory(perturbed_states, target_index, central_index)
        pos_unpert = self.get_relative_trajectory(unperturbed_states, target_index, central_index)
        
        diff = pos_pert - pos_unpert
        diff_mag = np.linalg.norm(diff, axis=1)
        
        ax = axes[0, 0]
        ax.plot(pos_unpert[:, 0], pos_unpert[:, 1], 'b-', linewidth=1.5, label='No Perturbation (2-body)')
        ax.plot(pos_pert[:, 0], pos_pert[:, 1], 'r-', linewidth=1.5, alpha=0.7, label='With Perturbation (N-body)')
        ax.plot(0, 0, 'yo', markersize=10, label='Central Body')
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_title('Orbit Comparison (XY Plane)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.set_aspect('equal')
        
        ax = axes[0, 1]
        ax.plot(times / 86400, diff_mag, 'g-', linewidth=1.5)
        ax.set_xlabel('Time (days)')
        ax.set_ylabel('Position Deviation (m)')
        ax.set_title('Position Deviation due to Perturbation')
        ax.grid(True, alpha=0.3)
        ax.set_yscale('log')
        
        ax = axes[1, 0]
        ax.plot(times / 86400, diff[:, 0], 'r-', linewidth=1, label='X')
        ax.plot(times / 86400, diff[:, 1], 'g-', linewidth=1, label='Y')
        ax.plot(times / 86400, diff[:, 2], 'b-', linewidth=1, label='Z')
        ax.set_xlabel('Time (days)')
        ax.set_ylabel('Position Deviation Components (m)')
        ax.set_title('Position Deviation Components')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        perturbations = self.compute_perturbation_acceleration(perturbed_states, target_index, central_index)
        pert_mag = np.linalg.norm(perturbations, axis=1)
        
        ax = axes[1, 1]
        ax.plot(times / 86400, pert_mag, 'm-', linewidth=1.5)
        ax.set_xlabel('Time (days)')
        ax.set_ylabel('Perturbation Acceleration (m/s²)')
        ax.set_title('3rd-body Perturbation Acceleration')
        ax.grid(True, alpha=0.3)
        ax.set_yscale('log')
        
        plt.tight_layout()
        return fig, axes
