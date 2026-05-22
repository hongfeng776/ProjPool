import numpy as np


class ParameterError(Exception):
    pass


class OrbitParameters:
    G = 6.67430e-11
    AU = 1.496e11
    M_SUN = 1.989e30
    M_EARTH = 5.972e24
    M_JUPITER = 1.898e27
    DAY = 86400
    YEAR = 365.25 * DAY

    PRESETS = {
        'default': {
            'name': 'Default (Sun-Earth-Jupiter)',
            'central_mass': M_SUN,
            'planet1_mass': M_EARTH,
            'planet2_mass': M_JUPITER,
            'planet1_semi_major': AU,
            'planet2_semi_major': 5.2 * AU,
            'planet1_eccentricity': 0.0167,
            'planet2_eccentricity': 0.0489,
            'simulation_years': 10,
            'time_step_days': 1
        },
        'inner_solar': {
            'name': 'Inner Solar System',
            'central_mass': M_SUN,
            'planet1_mass': M_EARTH,
            'planet2_mass': 0.815 * M_EARTH,
            'planet1_semi_major': AU,
            'planet2_semi_major': 0.723 * AU,
            'planet1_eccentricity': 0.0167,
            'planet2_eccentricity': 0.0067,
            'simulation_years': 5,
            'time_step_days': 0.5
        },
        'gas_giant': {
            'name': 'Close Gas Giant',
            'central_mass': M_SUN,
            'planet1_mass': M_EARTH,
            'planet2_mass': 10 * M_JUPITER,
            'planet1_semi_major': AU,
            'planet2_semi_major': 2 * AU,
            'planet1_eccentricity': 0.0,
            'planet2_eccentricity': 0.3,
            'simulation_years': 20,
            'time_step_days': 1
        },
        'high_eccentricity': {
            'name': 'High Eccentricity Orbit',
            'central_mass': M_SUN,
            'planet1_mass': 10 * M_EARTH,
            'planet2_mass': 1 * M_JUPITER,
            'planet1_semi_major': AU,
            'planet2_semi_major': 10 * AU,
            'planet1_eccentricity': 0.6,
            'planet2_eccentricity': 0.0,
            'simulation_years': 50,
            'time_step_days': 2
        }
    }

    def __init__(self):
        self.params = self.PRESETS['default'].copy()

    def list_presets(self):
        return list(self.PRESETS.keys())

    def load_preset(self, preset_name):
        if preset_name not in self.PRESETS:
            raise ParameterError(f"Preset '{preset_name}' not found. Available: {list(self.PRESETS.keys())}")
        self.params = self.PRESETS[preset_name].copy()
        return self.params

    def get_param(self, key):
        return self.params.get(key)

    def set_param(self, key, value):
        if key not in self.params:
            raise ParameterError(f"Unknown parameter: {key}")
        self.params[key] = value
        self._validate_param(key, value)

    def _validate_param(self, key, value):
        if 'mass' in key and value <= 0:
            raise ParameterError(f"{key} must be positive")
        if 'semi_major' in key and value <= 0:
            raise ParameterError(f"{key} must be positive")
        if 'eccentricity' in key and not (0 <= value < 1):
            raise ParameterError(f"{key} must be in [0, 1)")
        if 'simulation_years' in key and value <= 0:
            raise ParameterError("simulation_years must be positive")
        if 'time_step_days' in key and value <= 0:
            raise ParameterError("time_step_days must be positive")

    def validate_all(self):
        for key in self.params:
            self._validate_param(key, self.params[key])

    def get_initial_conditions(self):
        self.validate_all()

        def get_perihelion_velocity(M, a, e):
            r_p = a * (1 - e)
            return np.sqrt(self.G * M * (2 / r_p - 1 / a))

        central_mass = self.params['central_mass']
        p1_a = self.params['planet1_semi_major']
        p1_e = self.params['planet1_eccentricity']
        p2_a = self.params['planet2_semi_major']
        p2_e = self.params['planet2_eccentricity']

        r1_p = p1_a * (1 - p1_e)
        v1_p = get_perihelion_velocity(central_mass, p1_a, p1_e)

        r2_p = p2_a * (1 - p2_e)
        v2_p = get_perihelion_velocity(central_mass, p2_a, p2_e)

        positions = [
            [0.0, 0.0, 0.0],
            [r1_p, 0.0, 0.0],
            [r2_p, 0.0, 0.0]
        ]

        velocities = [
            [0.0, 0.0, 0.0],
            [0.0, v1_p, 0.0],
            [0.0, v2_p, 0.0]
        ]

        masses = [
            self.params['central_mass'],
            self.params['planet1_mass'],
            self.params['planet2_mass']
        ]

        names = ['Central Star', 'Planet 1', 'Planet 2']

        sim_duration = self.params['simulation_years'] * self.YEAR
        time_step = self.params['time_step_days'] * self.DAY

        return {
            'positions': positions,
            'velocities': velocities,
            'masses': masses,
            'names': names,
            'sim_duration': sim_duration,
            'time_step': time_step
        }

    def print_summary(self):
        print("\n" + "=" * 60)
        print("Current Simulation Parameters")
        print("=" * 60)
        print(f"  Configuration: {self.params['name']}")
        print("\n  Central Star:")
        print(f"    Mass: {self.params['central_mass']:.3e} kg "
              f"({self.params['central_mass'] / self.M_SUN:.2f} M☉)")
        print("\n  Planet 1:")
        print(f"    Mass: {self.params['planet1_mass']:.3e} kg "
              f"({self.params['planet1_mass'] / self.M_EARTH:.2f} M⊕)")
        print(f"    Semi-major axis: {self.params['planet1_semi_major'] / self.AU:.2f} AU")
        print(f"    Eccentricity: {self.params['planet1_eccentricity']:.4f}")
        print("\n  Planet 2:")
        print(f"    Mass: {self.params['planet2_mass']:.3e} kg "
              f"({self.params['planet2_mass'] / self.M_JUPITER:.2f} M♃)")
        print(f"    Semi-major axis: {self.params['planet2_semi_major'] / self.AU:.2f} AU")
        print(f"    Eccentricity: {self.params['planet2_eccentricity']:.4f}")
        print("\n  Simulation:")
        print(f"    Duration: {self.params['simulation_years']} years")
        print(f"    Time step: {self.params['time_step_days']} days")
        print("=" * 60 + "\n")


class InteractiveInterface:
    def __init__(self):
        self.params = OrbitParameters()

    def print_menu(self):
        print("\n" + "=" * 60)
        print("Orbit Perturbation Calculator - Interactive Menu")
        print("=" * 60)
        print("  1. Load preset configuration")
        print("  2. View current parameters")
        print("  3. Modify parameters")
        print("  4. Run simulation")
        print("  5. Quick test (all presets)")
        print("  0. Exit")
        print("=" * 60)

    def select_preset(self):
        print("\nAvailable presets:")
        for i, (key, preset) in enumerate(self.params.PRESETS.items(), 1):
            print(f"  {i}. {preset['name']}")

        try:
            choice = int(input("\nSelect preset (0 to cancel): ")) - 1
            if 0 <= choice < len(self.params.PRESETS):
                preset_names = list(self.params.PRESETS.keys())
                self.params.load_preset(preset_names[choice])
                print(f"\nLoaded preset: {self.params.params['name']}")
            elif choice != -1:
                print("Invalid selection")
        except (ValueError, ParameterError) as e:
            print(f"Error: {e}")

    def modify_parameters(self):
        param_list = [
            ('central_mass', 'Central star mass (kg)'),
            ('planet1_mass', 'Planet 1 mass (kg)'),
            ('planet2_mass', 'Planet 2 mass (kg)'),
            ('planet1_semi_major', 'Planet 1 semi-major axis (m)'),
            ('planet2_semi_major', 'Planet 2 semi-major axis (m)'),
            ('planet1_eccentricity', 'Planet 1 eccentricity'),
            ('planet2_eccentricity', 'Planet 2 eccentricity'),
            ('simulation_years', 'Simulation duration (years)'),
            ('time_step_days', 'Time step (days)')
        ]

        print("\nModify parameters:")
        for i, (key, desc) in enumerate(param_list, 1):
            current = self.params.get_param(key)
            if 'mass' in key and 'central' not in key:
                print(f"  {i}. {desc}: {current:.3e} ({current / OrbitParameters.M_EARTH:.2f} M⊕)")
            elif 'semi_major' in key:
                print(f"  {i}. {desc}: {current:.3e} ({current / OrbitParameters.AU:.2f} AU)")
            else:
                print(f"  {i}. {desc}: {current}")

        try:
            choice = int(input("\nSelect parameter to modify (0 to cancel): ")) - 1
            if 0 <= choice < len(param_list):
                key, desc = param_list[choice]
                new_value = float(input(f"Enter new value for {desc}: "))
                self.params.set_param(key, new_value)
                print(f"Updated {desc} to {new_value}")
            elif choice != -1:
                print("Invalid selection")
        except (ValueError, ParameterError) as e:
            print(f"Error: {e}")

    def run_simulation(self):
        print("\nPreparing simulation...")
        self.params.print_summary()

        try:
            ic = self.params.get_initial_conditions()
        except ParameterError as e:
            print(f"Parameter error: {e}")
            return

        print("Running simulation...")
        return ic

    def run(self):
        while True:
            self.print_menu()
            try:
                choice = int(input("Enter your choice: "))
                if choice == 0:
                    print("Goodbye!")
                    break
                elif choice == 1:
                    self.select_preset()
                elif choice == 2:
                    self.params.print_summary()
                elif choice == 3:
                    self.modify_parameters()
                elif choice == 4:
                    return self.run_simulation()
                elif choice == 5:
                    return 'quick_test'
                else:
                    print("Invalid choice")
            except ValueError:
                print("Please enter a valid number")
