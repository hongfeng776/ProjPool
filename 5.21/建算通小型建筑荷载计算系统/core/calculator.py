import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import datetime


LOAD_PARAMS = {
    "住宅": {"live_load": 2.0, "wall_density": 20.0, "floor_thickness": 0.12},
    "办公楼": {"live_load": 2.0, "wall_density": 20.0, "floor_thickness": 0.12},
    "办公室": {"live_load": 2.0, "wall_density": 20.0, "floor_thickness": 0.12},
    "商场": {"live_load": 3.5, "wall_density": 20.0, "floor_thickness": 0.15},
    "教室": {"live_load": 2.5, "wall_density": 20.0, "floor_thickness": 0.12},
    "医院": {"live_load": 2.0, "wall_density": 20.0, "floor_thickness": 0.12},
    "旅馆": {"live_load": 2.0, "wall_density": 20.0, "floor_thickness": 0.12},
    "图书馆": {"live_load": 5.0, "wall_density": 20.0, "floor_thickness": 0.15},
    "仓库": {"live_load": 5.0, "wall_density": 20.0, "floor_thickness": 0.15},
    "健身房": {"live_load": 4.0, "wall_density": 20.0, "floor_thickness": 0.15},
    "餐厅": {"live_load": 2.5, "wall_density": 20.0, "floor_thickness": 0.12},
}


LIVE_LOAD_STANDARD = {
    "住宅、宿舍": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.4},
    "办公楼": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.4},
    "办公室": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.4},
    "旅馆、医院病房": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.4},
    "托儿所、幼儿园": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.4},
    "试验室、阅览室": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "会议室、医院门诊室": {"q_k": 2.0, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "教室、食堂、餐厅": {"q_k": 2.5, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "一般资料档案室": {"q_k": 2.5, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "礼堂、剧场、影院": {"q_k": 3.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.3},
    "有固定座位的看台": {"q_k": 3.0, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.3},
    "公共洗衣房": {"q_k": 3.0, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "商店、展览厅": {"q_k": 3.5, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "车站、港口、机场大厅": {"q_k": 3.5, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "无固定座位的看台": {"q_k": 3.5, "psi_c": 0.7, "psi_f": 0.5, "psi_q": 0.3},
    "健身房、演出舞台": {"q_k": 4.0, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.5},
    "运动场、舞厅": {"q_k": 4.0, "psi_c": 0.7, "psi_f": 0.6, "psi_q": 0.3},
    "书库、档案库、贮藏室": {"q_k": 5.0, "psi_c": 0.9, "psi_f": 0.9, "psi_q": 0.8},
    "密集柜书库": {"q_k": 12.0, "psi_c": 0.9, "psi_f": 0.9, "psi_q": 0.8},
    "通风机房、电梯机房": {"q_k": 7.0, "psi_c": 0.9, "psi_f": 0.9, "psi_q": 0.8},
}


DEAD_LOAD_PARAMS = {
    "slab_thickness": 0.12,
    "concrete_density": 25.0,
    "finish_weight": 0.4,
    "ceiling_weight": 0.3,
    "wall_material_density": 20.0,
    "wall_plaster": 0.02,
    "door_window_weight_per_m2": 0.3,
}


@dataclass
class BuildingInput:
    floor_area: float
    floor_height: float
    wall_thickness: float
    usage_function: str
    floors: int = 1
    building_name: str = ""


@dataclass
class LoadResult:
    name: str
    standard_value: float
    unit: str
    coefficient: Optional[float] = None
    remark: str = ""


@dataclass
class CalculationRecord:
    building_name: str
    floor_area: float
    floor_height: float
    wall_thickness: float
    usage_function: str
    dead_load_kN_m2: float
    live_load_kN_m2: float
    total_dead_load_kN: float
    total_live_load_kN: float
    total_load_kN: float
    calculated_at: str = ""


class LoadCalculator:
    def __init__(self, db_manager=None, params: Optional[Dict] = None):
        self.db = db_manager
        self.params = params or DEAD_LOAD_PARAMS

    def get_live_load_options(self) -> List[str]:
        return list(LOAD_PARAMS.keys())

    def calculate(self, area: float, floor_height: float, wall_thickness: float,
                  building_type: str, building_name: str = "", floors: int = 1) -> Dict:
        params = LOAD_PARAMS.get(building_type, LOAD_PARAMS["办公楼"])
        live_load_qk = params["live_load"]
        wall_density = params["wall_density"]
        slab_thickness = params["floor_thickness"]

        g_k_slab = slab_thickness * self.params["concrete_density"]
        g_k_finish = self.params["finish_weight"]
        g_k_ceiling = self.params["ceiling_weight"]
        g_k_floor = g_k_slab + g_k_finish + g_k_ceiling

        plaster_thickness = self.params["wall_plaster"]
        g_k_wall_per_m2 = (wall_thickness * wall_density +
                           2 * plaster_thickness * 20.0)

        perimeter = 4 * np.sqrt(area)
        wall_area = perimeter * floor_height
        window_area = wall_area * 0.2
        wall_net_area = wall_area - window_area

        wall_load_total = (wall_net_area * g_k_wall_per_m2 +
                           window_area * self.params["door_window_weight_per_m2"])
        g_k_wall_avg = wall_load_total / area

        g_k_total = g_k_floor + g_k_wall_avg

        q_k_total = live_load_qk

        total_dead_load = g_k_total * area * floors
        total_live_load = q_k_total * area * floors
        total_load_design = 1.2 * total_dead_load + 1.4 * total_live_load

        results = {
            "楼板自重": {"value": g_k_slab, "unit": "kN/m²"},
            "楼面装修": {"value": g_k_finish, "unit": "kN/m²"},
            "吊顶重量": {"value": g_k_ceiling, "unit": "kN/m²"},
            "墙体重量": {"value": g_k_wall_avg, "unit": "kN/m²"},
            "门窗重量": {"value": (window_area * self.params["door_window_weight_per_m2"]) / area, "unit": "kN/m²"},
            "恒载标准值(面荷载)": {"value": g_k_total, "unit": "kN/m²"},
            "恒载标准值(总荷载)": {"value": total_dead_load, "unit": "kN"},
            "活载标准值(面荷载)": {"value": q_k_total, "unit": "kN/m²"},
            "活载标准值(总荷载)": {"value": total_live_load, "unit": "kN"},
            "荷载组合(1.2恒+1.4活)": {"value": total_load_design / area / floors, "unit": "kN/m²"},
            "总荷载设计值": {"value": total_load_design, "unit": "kN"},
        }

        if self.db is not None:
            try:
                self._save_to_db(
                    building_name=building_name or "未命名建筑",
                    building_type=building_type,
                    area=area,
                    floor_height=floor_height,
                    wall_thickness=wall_thickness,
                    floors=floors,
                    results=results
                )
            except Exception as e:
                print(f"Warning: Failed to save to database: {e}")

        return results

    def _save_to_db(self, building_name: str, building_type: str, area: float,
                    floor_height: float, wall_thickness: float, floors: int,
                    results: Dict):
        cursor = self.db.execute(
            """INSERT INTO buildings (name, building_type, floors, area, created_at, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (building_name, building_type, floors, area)
        )
        building_id = cursor.lastrowid

        self.db.execute(
            """INSERT INTO load_cases (building_id, case_name, load_type, magnitude, unit, description, created_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (building_id, "恒荷载标准值", "恒荷载", results["恒载标准值(面荷载)"]["value"], "kN/m²",
             f"{building_type} 建筑恒载标准值")
        )

        self.db.execute(
            """INSERT INTO load_cases (building_id, case_name, load_type, magnitude, unit, description, created_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (building_id, "活荷载标准值", "活荷载", results["活载标准值(面荷载)"]["value"], "kN/m²",
             f"{building_type} 建筑活载标准值(GB50009-2012)")
        )

        for name, data in results.items():
            self.db.execute(
                """INSERT INTO calculation_results (building_id, result_name, result_value, result_unit, calculated_at)
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (building_id, name, data["value"], data["unit"])
            )

    def calculate_dead_load(self, floor_area: float, floor_height: float,
                            wall_thickness: float) -> List[LoadResult]:
        g_k_slab = self.params["slab_thickness"] * self.params["concrete_density"]
        g_k_finish = self.params["finish_weight"]
        g_k_ceiling = self.params["ceiling_weight"]
        g_k_floor = g_k_slab + g_k_finish + g_k_ceiling

        wall_density = self.params["wall_material_density"]
        plaster_thickness = self.params["wall_plaster"]
        g_k_wall_per_m2 = (wall_thickness * wall_density +
                           2 * plaster_thickness * 20.0)

        perimeter = 4 * np.sqrt(floor_area)
        wall_area = perimeter * floor_height
        wall_load_total = wall_area * g_k_wall_per_m2
        g_k_wall_avg = wall_load_total / floor_area

        g_k_total = g_k_floor + g_k_wall_avg

        results = [
            LoadResult("楼板自重", g_k_slab, "kN/㎡", remark="120mm钢筋混凝土"),
            LoadResult("面层自重", g_k_finish, "kN/㎡", remark="水泥砂浆面层"),
            LoadResult("吊顶自重", g_k_ceiling, "kN/㎡", remark="轻钢龙骨吊顶"),
            LoadResult("楼层恒载小计", g_k_floor, "kN/㎡", remark="不含墙体"),
            LoadResult("墙体自重（均布）", g_k_wall_avg, "kN/㎡",
                       remark=f"墙厚{wall_thickness * 1000:.0f}mm，层高{floor_height}m"),
            LoadResult("总恒载标准值", g_k_total, "kN/㎡", remark="含楼板、面层、吊顶、墙体"),
        ]
        return results

    def calculate_live_load(self, usage_function: str) -> List[LoadResult]:
        if usage_function not in LIVE_LOAD_STANDARD:
            usage_function = "办公楼"

        data = LIVE_LOAD_STANDARD[usage_function]
        q_k = data["q_k"]

        results = [
            LoadResult("使用功能", 0, "",
                       remark=usage_function),
            LoadResult("活荷载标准值 q_k", q_k, "kN/㎡",
                       remark="GB50009-2012 表5.1.1"),
            LoadResult("组合值系数 ψ_c", data["psi_c"], "-",
                       remark="用于基本组合"),
            LoadResult("频遇值系数 ψ_f", data["psi_f"], "-",
                       remark="用于频遇组合"),
            LoadResult("准永久值系数 ψ_q", data["psi_q"], "-",
                       remark="用于准永久组合"),
        ]
        return results

    def calculate_total(self, building_input: BuildingInput) -> Dict:
        dead_results = self.calculate_dead_load(
            building_input.floor_area,
            building_input.floor_height,
            building_input.wall_thickness
        )
        live_results = self.calculate_live_load(building_input.usage_function)

        g_k_total = dead_results[-1].standard_value
        q_k_total = live_results[1].standard_value

        total_dead_load = g_k_total * building_input.floor_area * building_input.floors
        total_live_load = q_k_total * building_input.floor_area * building_input.floors
        total_load = total_dead_load + total_live_load

        return {
            "building_input": building_input,
            "dead_load_results": dead_results,
            "live_load_results": live_results,
            "g_k_total": g_k_total,
            "q_k_total": q_k_total,
            "total_dead_load": total_dead_load,
            "total_live_load": total_live_load,
            "total_load": total_load,
            "dead_load_per_m2": g_k_total,
            "live_load_per_m2": q_k_total,
        }


WIND_SNOW_PARAMS = {
    "北京": {"w0": 0.45, "s0": 0.40, "snow_district": "II"},
    "上海": {"w0": 0.55, "s0": 0.20, "snow_district": "III"},
    "广州": {"w0": 0.50, "s0": 0.00, "snow_district": "无"},
    "深圳": {"w0": 0.75, "s0": 0.00, "snow_district": "无"},
    "杭州": {"w0": 0.45, "s0": 0.45, "snow_district": "III"},
    "南京": {"w0": 0.40, "s0": 0.65, "snow_district": "II"},
    "成都": {"w0": 0.30, "s0": 0.10, "snow_district": "IV"},
    "重庆": {"w0": 0.40, "s0": 0.00, "snow_district": "无"},
    "武汉": {"w0": 0.35, "s0": 0.50, "snow_district": "III"},
    "西安": {"w0": 0.35, "s0": 0.25, "snow_district": "II"},
    "天津": {"w0": 0.50, "s0": 0.40, "snow_district": "II"},
    "苏州": {"w0": 0.45, "s0": 0.40, "snow_district": "III"},
    "郑州": {"w0": 0.45, "s0": 0.40, "snow_district": "II"},
    "长沙": {"w0": 0.35, "s0": 0.45, "snow_district": "III"},
    "沈阳": {"w0": 0.55, "s0": 0.50, "snow_district": "I"},
    "哈尔滨": {"w0": 0.55, "s0": 0.75, "snow_district": "I"},
    "长春": {"w0": 0.65, "s0": 0.65, "snow_district": "I"},
    "大连": {"w0": 0.65, "s0": 0.40, "snow_district": "I"},
    "青岛": {"w0": 0.60, "s0": 0.20, "snow_district": "II"},
    "厦门": {"w0": 0.80, "s0": 0.00, "snow_district": "无"},
}


HEIGHT_FACTOR_B = [
    (5.0, 1.00), (10.0, 1.00), (15.0, 1.14), (20.0, 1.25),
    (30.0, 1.42), (40.0, 1.56), (50.0, 1.67), (60.0, 1.77),
    (70.0, 1.86), (80.0, 1.95), (90.0, 2.02), (100.0, 2.09),
    (150.0, 2.38), (200.0, 2.61), (250.0, 2.80), (300.0, 2.97),
    (350.0, 3.12), (400.0, 3.25), (450.0, 3.36), (500.0, 3.46),
]


ROOF_SNOW_FACTORS = {
    "单坡屋面(i≤25°)": 1.0,
    "单坡屋面(25°<i≤30°)": 0.9,
    "单坡屋面(30°<i≤40°)": 0.8,
    "单坡屋面(i>40°)": 0.4,
    "双坡屋面(拱型)": 1.0,
    "带天窗屋面": 1.1,
    "有女儿墙平屋面": 1.2,
    "平屋面(i≤5°)": 1.0,
}


class WindSnowCalculator:
    def __init__(self, db_manager=None):
        self.db = db_manager

    def get_region_options(self) -> List[str]:
        return list(WIND_SNOW_PARAMS.keys())

    def get_roof_options(self) -> List[str]:
        return list(ROOF_SNOW_FACTORS.keys())

    def _get_height_factor(self, height: float) -> float:
        if height <= HEIGHT_FACTOR_B[0][0]:
            return HEIGHT_FACTOR_B[0][1]
        for i in range(len(HEIGHT_FACTOR_B) - 1):
            z1, f1 = HEIGHT_FACTOR_B[i]
            z2, f2 = HEIGHT_FACTOR_B[i + 1]
            if height <= z2:
                t = (height - z1) / (z2 - z1)
                return f1 + t * (f2 - f1)
        return HEIGHT_FACTOR_B[-1][1]

    def _get_wind_oscillation_factor(self, height: float) -> float:
        if height <= 30.0:
            return 1.0
        return 1.0 + min(0.3, (height - 30.0) / 200.0)

    def calculate_wind_load(self, region: str, height: float,
                            shape_factor: float, building_name: str = "") -> Dict:
        params = WIND_SNOW_PARAMS.get(region, WIND_SNOW_PARAMS["北京"])
        w0 = params["w0"]

        mu_z = self._get_height_factor(height)
        beta_z = self._get_wind_oscillation_factor(height)
        mu_s = shape_factor

        w_k = beta_z * mu_s * mu_z * w0

        results = {
            "所在地区": {"value": region, "unit": "", "is_text": True},
            "基本风压 w0": {"value": w0, "unit": "kN/m²"},
            "建筑高度 H": {"value": height, "unit": "m"},
            "体型系数 μs": {"value": mu_s, "unit": "-"},
            "高度变化系数 μz": {"value": round(mu_z, 4), "unit": "-"},
            "风振系数 βz": {"value": round(beta_z, 4), "unit": "-"},
            "风荷载标准值 wk": {"value": round(w_k, 4), "unit": "kN/m²"},
        }

        if self.db is not None:
            try:
                self._save_wind_to_db(building_name or "未命名建筑", region,
                                      height, shape_factor, w_k, results)
            except Exception as e:
                print(f"Warning: Failed to save wind load to db: {e}")

        return results

    def calculate_snow_load(self, region: str, roof_type: str = "平屋面(i≤5°)",
                            building_name: str = "") -> Dict:
        params = WIND_SNOW_PARAMS.get(region, WIND_SNOW_PARAMS["北京"])
        s0 = params["s0"]
        mu_r = ROOF_SNOW_FACTORS.get(roof_type, 1.0)

        s_k = mu_r * s0

        results = {
            "所在地区": {"value": region, "unit": "", "is_text": True},
            "雪压分区": {"value": params["snow_district"], "unit": "", "is_text": True},
            "基本雪压 s0": {"value": s0, "unit": "kN/m²"},
            "屋面类型": {"value": roof_type, "unit": "", "is_text": True},
            "积雪分布系数 μr": {"value": mu_r, "unit": "-"},
            "雪荷载标准值 sk": {"value": round(s_k, 4), "unit": "kN/m²"},
        }

        if self.db is not None:
            try:
                self._save_snow_to_db(building_name or "未命名建筑", region,
                                      roof_type, s_k, results)
            except Exception as e:
                print(f"Warning: Failed to save snow load to db: {e}")

        return results

    def _save_wind_to_db(self, building_name: str, region: str, height: float,
                         shape_factor: float, w_k: float, results: Dict):
        cursor = self.db.execute(
            """INSERT INTO buildings (name, building_type, floors, area, created_at, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (building_name, "风荷载计算", 1, 0.0)
        )
        building_id = cursor.lastrowid

        self.db.execute(
            """INSERT INTO load_cases (building_id, case_name, load_type, magnitude, unit, description, created_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (building_id, "风荷载标准值", "风荷载", w_k, "kN/m²",
             f"{region} 地区，高度 {height}m")
        )

        for name, data in results.items():
            val = data["value"]
            if isinstance(val, str):
                val = 0.0
            self.db.execute(
                """INSERT INTO calculation_results (building_id, result_name, result_value, result_unit, calculated_at)
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (building_id, name, val, data["unit"])
            )

    def _save_snow_to_db(self, building_name: str, region: str, roof_type: str,
                         s_k: float, results: Dict):
        cursor = self.db.execute(
            """INSERT INTO buildings (name, building_type, floors, area, created_at, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (building_name, "雪荷载计算", 1, 0.0)
        )
        building_id = cursor.lastrowid

        self.db.execute(
            """INSERT INTO load_cases (building_id, case_name, load_type, magnitude, unit, description, created_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (building_id, "雪荷载标准值", "雪荷载", s_k, "kN/m²",
             f"{region} 地区，{roof_type}")
        )

        for name, data in results.items():
            val = data["value"]
            if isinstance(val, str):
                val = 0.0
            self.db.execute(
                """INSERT INTO calculation_results (building_id, result_name, result_value, result_unit, calculated_at)
                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (building_id, name, val, data["unit"])
            )
