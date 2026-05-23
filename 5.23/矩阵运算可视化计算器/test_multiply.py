import numpy as np
from matrix_input import MatrixInput
from main import MatrixCalculator


def test_matrix_multiplication():
    print("="*70)
    print("矩阵乘法运算功能测试")
    print("="*70)

    calculator = MatrixCalculator()

    print("\n" + "="*70)
    print("测试 1：2×2 矩阵乘法（显示步骤）")
    print("="*70)

    calculator.matrix_a = np.array([
        [1, 2],
        [3, 4]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A (2×2)")

    calculator.matrix_b = np.array([
        [5, 6],
        [7, 8]
    ])
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B (2×2)")

    result = calculator.multiply(show_steps=True)
    MatrixInput.display_matrix(result, "最终结果 A × B")

    print("\n" + "="*70)
    print("测试 2：2×3 与 3×2 矩阵乘法")
    print("="*70)

    calculator.matrix_a = np.array([
        [1, 2, 3],
        [4, 5, 6]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A (2×3)")

    calculator.matrix_b = np.array([
        [7, 8],
        [9, 10],
        [11, 12]
    ])
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B (3×2)")

    result = calculator.multiply(show_steps=True)
    MatrixInput.display_matrix(result, "最终结果 A × B")

    print("\n" + "="*70)
    print("测试 3：维度不匹配测试")
    print("="*70)

    calculator.matrix_a = np.array([
        [1, 2, 3],
        [4, 5, 6]
    ])
    calculator.matrix_b = np.array([
        [1, 2],
        [3, 4]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A (2×3)")
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B (2×2)")

    result = calculator.multiply()
    if result is None:
        print("✓ 正确检测到维度不匹配（A的列数 != B的行数）")

    print("\n" + "="*70)
    print("测试 4：含浮点数的矩阵乘法")
    print("="*70)

    calculator.matrix_a = np.array([
        [1.5, 2.5],
        [3.5, 4.5]
    ])
    calculator.matrix_b = np.array([
        [2.0, 1.0],
        [1.0, 2.0]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A (浮点)")
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B (浮点)")

    result = calculator.multiply(show_steps=True)
    MatrixInput.display_matrix(result, "最终结果 A × B")

    print("\n" + "="*70)
    print("测试 5：与单位矩阵相乘（验证特性）")
    print("="*70)

    calculator.matrix_a = np.array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ])
    calculator.matrix_b = np.eye(3)
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A")
    MatrixInput.display_matrix(calculator.matrix_b, "单位矩阵 I")

    result = calculator.multiply(show_steps=False)
    MatrixInput.display_matrix(result, "A × I 结果（应等于A）")

    print("\n" + "="*70)
    print("所有测试完成！")
    print("="*70)


if __name__ == "__main__":
    test_matrix_multiplication()
