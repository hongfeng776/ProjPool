from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QComboBox, QGroupBox)
from PyQt5.QtCore import Qt
import vtk
from vtk.qt.QVTKRenderWindowInteractor import QVTKRenderWindowInteractor
import numpy as np


class ModelViewer(QWidget):
    def __init__(self):
        super().__init__()
        self.current_actor = None
        self.scalar_bar_actor = None
        self.current_polydata = None
        self.current_results = None
        self.display_mode = "solid"
        self.lut = None
        self.init_ui()
        self.init_vtk()
        
    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        
        toolbar = QHBoxLayout()
        toolbar.setSpacing(5)
        
        self.reset_cam_btn = QPushButton("重置视角")
        self.reset_cam_btn.clicked.connect(self.reset_camera)
        toolbar.addWidget(self.reset_cam_btn)
        
        self.fit_btn = QPushButton("适应窗口")
        self.fit_btn.clicked.connect(self.fit_to_window)
        toolbar.addWidget(self.fit_btn)
        
        self.wireframe_btn = QPushButton("线框模式")
        self.wireframe_btn.setCheckable(True)
        self.wireframe_btn.clicked.connect(self.toggle_wireframe)
        toolbar.addWidget(self.wireframe_btn)
        
        self.axes_btn = QPushButton("显示坐标轴")
        self.axes_btn.setCheckable(True)
        self.axes_btn.setChecked(True)
        self.axes_btn.clicked.connect(self.toggle_axes)
        toolbar.addWidget(self.axes_btn)
        
        toolbar.addStretch()
        
        result_group = QGroupBox("结果显示")
        result_layout = QHBoxLayout(result_group)
        result_layout.setContentsMargins(5, 2, 5, 2)
        result_layout.setSpacing(5)
        
        result_layout.addWidget(QLabel("类型:"))
        self.result_type_combo = QComboBox()
        self.result_type_combo.addItems([
            "无", "冯·米塞斯应力", "位移", "第一主应力", 
            "第二主应力", "第三主应力", "X方向应力", "Y方向应力", "Z方向应力"
        ])
        self.result_type_combo.setCurrentIndex(0)
        self.result_type_combo.currentIndexChanged.connect(self.on_result_type_changed)
        result_layout.addWidget(self.result_type_combo)
        
        result_layout.addWidget(QLabel("色图:"))
        self.color_map_combo = QComboBox()
        self.color_map_combo.addItems(["彩虹色", "蓝-红", "灰度", "热图", "冷图"])
        self.color_map_combo.setCurrentIndex(0)
        self.color_map_combo.currentIndexChanged.connect(self.on_colormap_changed)
        result_layout.addWidget(self.color_map_combo)
        
        toolbar.addWidget(result_group)
        
        toolbar.addStretch()
        
        self.info_label = QLabel("模型信息: 无")
        toolbar.addWidget(self.info_label)
        
        main_layout.addLayout(toolbar)
        
        self.vtk_widget = QVTKRenderWindowInteractor(self)
        main_layout.addWidget(self.vtk_widget)
        
        self.stats_label = QLabel("结果统计: 无计算结果")
        self.stats_label.setStyleSheet("color: #666; padding: 5px; background-color: #f5f5f5;")
        main_layout.addWidget(self.stats_label)
        
    def init_vtk(self):
        self.renderer = vtk.vtkRenderer()
        self.renderer.SetBackground(0.95, 0.95, 0.95)
        
        self.vtk_widget.GetRenderWindow().AddRenderer(self.renderer)
        self.interactor = self.vtk_widget.GetRenderWindow().GetInteractor()
        
        self.create_axes()
        self.create_scalar_bar()
        
        style = vtk.vtkInteractorStyleTrackballCamera()
        self.interactor.SetInteractorStyle(style)
        
        self.interactor.Initialize()
        
        self.add_default_scene()
        
    def create_axes(self):
        self.axes_actor = vtk.vtkAxesActor()
        self.axes_actor.SetTotalLength(1, 1, 1)
        self.axes_actor.SetShaftTypeToCylinder()
        self.axes_actor.SetXAxisLabelText("X")
        self.axes_actor.SetYAxisLabelText("Y")
        self.axes_actor.SetZAxisLabelText("Z")
        self.axes_actor.SetCylinderRadius(0.5 * self.axes_actor.GetCylinderRadius())
        self.axes_actor.SetConeRadius(1.025 * self.axes_actor.GetConeRadius())
        self.axes_actor.SetSphereRadius(1.5 * self.axes_actor.GetSphereRadius())
        
        self.axes_widget = vtk.vtkOrientationMarkerWidget()
        self.axes_widget.SetOrientationMarker(self.axes_actor)
        self.axes_widget.SetInteractor(self.interactor)
        self.axes_widget.SetViewport(0.0, 0.0, 0.25, 0.25)
        self.axes_widget.SetEnabled(1)
        self.axes_widget.InteractiveOff()
        
    def create_scalar_bar(self):
        self.scalar_bar_actor = vtk.vtkScalarBarActor()
        self.scalar_bar_actor.SetNumberOfLabels(8)
        self.scalar_bar_actor.SetLabelFormat("%.2e")
        self.scalar_bar_actor.SetPosition(0.88, 0.1)
        self.scalar_bar_actor.SetWidth(0.08)
        self.scalar_bar_actor.SetHeight(0.8)
        self.scalar_bar_actor.SetTitle("")
        self.scalar_bar_actor.GetLabelTextProperty().SetFontSize(10)
        self.scalar_bar_actor.GetTitleTextProperty().SetFontSize(12)
        self.scalar_bar_actor.VisibilityOff()
        
        self.renderer.AddActor(self.scalar_bar_actor)
        
    def get_lookup_table(self, colormap_type: str):
        lut = vtk.vtkLookupTable()
        lut.SetNumberOfTableValues(256)
        lut.Build()
        
        if colormap_type == "彩虹色":
            ctf = vtk.vtkColorTransferFunction()
            ctf.AddRGBPoint(0.0, 0.0, 0.0, 1.0)
            ctf.AddRGBPoint(0.2, 0.0, 1.0, 1.0)
            ctf.AddRGBPoint(0.5, 0.0, 1.0, 0.0)
            ctf.AddRGBPoint(0.8, 1.0, 1.0, 0.0)
            ctf.AddRGBPoint(1.0, 1.0, 0.0, 0.0)
            
            for i in range(256):
                x = i / 255.0
                color = ctf.GetColor(x)
                lut.SetTableValue(i, color[0], color[1], color[2], 1.0)
                
        elif colormap_type == "蓝-红":
            for i in range(256):
                x = i / 255.0
                lut.SetTableValue(i, x, 0.0, 1.0 - x, 1.0)
                
        elif colormap_type == "灰度":
            for i in range(256):
                x = i / 255.0
                lut.SetTableValue(i, x, x, x, 1.0)
                
        elif colormap_type == "热图":
            ctf = vtk.vtkColorTransferFunction()
            ctf.AddRGBPoint(0.0, 0.0, 0.0, 0.3)
            ctf.AddRGBPoint(0.3, 0.5, 0.0, 0.0)
            ctf.AddRGBPoint(0.6, 1.0, 0.5, 0.0)
            ctf.AddRGBPoint(1.0, 1.0, 1.0, 0.0)
            
            for i in range(256):
                x = i / 255.0
                color = ctf.GetColor(x)
                lut.SetTableValue(i, color[0], color[1], color[2], 1.0)
                
        elif colormap_type == "冷图":
            ctf = vtk.vtkColorTransferFunction()
            ctf.AddRGBPoint(0.0, 0.0, 0.0, 0.3)
            ctf.AddRGBPoint(0.5, 0.0, 0.5, 0.8)
            ctf.AddRGBPoint(1.0, 0.8, 0.9, 1.0)
            
            for i in range(256):
                x = i / 255.0
                color = ctf.GetColor(x)
                lut.SetTableValue(i, color[0], color[1], color[2], 1.0)
        
        return lut
        
    def add_default_scene(self):
        sphere = vtk.vtkSphereSource()
        sphere.SetRadius(1.0)
        sphere.SetPhiResolution(30)
        sphere.SetThetaResolution(30)
        
        mapper = vtk.vtkPolyDataMapper()
        mapper.SetInputConnection(sphere.GetOutputPort())
        
        actor = vtk.vtkActor()
        actor.SetMapper(mapper)
        actor.GetProperty().SetColor(0.5, 0.7, 0.9)
        actor.GetProperty().SetOpacity(0.8)
        
        self.renderer.AddActor(actor)
        self.default_actor = actor
        
        self.renderer.ResetCamera()
        
    def load_model(self, model_data):
        if self.default_actor:
            self.renderer.RemoveActor(self.default_actor)
            self.default_actor = None
        
        if self.current_actor:
            self.renderer.RemoveActor(self.current_actor)
        
        if isinstance(model_data, vtk.vtkPolyData):
            self.current_polydata = model_data
            
            mapper = vtk.vtkPolyDataMapper()
            mapper.SetInputData(model_data)
            mapper.ScalarVisibilityOff()
            
            self.current_actor = vtk.vtkActor()
            self.current_actor.SetMapper(mapper)
            self.current_actor.GetProperty().SetColor(0.8, 0.6, 0.4)
            self.current_actor.GetProperty().SetOpacity(0.9)
            self.current_actor.GetProperty().SetInterpolationToPhong()
            
            self.renderer.AddActor(self.current_actor)
            self.renderer.ResetCamera()
            
            num_cells = model_data.GetNumberOfCells()
            num_points = model_data.GetNumberOfPoints()
            self.info_label.setText(f"模型信息: {num_points} 顶点, {num_cells} 单元")
            
            self.vtk_widget.GetRenderWindow().Render()
        
    def display_results(self, results, result_type: str = "von_mises"):
        if not results or not results.is_valid():
            return
            
        self.current_results = results
        
        if self.current_polydata is None or self.current_actor is None:
            return
            
        polydata = self.current_polydata
        num_points = polydata.GetNumberOfPoints()
        
        scalars = vtk.vtkFloatArray()
        scalars.SetNumberOfComponents(1)
        scalars.SetNumberOfTuples(num_points)
        
        title = ""
        unit = ""
        data = None
        
        if result_type == "von_mises":
            data = results.von_mises_stress
            title = "冯·米塞斯应力"
            unit = "Pa"
        elif result_type == "displacement":
            data = results.nodal_displacements
            title = "位移"
            unit = "m"
        elif result_type == "principal_1":
            data = results.principal_stresses[:, 0]
            title = "第一主应力"
            unit = "Pa"
        elif result_type == "principal_2":
            data = results.principal_stresses[:, 1]
            title = "第二主应力"
            unit = "Pa"
        elif result_type == "principal_3":
            data = results.principal_stresses[:, 2]
            title = "第三主应力"
            unit = "Pa"
        elif result_type == "stress_x":
            data = results.nodal_stresses[:, 0]
            title = "X方向应力"
            unit = "Pa"
        elif result_type == "stress_y":
            data = results.nodal_stresses[:, 1]
            title = "Y方向应力"
            unit = "Pa"
        elif result_type == "stress_z":
            data = results.nodal_stresses[:, 2]
            title = "Z方向应力"
            unit = "Pa"
        else:
            self.clear_results_display()
            return
            
        if data is None or len(data) != num_points:
            return
            
        for i in range(num_points):
            scalars.SetValue(i, float(data[i]))
            
        polydata.GetPointData().SetScalars(scalars)
        polydata.GetPointData().SetActiveScalars("")
        
        mapper = self.current_actor.GetMapper()
        mapper.SetInputData(polydata)
        mapper.ScalarVisibilityOn()
        mapper.SetScalarModeToUsePointData()
        
        min_val = float(np.min(data))
        max_val = float(np.max(data))
        
        if abs(max_val - min_val) < 1e-10:
            max_val = min_val + 1.0
            
        mapper.SetScalarRange(min_val, max_val)
        
        colormap_name = self.color_map_combo.currentText()
        self.lut = self.get_lookup_table(colormap_name)
        self.lut.SetRange(min_val, max_val)
        
        mapper.SetLookupTable(self.lut)
        mapper.SetColorModeToMapScalars()
        mapper.SetScalarModeToUsePointData()
        
        self.scalar_bar_actor.SetLookupTable(self.lut)
        self.scalar_bar_actor.SetTitle(f"{title}\n({unit})")
        self.scalar_bar_actor.VisibilityOn()
        
        self.update_stats_display(data, title, unit)
        
        self.vtk_widget.GetRenderWindow().Render()
        
    def clear_results_display(self):
        if self.current_actor and self.current_polydata:
            self.current_polydata.GetPointData().SetScalars(None)
            mapper = self.current_actor.GetMapper()
            mapper.ScalarVisibilityOff()
            self.current_actor.GetProperty().SetColor(0.8, 0.6, 0.4)
            
        if self.scalar_bar_actor:
            self.scalar_bar_actor.VisibilityOff()
            
        self.stats_label.setText("结果统计: 无计算结果")
        self.vtk_widget.GetRenderWindow().Render()
        
    def update_stats_display(self, data, title: str, unit: str):
        max_val = np.max(data)
        min_val = np.min(data)
        mean_val = np.mean(data)
        std_val = np.std(data)
        
        stats_text = (f"{title}统计: 最大值={max_val:.2e} {unit}, "
                     f"最小值={min_val:.2e} {unit}, "
                     f"平均值={mean_val:.2e} {unit}")
        self.stats_label.setText(stats_text)
        
    def on_result_type_changed(self, index):
        type_map = {
            0: None,
            1: "von_mises",
            2: "displacement",
            3: "principal_1",
            4: "principal_2",
            5: "principal_3",
            6: "stress_x",
            7: "stress_y",
            8: "stress_z"
        }
        
        result_type = type_map.get(index)
        
        if result_type is None:
            self.clear_results_display()
        elif self.current_results:
            self.display_results(self.current_results, result_type)
            
    def on_colormap_changed(self, index):
        if self.current_results and self.result_type_combo.currentIndex() > 0:
            type_map = {
                1: "von_mises",
                2: "displacement",
                3: "principal_1",
                4: "principal_2",
                5: "principal_3",
                6: "stress_x",
                7: "stress_y",
                8: "stress_z"
            }
            result_type = type_map.get(self.result_type_combo.currentIndex())
            if result_type:
                self.display_results(self.current_results, result_type)
        
    def reset_camera(self):
        camera = self.renderer.GetActiveCamera()
        camera.SetPosition(1, 1, 1)
        camera.SetFocalPoint(0, 0, 0)
        camera.SetViewUp(0, 0, 1)
        self.renderer.ResetCamera()
        self.vtk_widget.GetRenderWindow().Render()
        
    def fit_to_window(self):
        self.renderer.ResetCamera()
        self.vtk_widget.GetRenderWindow().Render()
        
    def toggle_wireframe(self, checked):
        if self.current_actor:
            if checked:
                self.current_actor.GetProperty().SetRepresentationToWireframe()
            else:
                self.current_actor.GetProperty().SetRepresentationToSurface()
            self.vtk_widget.GetRenderWindow().Render()
            
    def toggle_axes(self, checked):
        self.axes_widget.SetEnabled(1 if checked else 0)
        self.vtk_widget.GetRenderWindow().Render()
