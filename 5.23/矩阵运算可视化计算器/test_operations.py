import numpy as np
from matrix_input import MatrixInput
from main import MatrixCalculator


def test_matrix_operations():
    print("="*60)
    print("矩阵加法和减法功能测试")
    print("="*60)

    calculator = MatrixCalculator()

    calculator.matrix_a = np.array([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A")

    calculator.matrix_b = np.array([
        [9, 8, 7],
        [6, 5, 4],
        [3, 2, 1]
    ])
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B")

    print("\n" + "-"*60)
    print("测试 1：矩阵加法 A + B")
    print("-"*60)
    result_add = calculator.add()
    MatrixInput.display_matrix(result_add, "A + B 结果")

    print("\n" + "-"*60)
    print("测试 2：矩阵减法 A - B")
    print("-"*60)
    result_sub = calculator.subtract()
    MatrixInput.display_matrix(result_sub, "A - B 结果")

    print("\n" + "-"*60)
    print("测试 3：不同形状矩阵（形状不匹配测试）")
    print("-"*60)
    calculator.matrix_b = np.array([
        [1, 2],
        [3, 4]
    ])
    MatrixInput.display_matrix(calculator.matrix_b, "新矩阵 B (2x2)")
    print("\n尝试进行加法运算：")
    result_fail = calculator.add()
    if result_fail is None:
        print("✓ 正确检测到形状不匹配")

    print("\n" + "-"*60)
    print("测试 4：2x3 矩阵加法")
    print("-"*60)
    calculator.matrix_a = np.array([
        [1.5, 2.5, 3.5],
        [4.5, 5.5, 6.5]
    ])
    calculator.matrix_b = np.array([
        [1.0, 2.0, 3.0],
        [4.0, 5.0, 6.0]
    ])
    MatrixInput.display_matrix(calculator.matrix_a, "矩阵 A (2x3)")
    MatrixInput.display_matrix(calculator.matrix_b, "矩阵 B (2x3)")
    result_add2 = calculator.add()
    MatrixInput.display_matrix(result_add2, "A + B 结果")
    result_sub2 = calculator.subtract()
    MatrixInput.display_matrix(result_sub2, "A - B 结果")

    print("\n" + "="*60)
    print("测试完成！")
    print("="*60)


if __name__ == "__main__":
    test_matrix_operations()
