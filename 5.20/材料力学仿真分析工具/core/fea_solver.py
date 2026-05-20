import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import vtk


@dataclass
class FEA_Results:
    nodal_displacements: np.ndarray = None
    nodal_stresses: np.ndarray = None
    nodal_strains: np.ndarray = None
    von_mises_stress: np.ndarray = None
    principal_stresses: np.ndarray = None
    reaction_forces: np.ndarray = None
    element_stresses: np.ndarray = None
    
    max_von_mises: float = 0.0
    min_von_mises: float = 0.0
    max_displacement: float = 0.0
    yield_strength: float = 250e6
    
    def is_valid(self) -> bool:
        return self.von_mises_stress is not None and len(self.von_mises_stress) > 0


class SimpleFEASolver:
    def __init__(self):
        self.results = FEA_Results()
        self.material_props = None
        self.load_condition = None
        self.boundary_condition = None
        self.yield_strength = 250e6
        
    def set_material(self, E: float, nu: float, rho: float = 7850.0, yield_strength: float = 250e6):
        self.E = E
        self.nu = nu
        self.rho = rho
        self.G = E / (2 * (1 + nu))
        self.yield_strength = yield_strength
        
    def set_load(self, magnitude: float, direction: List[float]):
        self.load_magnitude = magnitude
        norm = np.sqrt(sum(d*d for d in direction))
        if norm > 0:
            self.load_direction = [d / norm for d in direction]
        else:
            self.load_direction = [0.0, 0.0, -1.0]
            
    def set_boundary(self, fix_x: bool, fix_y: bool, fix_z: bool):
        self.fix_x = fix_x
        self.fix_y = fix_y
        self.fix_z = fix_z
        
    def compute_D_matrix_3d(self) -> np.ndarray:
        E = self.E
        nu = self.nu
        factor = E / ((1 + nu) * (1 - 2 * nu))
        
        D = factor * np.array([
            [1 - nu, nu, nu, 0, 0, 0],
            [nu, 1 - nu, nu, 0, 0, 0],
            [nu, nu, 1 - nu, 0, 0, 0],
            [0, 0, 0, (1 - 2 * nu) / 2, 0, 0],
            [0, 0, 0, 0, (1 - 2 * nu) / 2, 0],
            [0, 0, 0, 0, 0, (1 - 2 * nu) / 2]
        ])
        return D
        
    def compute_von_mises(self, stresses: np.ndarray) -> np.ndarray:
        if stresses.ndim == 1:
            s11, s22, s33, s12, s23, s13 = stresses
            vm = np.sqrt(0.5 * ((s11 - s22)**2 + (s22 - s33)**2 + (s33 - s11)**2 +
                               6 * (s12**2 + s23**2 + s13**2)))
            return vm
        else:
            vm = np.zeros(len(stresses))
            for i in range(len(stresses)):
                s11, s22, s33, s12, s23, s13 = stresses[i]
                vm[i] = np.sqrt(0.5 * ((s11 - s22)**2 + (s22 - s33)**2 + (s33 - s11)**2 +
                                      6 * (s12**2 + s23**2 + s13**2)))
            return vm
            
    def compute_principal_stresses(self, stresses: np.ndarray) -> np.ndarray:
        principal = np.zeros((len(stresses), 3))
        for i in range(len(stresses)):
            s11, s22, s33, s12, s23, s13 = stresses[i]
            stress_tensor = np.array([
                [s11, s12, s13],
                [s12, s22, s23],
                [s13, s23, s33]
            ])
            eigenvalues, _ = np.linalg.eigh(stress_tensor)
            principal[i] = np.sort(eigenvalues)[::-1]
        return principal
        
    def solve(self, polydata: vtk.vtkPolyData) -> FEA_Results:
        num_points = polydata.GetNumberOfPoints()
        
        if num_points == 0:
            raise ValueError("模型没有顶点数据")
        
        points = np.zeros((num_points, 3))
        for i in range(num_points):
            points[i] = polydata.GetPoint(i)
            
        return self._solve_surface_stress(points, polydata)
        
    def _solve_surface_stress(self, points: np.ndarray, polydata: vtk.vtkPolyData) -> FEA_Results:
        num_points = len(points)
        
        center = np.mean(points, axis=0)
        distances = np.linalg.norm(points - center, axis=1)
        max_dist = np.max(distances)
        
        if max_dist < 1e-10:
            max_dist = 1.0
        
        load_dir = np.array(self.load_direction)
        displacements = np.zeros((num_points, 3))
        
        load_scale = 1e-3
        
        for i in range(num_points):
            rel_pos = points[i] - center
            disp_factor = (distances[i] / max_dist) ** 2
            displacements[i] = disp_factor * self.load_magnitude * load_scale * load_dir
            
        nodal_displacements = np.zeros(num_points)
        for i in range(num_points):
            nodal_displacements[i] = np.linalg.norm(displacements[i])
            
        strains = np.zeros((num_points, 6))
        stresses = np.zeros((num_points, 6))
        
        D = self.compute_D_matrix_3d()
        
        stress_scale = 1e3
        
        for i in range(num_points):
            rel_pos = points[i] - center
            stress_factor = (distances[i] / max_dist) * self.load_magnitude * stress_scale
            
            normal_dir = rel_pos / (np.linalg.norm(rel_pos) + 1e-10)
            normal_stress = stress_factor * np.dot(normal_dir, load_dir)
            
            stresses[i, 0] = normal_stress
            stresses[i, 1] = normal_stress * 0.3
            stresses[i, 2] = normal_stress * 0.2
            stresses[i, 3] = stress_factor * 0.1
            stresses[i, 4] = stress_factor * 0.05
            stresses[i, 5] = stress_factor * 0.08
            
        von_mises = self.compute_von_mises(stresses)
        principal = self.compute_principal_stresses(stresses)
        
        strains = stresses / self.E
        
        self.results = FEA_Results(
            nodal_displacements=nodal_displacements,
            nodal_stresses=stresses,
            nodal_strains=strains,
            von_mises_stress=von_mises,
            principal_stresses=principal,
            reaction_forces=None,
            element_stresses=stresses
        )
        
        self.results.max_von_mises = float(np.max(von_mises))
        self.results.min_von_mises = float(np.min(von_mises))
        self.results.max_displacement = float(np.max(nodal_displacements))
        self.results.yield_strength = self.yield_strength
        
        return self.results
        
    def get_results_summary(self) -> Dict:
        if not self.results.is_valid():
            return {}
            
        max_vm = self.results.max_von_mises
        safety_factor = float('inf')
        
        if max_vm > 1e-10:
            safety_factor = self.yield_strength / max_vm
        
        return {
            "max_von_mises": float(self.results.max_von_mises),
            "min_von_mises": float(self.results.min_von_mises),
            "max_displacement": float(self.results.max_displacement),
            "mean_stress": float(np.mean(self.results.von_mises_stress)),
            "safety_factor": safety_factor,
            "yield_strength": self.yield_strength
        }
