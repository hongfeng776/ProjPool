import numpy as np


class Planet:
    def __init__(self, name, mass, semi_major_axis, eccentricity, inclination=0.0, 
                 longitude_of_ascending_node=0.0, argument_of_perihelion=0.0, 
                 mean_anomaly=0.0):
        self.name = name
        self.mass = mass
        self.semi_major_axis = semi_major_axis
        self.eccentricity = eccentricity
        self.inclination = np.radians(inclination)
        self.longitude_of_ascending_node = np.radians(longitude_of_ascending_node)
        self.argument_of_perihelion = np.radians(argument_of_perihelion)
        self.mean_anomaly = np.radians(mean_anomaly)
        
    def get_orbital_period(self, central_mass=1.989e30):
        G = 6.67430e-11
        return 2 * np.pi * np.sqrt(self.semi_major_axis**3 / (G * central_mass))
