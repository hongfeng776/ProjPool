from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QGroupBox,
                             QLabel, QLineEdit, QComboBox, QDoubleSpinBox,
                             QPushButton, QFormLayout, QScrollArea, QFrame,
                             QProgressBar, QTextEdit)
from PyQt5.QtCore import Qt, pyqtSignal


class ParameterPanel(QWidget):
    calculate_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        
    def init_ui(self):
        main_layout = QVBoxLayout(self)
        
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setFrameShape(QFrame.NoFrame)
        
        scroll_content = QWidget()
        scroll_layout = QVBoxLayout(scroll_content)
        
        scroll_layout.addWidget(self.create_material_group())
        scroll_layout.addWidget(self.create_load_group())
        scroll_layout.addWidget(self.create_boundary_group())
        scroll_layout.addWidget(self.create_mesh_group())
        
        scroll_layout.addStretch()
        
        scroll_area.setWidget(scroll_content)
        main_layout.addWidget(scroll_area)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)
        
        button_layout = QHBoxLayout()
        
        self.reset_btn = QPushButton("重置参数")
        self.reset_btn.clicked.connect(self.reset_parameters)
        button_layout.addWidget(self.reset_btn)
        
        self.calculate_btn = QPushButton("开始计算")
        self.calculate_btn.setStyleSheet("background-color: #4CAF50; color: white; font-weight: bold;")
        self.calculate_btn.setMinimumHeight(40)
        self.calculate_btn.clicked.connect(self.on_calculate_clicked)
        button_layout.addWidget(self.calculate_btn)
        
        main_layout.addLayout(button_layout)
        
        main_layout.addWidget(self.create_results_group())
        
    def create_material_group(self):
        group = QGroupBox("材料参数")
        layout = QFormLayout(group)
        
        self.material_type = QComboBox()
        self.material_type.addItems(["结构钢", "铝合金", "不锈钢", "钛合金", "自定义"])
        self.material_type.currentTextChanged.connect(self.on_material_changed)
        layout.addRow("材料类型:", self.material_type)
        
        self.youngs_modulus = QDoubleSpinBox()
        self.youngs_modulus.setRange(1e3, 1e6)
        self.youngs_modulus.setValue(206000)
        self.youngs_modulus.setSuffix(" MPa")
        self.youngs_modulus.setDecimals(2)
        layout.addRow("弹性模量:", self.youngs_modulus)
        
        self.poisson_ratio = QDoubleSpinBox()
        self.poisson_ratio.setRange(0.0, 0.5)
        self.poisson_ratio.setValue(0.3)
        self.poisson_ratio.setDecimals(3)
        layout.addRow("泊松比:", self.poisson_ratio)
        
        self.density = QDoubleSpinBox()
        self.density.setRange(100, 20000)
        self.density.setValue(7850)
        self.density.setSuffix(" kg/m³")
        layout.addRow("密度:", self.density)
        
        self.yield_strength = QDoubleSpinBox()
        self.yield_strength.setRange(10, 5000)
        self.yield_strength.setValue(250)
        self.yield_strength.setSuffix(" MPa")
        layout.addRow("屈服强度:", self.yield_strength)
        
        return group
    
    def create_load_group(self):
        group = QGroupBox("载荷参数")
        layout = QFormLayout(group)
        
        self.load_type = QComboBox()
        self.load_type.addItems(["集中力", "均布压力", "力矩", "重力", "温度载荷"])
        layout.addRow("载荷类型:", self.load_type)
        
        self.load_magnitude = QDoubleSpinBox()
        self.load_magnitude.setRange(-1e9, 1e9)
        self.load_magnitude.setValue(1000)
        self.load_magnitude.setSuffix(" N")
        layout.addRow("载荷大小:", self.load_magnitude)
        
        self.load_direction_x = QDoubleSpinBox()
        self.load_direction_x.setRange(-1, 1)
        self.load_direction_x.setValue(0)
        self.load_direction_x.setSingleStep(0.1)
        layout.addRow("方向 X:", self.load_direction_x)
        
        self.load_direction_y = QDoubleSpinBox()
        self.load_direction_y.setRange(-1, 1)
        self.load_direction_y.setValue(0)
        self.load_direction_y.setSingleStep(0.1)
        layout.addRow("方向 Y:", self.load_direction_y)
        
        self.load_direction_z = QDoubleSpinBox()
        self.load_direction_z.setRange(-1, 1)
        self.load_direction_z.setValue(-1)
        self.load_direction_z.setSingleStep(0.1)
        layout.addRow("方向 Z:", self.load_direction_z)
        
        return group
    
    def create_boundary_group(self):
        group = QGroupBox("边界条件")
        layout = QFormLayout(group)
        
        self.boundary_type = QComboBox()
        self.boundary_type.addItems(["固定约束", "铰接约束", "滑动约束", "对称约束", "自由"])
        layout.addRow("约束类型:", self.boundary_type)
        
        self.fix_x = QComboBox()
        self.fix_x.addItems(["自由", "固定"])
        self.fix_x.setCurrentIndex(1)
        layout.addRow("X方向:", self.fix_x)
        
        self.fix_y = QComboBox()
        self.fix_y.addItems(["自由", "固定"])
        self.fix_y.setCurrentIndex(1)
        layout.addRow("Y方向:", self.fix_y)
        
        self.fix_z = QComboBox()
        self.fix_z.addItems(["自由", "固定"])
        self.fix_z.setCurrentIndex(1)
        layout.addRow("Z方向:", self.fix_z)
        
        self.rot_x = QComboBox()
        self.rot_x.addItems(["自由", "固定"])
        layout.addRow("绕X旋转:", self.rot_x)
        
        self.rot_y = QComboBox()
        self.rot_y.addItems(["自由", "固定"])
        layout.addRow("绕Y旋转:", self.rot_y)
        
        self.rot_z = QComboBox()
        self.rot_z.addItems(["自由", "固定"])
        layout.addRow("绕Z旋转:", self.rot_z)
        
        return group
    
    def create_mesh_group(self):
        group = QGroupBox("网格设置")
        layout = QFormLayout(group)
        
        self.mesh_type = QComboBox()
        self.mesh_type.addItems(["四面体", "六面体", "混合网格"])
        layout.addRow("单元类型:", self.mesh_type)
        
        self.element_size = QDoubleSpinBox()
        self.element_size.setRange(0.1, 1000)
        self.element_size.setValue(10)
        self.element_size.setSuffix(" mm")
        layout.addRow("单元尺寸:", self.element_size)
        
        self.mesh_density = QComboBox()
        self.mesh_density.addItems(["粗糙", "中等", "精细", "极精细"])
        self.mesh_density.setCurrentIndex(1)
        layout.addRow("网格密度:", self.mesh_density)
        
        return group
        
    def create_results_group(self):
        group = QGroupBox("计算结果")
        layout = QVBoxLayout(group)
        
        self.results_text = QTextEdit()
        self.results_text.setReadOnly(True)
        self.results_text.setMaximumHeight(150)
        self.results_text.setPlaceholderText("计算完成后，结果将在此显示...")
        layout.addWidget(self.results_text)
        
        return group
    
    def on_material_changed(self, material):
        material_props = {
            "结构钢": {"E": 206000, "nu": 0.3, "rho": 7850, "yield": 250},
            "铝合金": {"E": 70000, "nu": 0.33, "rho": 2700, "yield": 276},
            "不锈钢": {"E": 193000, "nu": 0.31, "rho": 7930, "yield": 207},
            "钛合金": {"E": 110000, "nu": 0.34, "rho": 4500, "yield": 860},
        }
        
        if material in material_props:
            props = material_props[material]
            self.youngs_modulus.setValue(props["E"])
            self.poisson_ratio.setValue(props["nu"])
            self.density.setValue(props["rho"])
            self.yield_strength.setValue(props["yield"])
    
    def reset_parameters(self):
        self.material_type.setCurrentIndex(0)
        self.youngs_modulus.setValue(206000)
        self.poisson_ratio.setValue(0.3)
        self.density.setValue(7850)
        self.yield_strength.setValue(250)
        
        self.load_type.setCurrentIndex(0)
        self.load_magnitude.setValue(1000)
        self.load_direction_x.setValue(0)
        self.load_direction_y.setValue(0)
        self.load_direction_z.setValue(-1)
        
        self.boundary_type.setCurrentIndex(0)
        self.fix_x.setCurrentIndex(1)
        self.fix_y.setCurrentIndex(1)
        self.fix_z.setCurrentIndex(1)
        self.rot_x.setCurrentIndex(0)
        self.rot_y.setCurrentIndex(0)
        self.rot_z.setCurrentIndex(0)
        
        self.mesh_type.setCurrentIndex(0)
        self.element_size.setValue(10)
        self.mesh_density.setCurrentIndex(1)
        
        self.results_text.clear()
    
    def on_calculate_clicked(self):
        self.calculate_clicked.emit()
        
    def set_calculating(self, calculating: bool):
        if calculating:
            self.calculate_btn.setEnabled(False)
            self.calculate_btn.setText("计算中...")
            self.progress_bar.setVisible(True)
            self.progress_bar.setRange(0, 0)
        else:
            self.calculate_btn.setEnabled(True)
            self.calculate_btn.setText("开始计算")
            self.progress_bar.setVisible(False)
            
    def update_results(self, results_summary: dict):
        if not results_summary:
            self.results_text.setText("无计算结果")
            return
            
        text = "=== 计算结果 ===\n\n"
        
        if "max_von_mises" in results_summary:
            text += f"最大冯·米塞斯应力: {results_summary['max_von_mises']:.2e} Pa\n"
        
        if "min_von_mises" in results_summary:
            text += f"最小冯·米塞斯应力: {results_summary['min_von_mises']:.2e} Pa\n"
            
        if "mean_stress" in results_summary:
            text += f"平均应力: {results_summary['mean_stress']:.2e} Pa\n"
            
        if "max_displacement" in results_summary:
            text += f"最大位移: {results_summary['max_displacement']:.2e} m\n"
            
        if "yield_strength" in results_summary:
            text += f"材料屈服强度: {results_summary['yield_strength']:.2e} Pa\n"
            
        if "safety_factor" in results_summary:
            sf = results_summary['safety_factor']
            if sf == float('inf'):
                text += "\n安全系数: ∞ (零应力)\n"
            else:
                text += f"\n安全系数: {sf:.2f}\n"
                if sf < 1.0:
                    text += "⚠ 警告: 安全系数小于1，可能发生破坏！\n"
                elif sf < 1.5:
                    text += "⚠ 注意: 安全系数较低，建议优化设计\n"
                else:
                    text += "✓ 安全系数符合要求\n"
        
        self.results_text.setText(text)
    
    def get_parameters(self):
        return {
            "material": {
                "type": self.material_type.currentText(),
                "youngs_modulus": self.youngs_modulus.value() * 1e6,
                "poisson_ratio": self.poisson_ratio.value(),
                "density": self.density.value(),
                "yield_strength": self.yield_strength.value() * 1e6
            },
            "load": {
                "type": self.load_type.currentText(),
                "magnitude": self.load_magnitude.value(),
                "direction": [
                    self.load_direction_x.value(),
                    self.load_direction_y.value(),
                    self.load_direction_z.value()
                ]
            },
            "boundary": {
                "type": self.boundary_type.currentText(),
                "fix_x": (self.fix_x.currentText() == "固定"),
                "fix_y": (self.fix_y.currentText() == "固定"),
                "fix_z": (self.fix_z.currentText() == "固定"),
                "rot_x": (self.rot_x.currentText() == "固定"),
                "rot_y": (self.rot_y.currentText() == "固定"),
                "rot_z": (self.rot_z.currentText() == "固定")
            },
            "mesh": {
                "type": self.mesh_type.currentText(),
                "element_size": self.element_size.value(),
                "density": self.mesh_density.currentText()
            }
        }
