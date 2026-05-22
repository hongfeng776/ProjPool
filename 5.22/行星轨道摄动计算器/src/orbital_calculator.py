import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from .planet import Planet


class OrbitalCalculator:
    def __init__(self):
        self.planets = []
        self.G = 6.67430e-11
        self.sun_mass = 1.989e30
        
    def add_planet(self, planet):
        self.planets.append(planet)
        
    def solve_kepler_equation(self, M, e, tolerance=1e-10, max_iterations=100):
        E = M
        for _ in range(max_iterations):
            dE = (M - E + e * np.sin(E)) / (1 - e * np.cos(E))
            E = E + dE
            if abs(dE) < tolerance:
                break
        return E
    
    def true_anomaly_from_eccentric(self, E, e):
        return 2 * np.arctan2(np.sqrt(1 + e) * np.sin(E / 2), 
                              np.sqrt(1 - e) * np.cos(E / 2))
    
    def get_orbital_position(self, planet, time):
        n = np.sqrt(self.G * self.sun_mass / planet.semi_major_axis**3)
        M = planet.mean_anomaly + n * time
        E = self.solve_kepler_equation(M, planet.eccentricity)
        nu = self.true_anomaly_from_eccentric(E, planet.eccentricity)
        
        r = planet.semi_major_axis * (1 - planet.eccentricity * np.cos(E))
        
        x_orbital = r * np.cos(nu)
        y_orbital = r * np.sin(nu)
        
        omega = planet.argument_of_perihelion
        Omega = planet.longitude_of_ascending_node
        i = planet.inclination
        
        x = (np.cos(Omega) * np.cos(omega) - np.sin(Omega) * np.sin(omega) * np.cos(i)) * x_orbital + \
            (-np.cos(Omega) * np.sin(omega) - np.sin(Omega) * np.cos(omega) * np.cos(i)) * y_orbital
        
        y = (np.sin(Omega) * np.cos(omega) + np.cos(Omega) * np.sin(omega) * np.cos(i)) * x_orbital + \
            (-np.sin(Omega) * np.sin(omega) + np.cos(Omega) * np.cos(omega) * np.cos(i)) * y_orbital
        
        z = (np.sin(omega) * np.sin(i)) * x_orbital + (np.cos(omega) * np.sin(i)) * y_orbital
        
        return np.array([x, y, z])
    
    def calculate_perturbation(self, planet_index, time):
        if len(self.planets) < 2:
            return np.zeros(3)
        
        target_planet = self.planets[planet_index]
        target_pos = self.get_orbital_position(target_planet, time)
        perturbation = np.zeros(3)
        
        for i, other_planet in enumerate(self.planets):
            if i != planet_index:
                other_pos = self.get_orbital_position(other_planet, time)
                r_vec = other_pos - target_pos
                r = np.linalg.norm(r_vec)
                if r > 0:
                    perturbation += self.G * other_planet.mass * r_vec / (r**3)
        
        return perturbation
    
    def plot_orbit(self, planet, num_points=1000):
        period = planet.get_orbital_period(self.sun_mass)
        times = np.linspace(0, period, num_points)
        positions = np.array([self.get_orbital_position(planet, t) for t in times])
        
        fig = plt.figure(figsize=(10, 10))
        ax = fig.add_subplot(111, projection='3d')
        
        ax.plot(positions[:, 0], positions[:, 1], positions[:, 2], 
                label=f'{planet.name} Orbit')
        ax.scatter([0], [0], [0], color='yellow', s=100, label='Sun')
        
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_zlabel('Z (m)')
        ax.set_title(f'{planet.name} Orbital Path')
        ax.legend()
        ax.grid(True)
        
        return fig, ax
    
    def animate_orbit(self, planet, duration=10, fps=30):
        period = planet.get_orbital_period(self.sun_mass)
        num_frames = duration * fps
        times = np.linspace(0, period, num_frames)
        
        fig = plt.figure(figsize=(10, 10))
        ax = fig.add_subplot(111, projection='3d')
        
        all_positions = np.array([self.get_orbital_position(planet, t) for t in times])
        
        ax.set_xlim(np.min(all_positions[:, 0]), np.max(all_positions[:, 0]))
        ax.set_ylim(np.min(all_positions[:, 1]), np.max(all_positions[:, 1]))
        ax.set_zlim(np.min(all_positions[:, 2]), np.max(all_positions[:, 2]))
        
        ax.set_xlabel('X (m)')
        ax.set_ylabel('Y (m)')
        ax.set_zlabel('Z (m)')
        ax.set_title(f'{planet.name} Orbital Animation')
        
        orbit_line, = ax.plot([], [], [], label='Orbit')
        planet_point, = ax.plot([], [], [], 'ro', markersize=10, label=planet.name)
        ax.scatter([0], [0], [0], color='yellow', s=100, label='Sun')
        ax.legend()
        
        def update(frame):
            orbit_line.set_data(all_positions[:frame+1, 0], all_positions[:frame+1, 1])
            orbit_line.set_3d_properties(all_positions[:frame+1, 2])
            planet_point.set_data([all_positions[frame, 0]], [all_positions[frame, 1]])
            planet_point.set_3d_properties([all_positions[frame, 2]])
            return orbit_line, planet_point
        
        anim = FuncAnimation(fig, update, frames=num_frames, interval=1000/fps, blit=True)
        return anim
