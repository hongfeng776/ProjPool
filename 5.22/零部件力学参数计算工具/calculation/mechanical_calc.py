import math


class MechanicalCalculator:
    def __init__(self):
        self.elastic_modulus = 206
        self.yield_strength = 235
        self.tensile_strength = 460
        
        self.material_db = {
            "Q235": {"elastic_modulus": 206, "yield_strength": 235, "tensile_strength": 460},
            "Q345": {"elastic_modulus": 206, "yield_strength": 345, "tensile_strength": 510},
            "45钢": {"elastic_modulus": 209, "yield_strength": 355, "tensile_strength": 600},
            "40Cr": {"elastic_modulus": 206, "yield_strength": 785, "tensile_strength": 980},
            "不锈钢304": {"elastic_modulus": 193, "yield_strength": 205, "tensile_strength": 520}
        }
        
        self.validation_rules = {
            "length": {"min": 0.1, "max": 10000, "unit": "mm"},
            "width": {"min": 0.1, "max": 5000, "unit": "mm"},
            "height": {"min": 0.1, "max": 5000, "unit": "mm"},
            "force": {"min": 0.1, "max": 1e8, "unit": "N"},
            "stress": {"min": 0, "max": 2000, "unit": "MPa"},
            "safety_factor": {"min": 0.5, "max": 100, "unit": ""}
        }

    def set_material(self, material_name):
        if material_name in self.material_db:
            mat = self.material_db[material_name]
            self.elastic_modulus = mat["elastic_modulus"]
            self.yield_strength = mat["yield_strength"]
            self.tensile_strength = mat["tensile_strength"]
            return True, f"已设置材料: {material_name}"
        return False, f"未找到材料: {material_name}"

    def validate_input(self, data):
        errors = []
        warnings = []
        
        for field, rules in self.validation_rules.items():
            if field in data and data[field] is not None:
                value = data[field]
                if value < rules["min"]:
                    errors.append(f"{field} 数值过小: {value} {rules['unit']}，最小值: {rules['min']}")
                elif value > rules["max"]:
                    errors.append(f"{field} 数值过大: {value} {rules['unit']}，最大值: {rules['max']}")
        
        if data.get("width") and data.get("height"):
            aspect_ratio = max(data["width"], data["height"]) / min(data["width"], data["height"])
            if aspect_ratio > 50:
                warnings.append(f"截面长宽比过大 ({aspect_ratio:.1f})，可能产生翘曲变形")
        
        if data.get("force") and data.get("width") and data.get("height"):
            area = data["width"] * data["height"]
            estimated_stress = abs(data["force"]) / area * 1e6
            if estimated_stress > self.yield_strength:
                warnings.append(f"预估应力 ({estimated_stress:.1f} MPa) 超过屈服强度，可能发生塑性变形")
            elif estimated_stress > self.yield_strength * 0.8:
                warnings.append(f"预估应力接近屈服强度 ({estimated_stress:.1f} MPa)，安全余量不足")
        
        return {"is_valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def calculate_cross_sectional_area(self, width, height):
        if width is None or height is None:
            return None, "缺少尺寸参数"
        if width <= 0 or height <= 0:
            return None, "尺寸参数必须为正值"
        return width * height, None

    def calculate_tensile_stress(self, force, cross_sectional_area):
        if force is None:
            return None, "缺少受力参数"
        if cross_sectional_area is None or cross_sectional_area <= 0:
            return None, "横截面积无效"
        force_n = abs(force)
        area_m2 = cross_sectional_area * 1e-6
        stress_pa = force_n / area_m2
        stress_mpa = stress_pa * 1e-6
        return round(stress_mpa, 4), None

    def calculate_compressive_stress(self, force, cross_sectional_area):
        return self.calculate_tensile_stress(force, cross_sectional_area)

    def calculate_shear_stress(self, force, cross_sectional_area):
        tensile_stress, error = self.calculate_tensile_stress(force, cross_sectional_area)
        if tensile_stress is None:
            return None, error
        return round(tensile_stress * 0.577, 4), None

    def calculate_axial_strain(self, stress_mpa, elastic_modulus_gpa=None):
        if stress_mpa is None:
            return None, "缺少应力数据"
        if elastic_modulus_gpa is None:
            elastic_modulus_gpa = self.elastic_modulus
        if elastic_modulus_gpa <= 0:
            return None, "弹性模量必须为正值"
        stress_gpa = stress_mpa / 1000
        strain = stress_gpa / elastic_modulus_gpa
        return round(strain, 6), None

    def calculate_elongation(self, strain, original_length):
        if strain is None:
            return None, "缺少应变数据"
        if original_length is None or original_length <= 0:
            return None, "原长无效"
        return round(strain * original_length, 4), None

    def calculate_safety_factor(self, stress_mpa, yield_strength_mpa=None):
        if stress_mpa is None or stress_mpa <= 0:
            return None, "应力数据无效"
        if yield_strength_mpa is None:
            yield_strength_mpa = self.yield_strength
        if yield_strength_mpa <= 0:
            return None, "屈服强度必须为正值"
        return round(yield_strength_mpa / stress_mpa, 4), None

    def validate_results(self, results):
        validation = {
            "is_valid": True,
            "warnings": [],
            "errors": []
        }
        
        stress = results.get("tensile_stress")
        if stress is not None:
            if stress > self.yield_strength:
                validation["errors"].append(f"拉伸应力 ({stress:.2f} MPa) 超过屈服强度 ({self.yield_strength} MPa)，材料将发生屈服！")
                validation["is_valid"] = False
            elif stress > self.yield_strength * 0.9:
                validation["warnings"].append(f"拉伸应力 ({stress:.2f} MPa) 接近屈服强度，安全余量不足")
        
        safety_factor = results.get("safety_factor")
        if safety_factor is not None:
            if safety_factor < 1.0:
                validation["errors"].append(f"安全系数 ({safety_factor:.3f}) 小于 1，存在失效风险！")
                validation["is_valid"] = False
            elif safety_factor < 1.5:
                validation["warnings"].append(f"安全系数 ({safety_factor:.3f}) 偏低，建议增加安全余量")
        
        elongation = results.get("elongation")
        length = results.get("input_data", {}).get("length")
        if elongation is not None and length and length > 0:
            elongation_rate = elongation / length
            if elongation_rate > 0.001:
                validation["warnings"].append(f"变形量较大，伸长率为 {elongation_rate*100:.3f}%")
        
        return validation

    def calculate_all(self, data, material="Q235"):
        self.set_material(material)
        
        input_validation = self.validate_input(data)
        if not input_validation["is_valid"]:
            return {
                "success": False,
                "errors": input_validation["errors"],
                "warnings": input_validation["warnings"],
                "results": {}
            }
        
        length = data.get("length")
        width = data.get("width")
        height = data.get("height")
        force = data.get("force")
        
        cross_sectional_area, area_error = self.calculate_cross_sectional_area(width, height)
        tensile_stress, stress_error = self.calculate_tensile_stress(force, cross_sectional_area)
        compressive_stress, _ = self.calculate_compressive_stress(force, cross_sectional_area)
        shear_stress, _ = self.calculate_shear_stress(force, cross_sectional_area)
        axial_strain, strain_error = self.calculate_axial_strain(tensile_stress)
        elongation, elong_error = self.calculate_elongation(axial_strain, length)
        safety_factor, sf_error = self.calculate_safety_factor(tensile_stress)
        
        errors = []
        if area_error: errors.append(area_error)
        if stress_error: errors.append(stress_error)
        if strain_error: errors.append(strain_error)
        if elong_error: errors.append(elong_error)
        if sf_error: errors.append(sf_error)
        
        results = {
            "material": material,
            "elastic_modulus": self.elastic_modulus,
            "yield_strength": self.yield_strength,
            "cross_sectional_area": round(cross_sectional_area, 4) if cross_sectional_area else None,
            "tensile_stress": tensile_stress,
            "compressive_stress": compressive_stress,
            "shear_stress": shear_stress,
            "axial_strain": axial_strain,
            "elongation": elongation,
            "safety_factor": safety_factor,
            "area_unit": "mm²",
            "stress_unit": "MPa",
            "strain_unit": "mm/mm",
            "elongation_unit": "mm"
        }
        
        result_validation = self.validate_results({**results, "input_data": data})
        
        return {
            "success": len(errors) == 0,
            "errors": errors,
            "warnings": input_validation["warnings"] + result_validation["warnings"],
            "result_validation": result_validation,
            "results": results
        }
