import numpy as np
from main import MatrixCalculator
from matrix_input import MatrixInput


def comprehensive_multiply_test():
    print("="*70)
    print("矩阵乘法全面测试 - 验证计算正确性")
    print("="*70)

    calc = MatrixCalculator()
    all_passed = True

    test_cases = [
        {
            "name": "2×2 整数矩阵",
            "A": np.array([[1, 2], [3, 4]]),
            "B": np.array([[5, 6], [7, 8]]),
            "expected": np.array([[19, 22], [43, 50]])
        },
        {
            "name": "3×3 整数矩阵",
            "A": np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
            "B": np.array([[9, 8, 7], [6, 5, 4], [3, 2, 1]]),
            "expected": np.array([[30, 24, 18], [84, 69, 54], [138, 114, 90]])
        },
        {
            "name": "2×3 与 3×2 矩阵",
            "A": np.array([[1, 2, 3], [4, 5, 6]]),
            "B": np.array([[7, 8], [9, 10], [11, 12]]),
            "expected": np.array([[58, 64], [139, 154]])
        },
        {
            "name": "浮点矩阵",
            "A": np.array([[1.5, 2.5], [3.5, 4.5]]),
            "B": np.array([[2.0, 1.0], [1.0, 2.0]]),
            "expected": np.array([[5.5, 6.5], [11.5, 12.5]])
        },
        {
            "name": "含零矩阵",
            "A": np.array([[0, 0], [0, 0]]),
            "B": np.array([[1, 2], [3, 4]]),
            "expected": np.array([[0, 0], [0, 0]])
        },
        {
            "name": "1×3 与 3×1 矩阵（结果为标量）",
            "A": np.array([[1, 2, 3]]),
            "B": np.array([[4], [5], [6]]),
            "expected": np.array([[32]])
        },
        {
            "name": "3×1 与 1×3 矩阵（结果为3×3）",
            "A": np.array([[1], [2], [3]]),
            "B": np.array([[4, 5, 6]]),
            "expected": np.array([[4, 5, 6], [8, 10, 12], [12, 15, 18]])
        }
    ]

    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*70}")
        print(f"测试 {i}: {test['name']}")
        print("="*70)

        calc.matrix_a = test["A"]
        calc.matrix_b = test["B"]

        MatrixInput.display_matrix(calc.matrix_a, "矩阵 A")
        MatrixInput.display_matrix(calc.matrix_b, "矩阵 B")

        result_steps = calc.multiply(show_steps=False)
        result_numpy = np.dot(calc.matrix_a, calc.matrix_b)

        print("\n计算结果:")
        print(result_steps)
        print("\n预期结果 (NumPy):")
        print(result_numpy)
        print("\n手动验证预期结果:")
        print(test["expected"])

        match_numpy = np.allclose(result_steps, result_numpy)
        match_expected = np.allclose(result_steps, test["expected"])

        if match_numpy and match_expected:
            print(f"\n✓ 测试 {i} 通过！")
        else:
            print(f"\n✗ 测试 {i} 失败！")
            print(f"  与 NumPy 匹配: {match_numpy}")
            print(f"  与预期值匹配: {match_expected}")
            all_passed = False

    print(f"\n{'='*70}")
    if all_passed:
        print("所有测试通过！矩阵乘法计算正确。")
    else:
        print("部分测试失败，请检查代码。")
    print("="*70)

    return all_passed


if __name__ == "__main__":
    success = comprehensive_multiply_test()
    exit(0 if success else 1)
