import sys
print("=== 测试计算和可视化功能 ===\n")

print("1. 测试FEA求解器...")
try:
    from core.fea_solver import SimpleFEASolver
    from core.model_importer import ModelImporter
    
    importer = ModelImporter()
    model = importer.create_sample_model()
    print(f"   ✓ 创建示例模型: {model.GetNumberOfPoints()} 个顶点, {model.GetNumberOfCells()} 个单元")
    
    solver = SimpleFEASolver()
    solver.set_material(E=206e9, nu=0.3, rho=7850, yield_strength=250e6)
    solver.set_load(magnitude=1000, direction=[0, 0, -1])
    solver.set_boundary(fix_x=True, fix_y=True, fix_z=True)
    print("   ✓ 设置材料、载荷和边界条件")
    
    results = solver.solve(model)
    print(f"   ✓ 计算完成:")
    print(f"     - 最大冯·米塞斯应力: {results.max_von_mises:.2e} Pa")
    print(f"     - 最小冯·米塞斯应力: {results.min_von_mises:.2e} Pa")
    print(f"     - 最大位移: {results.max_displacement:.2e} m")
    
    summary = solver.get_results_summary()
    print(f"     - 安全系数: {summary['safety_factor']:.2f}")
    
except Exception as e:
    print(f"   ✗ FEA求解器错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n2. 测试结果数据...")
try:
    print(f"   ✓ 应力张量形状: {results.nodal_stresses.shape}")
    print(f"   ✓ 应变张量形状: {results.nodal_strains.shape}")
    print(f"   ✓ 主应力形状: {results.principal_stresses.shape}")
    print(f"   ✓ 冯·米塞斯应力范围: [{min(results.von_mises_stress):.2e}, {max(results.von_mises_stress):.2e}] Pa")
    
except Exception as e:
    print(f"   ✗ 结果数据错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n3. 测试UI组件...")
try:
    from PyQt5.QtWidgets import QApplication
    from ui.model_viewer import ModelViewer
    
    app = QApplication.instance() or QApplication(sys.argv)
    
    viewer = ModelViewer()
    print("   ✓ ModelViewer创建成功")
    
    viewer.load_model(model)
    print("   ✓ 模型加载到Viewer成功")
    
    viewer.display_results(results, "von_mises")
    print("   ✓ 结果云图显示成功")
    
    viewer.display_results(results, "displacement")
    print("   ✓ 位移云图显示成功")
    
    viewer.display_results(results, "principal_1")
    print("   ✓ 主应力云图显示成功")
    
    viewer.clear_results_display()
    print("   ✓ 结果清除成功")
    
    app.quit()
    
except Exception as e:
    print(f"   ✗ UI测试错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ 所有计算和可视化测试通过！")
print("\n总结:")
print("- FEA求解器正常工作")
print("- 应力、应变、位移计算正常")
print("- 安全系数计算正常")
print("- 结果云图显示正常")
print("- 多种结果类型切换正常")
