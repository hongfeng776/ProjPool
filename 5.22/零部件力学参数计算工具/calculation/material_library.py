class MaterialLibrary:
    MATERIALS = {
        "Q235钢": {
            "elastic_modulus": 206,
            "poisson_ratio": 0.3,
            "yield_strength": 235,
            "tensile_strength": 375,
            "shear_modulus": 79,
            "density": 7850,
            "description": "普通碳素结构钢"
        },
        "45号钢": {
            "elastic_modulus": 210,
            "poisson_ratio": 0.269,
            "yield_strength": 355,
            "tensile_strength": 600,
            "shear_modulus": 81,
            "density": 7850,
            "description": "优质碳素结构钢"
        },
        "40Cr": {
            "elastic_modulus": 206,
            "poisson_ratio": 0.277,
            "yield_strength": 785,
            "tensile_strength": 980,
            "shear_modulus": 79,
            "density": 7870,
            "description": "合金结构钢"
        },
        "304不锈钢": {
            "elastic_modulus": 193,
            "poisson_ratio": 0.29,
            "yield_strength": 205,
            "tensile_strength": 520,
            "shear_modulus": 75,
            "density": 7930,
            "description": "奥氏体不锈钢"
        },
        "铝合金6061": {
            "elastic_modulus": 69,
            "poisson_ratio": 0.33,
            "yield_strength": 276,
            "tensile_strength": 310,
            "shear_modulus": 26,
            "density": 2700,
            "description": "变形铝合金"
        },
        "铜合金": {
            "elastic_modulus": 110,
            "poisson_ratio": 0.34,
            "yield_strength": 170,
            "tensile_strength": 240,
            "shear_modulus": 42,
            "density": 8900,
            "description": "锡青铜"
        },
        "HT200铸铁": {
            "elastic_modulus": 120,
            "poisson_ratio": 0.25,
            "yield_strength": 200,
            "tensile_strength": 200,
            "shear_modulus": 45,
            "density": 7200,
            "description": "灰铸铁"
        }
    }

    @classmethod
    def get_material_names(cls):
        return list(cls.MATERIALS.keys())

    @classmethod
    def get_material_params(cls, material_name):
        return cls.MATERIALS.get(material_name, None)

    @classmethod
    def get_safety_factor_range(cls):
        return {
            "min": 1.2,
            "recommended": 2.0,
            "max": 5.0
        }

    @classmethod
    def validate_params(cls, data, material_name=None):
        errors = []
        warnings = []

        length = data.get("length")
        width = data.get("width")
        height = data.get("height")
        force = data.get("force")

        if length is not None:
            if length <= 0:
                errors.append(f"长度必须大于0，当前值: {length}")
            elif length > 10000:
                warnings.append(f"长度 {length}mm 超出常规范围，请确认")

        if width is not None:
            if width <= 0:
                errors.append(f"宽度必须大于0，当前值: {width}")
            elif width > 5000:
                warnings.append(f"宽度 {width}mm 超出常规范围，请确认")

        if height is not None:
            if height <= 0:
                errors.append(f"高度必须大于0，当前值: {height}")
            elif height > 5000:
                warnings.append(f"高度 {height}mm 超出常规范围，请确认")

        if force is not None:
            if force <= 0:
                errors.append(f"受力必须大于0，当前值: {force}")
            elif abs(force) > 1e7:
                warnings.append(f"受力 {force}N 超出常规范围，请确认")

        if length and width and height:
            if length < width or length < height:
                warnings.append("长度应大于等于宽度和高度，请确认尺寸定义")
            aspect_ratio = max(length, width, height) / min(length, width, height)
            if aspect_ratio > 100:
                warnings.append(f"长宽高比例过大 ({aspect_ratio:.1f})，可能为细长杆")

        return errors, warnings

    @classmethod
    def validate_results(cls, results, material_name="Q235钢"):
        validation = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "safety_level": ""
        }

        material = cls.get_material_params(material_name)
        if not material:
            validation["errors"].append(f"未知材料: {material_name}")
            validation["is_valid"] = False
            return validation

        yield_strength = material["yield_strength"]
        tensile_stress = results.get("tensile_stress")
        safety_factor = results.get("safety_factor")

        if tensile_stress is not None:
            if tensile_stress <= 0:
                validation["errors"].append("计算应力异常，请检查输入参数")
                validation["is_valid"] = False
            elif tensile_stress > yield_strength * 2:
                validation["warnings"].append(f"应力过大 ({tensile_stress:.2f}MPa)，远超屈服强度")
            elif tensile_stress > yield_strength:
                validation["warnings"].append(f"应力超过屈服强度，材料可能发生塑性变形")

        if safety_factor is not None:
            sf_range = cls.get_safety_factor_range()
            if safety_factor <= 0:
                validation["errors"].append("安全系数计算异常")
                validation["is_valid"] = False
            elif safety_factor < 1:
                validation["warnings"].append("安全系数小于1，存在失效风险！")
                validation["safety_level"] = "危险"
            elif safety_factor < sf_range["min"]:
                validation["warnings"].append(f"安全系数偏低 ({safety_factor:.3f})，建议≥{sf_range['min']}")
                validation["safety_level"] = "偏低"
            elif safety_factor < sf_range["recommended"]:
                validation["safety_level"] = "合格"
            elif safety_factor < sf_range["max"]:
                validation["safety_level"] = "良好"
            else:
                validation["warnings"].append(f"安全系数过高 ({safety_factor:.3f})，设计可能过于保守")
                validation["safety_level"] = "保守"

        return validation
