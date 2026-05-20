import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class MaterialProperties:
    name: str = "结构钢"
    youngs_modulus: float = 206000.0
    poisson_ratio: float = 0.3
    density: float = 7850.0
    yield_strength: float = 250.0


@dataclass
class LoadCondition:
    load_type: str = "集中力"
    magnitude: float = 1000.0
    direction: List[float] = field(default_factory=lambda: [0.0, 0.0, -1.0])
    location: Optional[List[float]] = None


@dataclass
class BoundaryCondition:
    constraint_type: str = "固定约束"
    fix_x: bool = True
    fix_y: bool = True
    fix_z: bool = True
    rot_x: bool = False
    rot_y: bool = False
    rot_z: bool = False


@dataclass
class MeshSettings:
    element_type: str = "四面体"
    element_size: float = 10.0
    density: str = "中等"


class SimulationData:
    def __init__(self):
        self.material = MaterialProperties()
        self.load = LoadCondition()
        self.boundary = BoundaryCondition()
        self.mesh = MeshSettings()
        
        self.model_data = None
        self.mesh_data = None
        self.results_data = None
        
    def set_material_from_dict(self, params: Dict):
        self.material.name = params.get("type", "结构钢")
        self.material.youngs_modulus = params.get("youngs_modulus", 206000.0)
        self.material.poisson_ratio = params.get("poisson_ratio", 0.3)
        self.material.density = params.get("density", 7850.0)
        self.material.yield_strength = params.get("yield_strength", 250.0)
        
    def set_load_from_dict(self, params: Dict):
        self.load.load_type = params.get("type", "集中力")
        self.load.magnitude = params.get("magnitude", 1000.0)
        self.load.direction = params.get("direction", [0.0, 0.0, -1.0])
        
    def set_boundary_from_dict(self, params: Dict):
        self.boundary.constraint_type = params.get("type", "固定约束")
        self.boundary.fix_x = params.get("fix_x", "固定") == "固定"
        self.boundary.fix_y = params.get("fix_y", "固定") == "固定"
        self.boundary.fix_z = params.get("fix_z", "固定") == "固定"
        self.boundary.rot_x = params.get("rot_x", "自由") == "固定"
        self.boundary.rot_y = params.get("rot_y", "自由") == "固定"
        self.boundary.rot_z = params.get("rot_z", "自由") == "固定"
        
    def set_mesh_from_dict(self, params: Dict):
        self.mesh.element_type = params.get("type", "四面体")
        self.mesh.element_size = params.get("element_size", 10.0)
        self.mesh.density = params.get("density", "中等")
        
    def get_all_parameters(self) -> Dict:
        return {
            "material": {
                "name": self.material.name,
                "youngs_modulus": self.material.youngs_modulus,
                "poisson_ratio": self.material.poisson_ratio,
                "density": self.material.density,
                "yield_strength": self.material.yield_strength
            },
            "load": {
                "type": self.load.load_type,
                "magnitude": self.load.magnitude,
                "direction": self.load.direction
            },
            "boundary": {
                "type": self.boundary.constraint_type,
                "fix_x": self.boundary.fix_x,
                "fix_y": self.boundary.fix_y,
                "fix_z": self.boundary.fix_z,
                "rot_x": self.boundary.rot_x,
                "rot_y": self.boundary.rot_y,
                "rot_z": self.boundary.rot_z
            },
            "mesh": {
                "element_type": self.mesh.element_type,
                "element_size": self.mesh.element_size,
                "density": self.mesh.density
            }
        }
        
    def validate(self) -> List[str]:
        errors = []
        
        if self.material.youngs_modulus <= 0:
            errors.append("弹性模量必须大于0")
            
        if not (0 < self.material.poisson_ratio < 0.5):
            errors.append("泊松比必须在0到0.5之间")
            
        if self.material.density <= 0:
            errors.append("密度必须大于0")
            
        if self.mesh.element_size <= 0:
            errors.append("单元尺寸必须大于0")
            
        return errors
