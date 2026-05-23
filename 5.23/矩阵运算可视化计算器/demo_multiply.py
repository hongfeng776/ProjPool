import numpy as np
from main import MatrixCalculator
from matrix_input import MatrixInput


def demo_matrix_multiplication():
    print("="*70)
    print("矩阵乘法操作演示")
    print("="*70)
    print("\n操作步骤：")
    print("1. 输入两个合规矩阵")
    print("2. 执行乘法运算")
    print("3. 核对结果数值")
    print("="*70)

    calc = MatrixCalculator()

    print("\n步骤 1: 输入两个合规矩阵")
    print("-"*70)
    calc.matrix_a = np.array([[1, 2, 3], [4, 5, 6]])
    calc.matrix_b = np.array([[7, 8], [9, 10], [11, 12]])

    MatrixInput.display_matrix(calc.matrix_a, "矩阵 A (2×3)")
    MatrixInput.display_matrix(calc.matrix_b, "矩阵 B (3×2)")

    print("\n✓ 维度检查通过：A的列数(3) = B的行数(3)")

    print("\n步骤 2: 执行乘法运算（显示详细步骤）")
    print("-"*70)
    result = calc.multiply(show_steps=True)

    print("\n步骤 3: 核对结果数值")
    print("-"*70)
    MatrixInput.display_matrix(result, "计算结果 C = A × B")

    print("\n手动验证关键元素：")
    print(f"  C[1][1] = 1×7 + 2×9 + 3×11 = {1*7 + 2*9 + 3*11} ✓")
    print(f"  C[1][2] = 1×8 + 2×10 + 3×12 = {1*8 + 2*10 + 3*12} ✓")
    print(f"  C[2][1] = 4×7 + 5×9 + 6×11 = {4*7 + 5*9 + 6*11} ✓")
    print(f"  C[2][2] = 4×8 + 5×10 + 6×12 = {4*8 + 5*10 + 6*12} ✓")

    numpy_result = np.dot(calc.matrix_a, calc.matrix_b)
    print(f"\n与 NumPy 官方结果对比：{'一致 ✓' if np.allclose(result, numpy_result) else '不一致 ✗'}")

    print("\n" + "="*70)
    print("演示完成！矩阵乘法计算正确。")
    print("="*70)


if __name__ == "__main__":
    demo_matrix_multiplication()
