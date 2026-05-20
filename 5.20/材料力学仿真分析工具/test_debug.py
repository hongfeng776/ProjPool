import sys

print("1. Testing basic imports...")
try:
    from PyQt5.QtWidgets import QApplication
    print("   ✓ PyQt5 imported successfully")
except Exception as e:
    print(f"   ✗ PyQt5 error: {e}")
    sys.exit(1)

print("2. Testing VTK import...")
try:
    import vtk
    print(f"   ✓ VTK imported successfully, version: {vtk.vtkVersion.GetVTKVersion()}")
except Exception as e:
    print(f"   ✗ VTK error: {e}")
    sys.exit(1)

print("3. Testing VTK Qt import...")
try:
    from vtk.qt.QVTKRenderWindowInteractor import QVTKRenderWindowInteractor
    print("   ✓ QVTKRenderWindowInteractor imported successfully")
except Exception as e:
    print(f"   ✗ VTK Qt error: {e}")
    sys.exit(1)

print("4. Testing core module imports...")
try:
    from core.model_importer import ModelImporter
    print("   ✓ ModelImporter imported successfully")
except Exception as e:
    print(f"   ✗ ModelImporter error: {e}")
    sys.exit(1)

try:
    from core.fea_solver import SimpleFEASolver
    print("   ✓ SimpleFEASolver imported successfully")
except Exception as e:
    print(f"   ✗ SimpleFEASolver error: {e}")
    sys.exit(1)

print("5. Testing UI module imports...")
try:
    from ui.model_viewer import ModelViewer
    print("   ✓ ModelViewer imported successfully")
except Exception as e:
    print(f"   ✗ ModelViewer error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from ui.parameter_panel import ParameterPanel
    print("   ✓ ParameterPanel imported successfully")
except Exception as e:
    print(f"   ✗ ParameterPanel error: {e}")
    sys.exit(1)

try:
    from ui.main_window import MainWindow
    print("   ✓ MainWindow imported successfully")
except Exception as e:
    print(f"   ✗ MainWindow error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n6. Creating test application...")
try:
    app = QApplication(sys.argv)
    print("   ✓ QApplication created")
    
    window = MainWindow()
    print("   ✓ MainWindow created")
    
    window.show()
    print("   ✓ MainWindow shown")
    
    print("\n✅ All tests passed! Closing application...")
    app.quit()
    
except Exception as e:
    print(f"   ✗ Application error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ Debug test completed successfully!")
