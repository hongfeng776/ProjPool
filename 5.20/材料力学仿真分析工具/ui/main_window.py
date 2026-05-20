from PyQt5.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QSplitter, QTabWidget, QMenuBar, QMenu, QAction,
                             QStatusBar, QFileDialog, QMessageBox)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
from PyQt5.QtGui import QIcon

from ui.parameter_panel import ParameterPanel
from ui.model_viewer import ModelViewer
from core.model_importer import ModelImporter
from core.fea_solver import SimpleFEASolver


class CalculationThread(QThread):
    finished = pyqtSignal(object)
    error = pyqtSignal(str)
    
    def __init__(self, solver, polydata):
        super().__init__()
        self.solver = solver
        self.polydata = polydata
        
    def run(self):
        try:
            results = self.solver.solve(self.polydata)
            self.finished.emit(results)
        except Exception as e:
            self.error.emit(str(e))


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.model_importer = ModelImporter()
        self.fea_solver = SimpleFEASolver()
        self.current_model = None
        self.current_results = None
        self.calc_thread = None
        self.model_viewer = None
        self.parameter_panel = None
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle("材料力学仿真分析工具")
        self.setGeometry(100, 100, 1600, 1000)
        
        self.create_central_widget()
        self.create_menu_bar()
        self.create_status_bar()
        
        self.parameter_panel.calculate_clicked.connect(self.start_calculation)
        
    def create_menu_bar(self):
        menubar = self.menuBar()
        
        file_menu = menubar.addMenu("文件")
        
        import_action = QAction("导入模型", self)
        import_action.setShortcut("Ctrl+I")
        import_action.triggered.connect(self.import_model)
        file_menu.addAction(import_action)
        
        save_action = QAction("保存项目", self)
        save_action.setShortcut("Ctrl+S")
        file_menu.addAction(save_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("退出", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        view_menu = menubar.addMenu("视图")
        
        reset_view_action = QAction("重置视图", self)
        reset_view_action.triggered.connect(self.reset_view)
        view_menu.addAction(reset_view_action)
        
        fit_view_action = QAction("适应窗口", self)
        fit_view_action.triggered.connect(self.fit_view)
        view_menu.addAction(fit_view_action)
        
        wireframe_action = QAction("线框模式", self)
        wireframe_action.setCheckable(True)
        wireframe_action.triggered.connect(self.toggle_wireframe)
        view_menu.addAction(wireframe_action)
        
        help_menu = menubar.addMenu("帮助")
        
        about_action = QAction("关于", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
        
    def create_central_widget(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        
        splitter = QSplitter(Qt.Horizontal)
        
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        self.tab_widget = QTabWidget()
        self.parameter_panel = ParameterPanel()
        self.tab_widget.addTab(self.parameter_panel, "参数设置")
        
        left_layout.addWidget(self.tab_widget)
        
        self.model_viewer = ModelViewer()
        
        splitter.addWidget(left_panel)
        splitter.addWidget(self.model_viewer)
        splitter.setStretchFactor(0, 1)
        splitter.setStretchFactor(1, 3)
        
        main_layout.addWidget(splitter)
        
    def create_status_bar(self):
        self.statusBar().showMessage("就绪")
        
    def reset_view(self):
        if self.model_viewer:
            self.model_viewer.reset_camera()
            
    def fit_view(self):
        if self.model_viewer:
            self.model_viewer.fit_to_window()
        
    def import_model(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "导入模型",
            "",
            "模型文件 (*.stl *.step *.stp *.obj *.ply *.vtk *.vtp);;所有文件 (*.*)"
        )
        
        if file_path:
            try:
                self.statusBar().showMessage(f"正在导入: {file_path}")
                self.current_model = self.model_importer.import_model(file_path)
                
                if self.current_model:
                    self.model_viewer.load_model(self.current_model)
                    self.statusBar().showMessage(f"成功导入: {file_path}")
                    QMessageBox.information(self, "成功", "模型导入成功！\n\n现在可以设置参数并点击'开始计算'进行应力分析。")
                else:
                    QMessageBox.warning(self, "警告", "模型导入失败，请检查文件格式！")
                    self.statusBar().showMessage("导入失败")
                    
            except Exception as e:
                QMessageBox.critical(self, "错误", f"导入时发生错误: {str(e)}")
                self.statusBar().showMessage("导入出错")
                
    def start_calculation(self):
        if self.current_model is None:
            reply = QMessageBox.question(
                self, 
                "提示", 
                "尚未导入模型，是否使用默认的示例模型进行计算？",
                QMessageBox.Yes | QMessageBox.No
            )
            
            if reply == QMessageBox.Yes:
                self.current_model = self.model_importer.create_sample_model()
                self.model_viewer.load_model(self.current_model)
            else:
                return
                
        self.parameter_panel.set_calculating(True)
        self.statusBar().showMessage("正在进行有限元计算...")
        
        params = self.parameter_panel.get_parameters()
        
        self.fea_solver.set_material(
            E=params["material"]["youngs_modulus"],
            nu=params["material"]["poisson_ratio"],
            rho=params["material"]["density"]
        )
        
        self.fea_solver.set_load(
            magnitude=params["load"]["magnitude"],
            direction=params["load"]["direction"]
        )
        
        self.fea_solver.set_boundary(
            fix_x=(params["boundary"]["fix_x"] == "固定"),
            fix_y=(params["boundary"]["fix_y"] == "固定"),
            fix_z=(params["boundary"]["fix_z"] == "固定")
        )
        
        self.calc_thread = CalculationThread(self.fea_solver, self.current_model)
        self.calc_thread.finished.connect(self.on_calculation_finished)
        self.calc_thread.error.connect(self.on_calculation_error)
        self.calc_thread.start()
        
    def on_calculation_finished(self, results):
        self.current_results = results
        self.parameter_panel.set_calculating(False)
        
        summary = self.fea_solver.get_results_summary()
        self.parameter_panel.update_results(summary)
        
        self.model_viewer.display_results(results, "von_mises")
        self.model_viewer.result_type_combo.setCurrentIndex(1)
        
        self.statusBar().showMessage("计算完成")
        QMessageBox.information(self, "成功", "有限元计算完成！\n\n在视图中可以查看应力云图，切换不同的显示类型观察结果。")
        
    def on_calculation_error(self, error_msg):
        self.parameter_panel.set_calculating(False)
        self.statusBar().showMessage("计算出错")
        QMessageBox.critical(self, "错误", f"计算时发生错误: {error_msg}")
        
    def toggle_wireframe(self, checked):
        if self.model_viewer:
            self.model_viewer.wireframe_btn.setChecked(checked)
            self.model_viewer.toggle_wireframe(checked)
        
    def show_about(self):
        QMessageBox.about(
            self,
            "关于",
            "材料力学仿真分析工具 v1.0\n\n"
            "功能特性：\n"
            "- 支持多种CAD模型格式导入\n"
            "- 材料参数、载荷、边界条件设置\n"
            "- 有限元应力应变计算\n"
            "- 3D可视化与云图显示\n"
            "- 结果统计与安全系数评估\n\n"
            "使用方法：\n"
            "1. 导入或创建3D模型\n"
            "2. 设置材料、载荷、边界条件\n"
            "3. 点击'开始计算'进行分析\n"
            "4. 在视图中查看应力云图等结果"
        )
