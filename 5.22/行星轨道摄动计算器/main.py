import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import time
import numpy as np
import matplotlib.pyplot as plt
from src import (
    OrbitalCalculator, Planet, TwoBodyProblem, NBodySimulation,
    OrbitParameters, InteractiveInterface, ParameterError
)


def run_simulation_with_params(ic, plot_name='simulation_result'):
    print(f"\n{'='*60}")
    print("Running N-body Simulation")
    print(f"{'='*60}")

    sim_3body = NBodySimulation()
    for name, mass, pos, vel in zip(ic['names'], ic['masses'], ic['positions'], ic['velocities']):
        sim_3body.add_body(name, mass, pos, vel)

    sim_2body = NBodySimulation()
    sim_2body.add_body(ic['names'][0], ic['masses'][0], ic['positions'][0], ic['velocities'][0])
    sim_2body.add_body(ic['names'][1], ic['masses'][1], ic['positions'][1], ic['velocities'][1])

    t_span = (0, ic['sim_duration'])
    dt = ic['time_step']

    print(f"  Simulation duration: {ic['sim_duration'] / OrbitParameters.YEAR:.1f} years")
    print(f"  Time step: {dt / OrbitParameters.DAY:.2f} days")
    print(f"  Total steps: {int(ic['sim_duration'] / dt)}")
    print(f"\n  Integrating 3-body system...")
    
    start_time = time.time()
    progress = 0
    
    def progress_callback(p):
        nonlocal progress
        if int(p) >= progress + 10:
            progress = int(p / 10) * 10
            print(f"    {progress}%...", end='', flush=True)
    
    times_3body, states_3body = sim_3body.integrate(t_span, dt, progress_callback)
    time_3body = time.time() - start_time
    print(f"\n  3-body integration complete: {time_3body:.2f}s")

    print("  Integrating 2-body system...")
    start_time = time.time()
    times_2body, states_2body = sim_2body.integrate(t_span, dt)
    time_2body = time.time() - start_time
    print(f"  2-body integration complete: {time_2body:.2f}s")

    print(f"\n  Performance:")
    print(f"    3-body: {len(times_3body) / time_3body:.0f} steps/s")
    print(f"    2-body: {len(times_2body) / time_2body:.0f} steps/s")

    pos_pert = sim_3body.get_relative_trajectory(states_3body, 1, 0)
    pos_unpert = sim_2body.get_relative_trajectory(states_2body, 1, 0)

    diff = pos_pert - pos_unpert
    diff_mag = np.linalg.norm(diff, axis=1)

    perturbations = sim_3body.compute_perturbation_acceleration(states_3body, 1, 0)
    pert_mag = np.linalg.norm(perturbations, axis=1)

    energy_initial = sim_3body.total_energy(states_3body[0])
    energy_final = sim_3body.total_energy(states_3body[-1])
    energy_error = abs((energy_final - energy_initial) / energy_initial) * 100

    print(f"\n  Results Summary:")
    print(f"    Max position deviation: {np.max(diff_mag) / 1000:.1f} km")
    print(f"    Final position deviation: {diff_mag[-1] / 1000:.1f} km")
    print(f"    Max perturbation acceleration: {np.max(pert_mag):.3e} m/s²")
    print(f"    Energy conservation error: {energy_error:.4e} %")

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))

    ax = axes[0, 0]
    ax.plot(pos_unpert[:, 0], pos_unpert[:, 1], 'b-', linewidth=2, label='2-body (no perturbation)')
    ax.plot(pos_pert[:, 0], pos_pert[:, 1], 'r-', linewidth=1.5, alpha=0.7, label='3-body (with perturbation)')
    
    p2_pos = sim_3body.get_relative_trajectory(states_3body, 2, 0)
    ax.plot(p2_pos[:, 0], p2_pos[:, 1], 'g-', linewidth=1.5, alpha=0.5, label=ic['names'][2])
    
    ax.plot(0, 0, 'yo', markersize=12, label=ic['names'][0])
    ax.set_xlabel('X (m)')
    ax.set_ylabel('Y (m)')
    ax.set_title('Orbit Comparison')
    ax.legend(fontsize=9)
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')

    ax = axes[0, 1]
    ax.plot(times_3body / OrbitParameters.YEAR, diff_mag / 1000, 'g-', linewidth=1.5)
    ax.set_xlabel('Time (years)')
    ax.set_ylabel('Position Deviation (km)')
    ax.set_title('Position Deviation due to Perturbation')
    ax.grid(True, alpha=0.3)

    ax = axes[1, 0]
    ax.plot(times_3body / OrbitParameters.YEAR, pert_mag, 'm-', linewidth=1.5)
    ax.set_xlabel('Time (years)')
    ax.set_ylabel('Perturbation Acceleration (m/s²)')
    ax.set_title('Perturbation Acceleration Magnitude')
    ax.grid(True, alpha=0.3)
    ax.set_yscale('log')

    ax = axes[1, 1]
    r_pert = np.linalg.norm(pos_pert, axis=1)
    r_unpert = np.linalg.norm(pos_unpert, axis=1)
    ax.plot(times_3body / OrbitParameters.YEAR, r_pert / OrbitParameters.AU, 'r-', linewidth=1.5, label='3-body')
    ax.plot(times_2body / OrbitParameters.YEAR, r_unpert / OrbitParameters.AU, 'b-', linewidth=1.5, alpha=0.7, label='2-body')
    ax.set_xlabel('Time (years)')
    ax.set_ylabel('Orbital Radius (AU)')
    ax.set_title('Orbital Radius Comparison')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(f'{plot_name}.png', dpi=150, bbox_inches='tight')
    print(f"\n  Plot saved as: {plot_name}.png")
    print(f"{'='*60}\n")

    return fig, axes


def run_quick_test_all_presets():
    print(f"\n{'='*60}")
    print("Quick Test: All Presets")
    print(f"{'='*60}")

    params = OrbitParameters()
    results = []

    for preset_name in params.list_presets():
        print(f"\nTesting preset: {preset_name}")
        params.load_preset(preset_name)
        ic = params.get_initial_conditions()

        sim = NBodySimulation()
        for name, mass, pos, vel in zip(ic['names'], ic['masses'], ic['positions'], ic['velocities']):
            sim.add_body(name, mass, pos, vel)

        t_span = (0, ic['sim_duration'])
        dt = ic['time_step']

        start_time = time.time()
        times, states = sim.integrate(t_span, dt)
        elapsed = time.time() - start_time

        perturbations = sim.compute_perturbation_acceleration(states, 1, 0)
        max_pert = np.max(np.linalg.norm(perturbations, axis=1))

        energy_initial = sim.total_energy(states[0])
        energy_final = sim.total_energy(states[-1])
        energy_error = abs((energy_final - energy_initial) / energy_initial) * 100

        results.append({
            'preset': preset_name,
            'steps': len(times),
            'time': elapsed,
            'steps_per_sec': len(times) / elapsed,
            'max_perturbation': max_pert,
            'energy_error': energy_error
        })

        print(f"  Steps: {len(times)}, Time: {elapsed:.2f}s, "
              f"Rate: {len(times)/elapsed:.0f} steps/s")
        print(f"  Max perturbation: {max_pert:.3e} m/s², "
              f"Energy error: {energy_error:.4e} %")

    print(f"\n{'='*60}")
    print("Performance Summary")
    print(f"{'='*60}")
    print(f"{'Preset':<20} {'Steps':>8} {'Time(s)':>8} {'Steps/s':>10} {'Energy Err':>12}")
    print(f"{'-'*60}")
    for r in results:
        print(f"{r['preset']:<20} {r['steps']:>8} {r['time']:>8.2f} {r['steps_per_sec']:>10.0f} "
              f"{r['energy_error']:>12.2e}%")
    print(f"{'='*60}\n")

    return results


def main():
    print(f"\n{'='*60}")
    print("Orbit Perturbation Calculator")
    print(f"{'='*60}")
    print("  [1] Run interactive mode")
    print("  [2] Run default simulation")
    print("  [3] Quick test all presets")
    print("  [0] Exit")
    print(f"{'='*60}")

    try:
        choice = input("\nEnter choice (default=1): ").strip()
        choice = int(choice) if choice else 1
    except ValueError:
        choice = 1

    if choice == 0:
        print("Goodbye!")
        return
    elif choice == 2:
        params = OrbitParameters()
        ic = params.get_initial_conditions()
        params.print_summary()
        run_simulation_with_params(ic, 'default_simulation')
        plt.show()
    elif choice == 3:
        run_quick_test_all_presets()
    else:
        interface = InteractiveInterface()
        result = interface.run()
        
        if result == 'quick_test':
            run_quick_test_all_presets()
        elif result:
            run_simulation_with_params(result, 'custom_simulation')
            plt.show()


if __name__ == '__main__':
    main()
