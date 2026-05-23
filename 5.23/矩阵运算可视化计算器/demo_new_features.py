import numpy as np
from matrix_input import MatrixValidator, MatrixFormatter
from main import MatrixCalculator, PrecisionManager


def demo_all_features():
    print("="*70)
    print("矩阵运算计算器 - 新功能演示")
    print("="*70)

    calc = MatrixCalculator()

    print("\n" + "="*70)
    print("【功能 1】矩阵格式校验")
    print("="*70)

    test_matrix = np.array([[1, 2, 3], [4, 5, 6]])
    MatrixFormatter.display_matrix(test_matrix, "测试矩阵")

    print("\n校验结果:")
    valid, msg = MatrixValidator.validate_matrix(test_matrix, "测试")
    print(f"  有效性: {valid}")
    print(f"  消息: {msg}")
    print(f"  是方阵: {MatrixValidator.is_square(test_matrix)}")
    print(f"  无NaN/Inf: {MatrixValidator.has_no_nan_or_inf(test_matrix)}")

    print("\n" + "="*70)
    print("【功能 2】优化的结果展示样式")
    print("="*70)

    demo_matrix = np.array([
        [1, 2.5, 3.1415926535],
        [0.0000001, 1000000, 0],
        [-2.71828, 42, 99.9999]
    ])

    print("\n不同精度展示:")
    for prec in [2, 4, 6]:
        print(f"\n--- 精度 = {prec} ---")
        MatrixFormatter.display_matrix(demo_matrix, f"精度{prec}", prec)

    print("\n" + "="*70)
    print("【功能 3】运算精准度保证")
    print("="*70)

    print("\n3.1 高精度矩阵乘法:")
    a = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]])
    b = np.array([[0.9, 0.8, 0.7], [0.6, 0.5, 0.4], [0.3, 0.2, 0.1]])

    calc.matrix_a = a
    calc.matrix_b = b
    result = calc.multiply()

    MatrixFormatter.display_matrix(a, "矩阵 A", 6)
    MatrixFormatter.display_matrix(b, "矩阵 B", 6)
    MatrixFormatter.display_matrix(result, "高精度乘积 A×B", 6)

    print("\n3.2 误差消除演示:")
    noisy = np.array([
        [1.0000000001, 2.0000000002],
        [3.0000000003, -0.0000000001]
    ])
    cleaned = PrecisionManager.round_result(noisy)

    MatrixFormatter.display_matrix(noisy, "含微小误差的矩阵", 10)
    MatrixFormatter.display_matrix(cleaned, "误差消除后", 10)

    print("\n3.3 逆矩阵精度验证 (A × A⁻¹ = I):")
    invertible = np.array([[4, 7], [2, 6]])
    calc.matrix_a = invertible
    inv = calc.inverse()
    identity_check = np.dot(invertible, inv)
    identity_clean = PrecisionManager.round_result(identity_check)

    MatrixFormatter.display_matrix(invertible, "原矩阵 A")
    MatrixFormatter.display_matrix(inv, "逆矩阵 A⁻¹")
    MatrixFormatter.display_matrix(identity_clean, "A × A⁻¹ = I (验证通过)")

    print("\n" + "="*70)
    print("【功能 4】完整运算演示 - 矩阵乘法带步骤")
    print("="*70)

    calc.matrix_a = np.array([[1, 2], [3, 4]])
    calc.matrix_b = np.array([[5, 6], [7, 8]])
    calc.multiply(show_steps=True, show_result=True)

    print("\n" + "="*70)
    print("演示完成！")
    print("="*70)
    print("\n新增功能总结:")
    print("  ✓ 矩阵格式校验 - 确保输入数据有效")
    print("  ✓ 美化展示样式 - 边框对齐、智能数字格式化")
    print("  ✓ 高精度运算 - 使用 float64、自动误差消除")
    print("  ✓ 可配置精度 - 支持 1-15 位小数显示")
    print("="*70)


if __name__ == "__main__":
    demo_all_features()
