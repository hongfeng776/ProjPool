import numpy as np
from matrix_input import MatrixValidator, MatrixFormatter
from main import MatrixCalculator, PrecisionManager


def test_matrix_validator():
    print("\n" + "="*70)
    print("测试 1: 矩阵格式校验功能 (MatrixValidator)")
    print("="*70)

    all_passed = True

    print("\n1.1 基本矩阵有效性检查:")
    valid_matrix = np.array([[1, 2], [3, 4]])
    invalid_matrix_1d = np.array([1, 2, 3])
    empty_matrix = np.array([])
    none_matrix = None

    tests = [
        ("有效二维矩阵", MatrixValidator.is_valid_matrix(valid_matrix), True),
        ("一维数组", MatrixValidator.is_valid_matrix(invalid_matrix_1d), False),
        ("空数组", MatrixValidator.is_valid_matrix(empty_matrix), False),
        ("None", MatrixValidator.is_valid_matrix(none_matrix), False),
    ]

    for name, result, expected in tests:
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  {status} {name}: {result} (预期: {expected})")

    print("\n1.2 方阵检查:")
    square_matrix = np.array([[1, 2], [3, 4]])
    non_square_matrix = np.array([[1, 2, 3], [4, 5, 6]])

    tests = [
        ("2×2方阵", MatrixValidator.is_square(square_matrix), True),
        ("2×3非方阵", MatrixValidator.is_square(non_square_matrix), False),
    ]

    for name, result, expected in tests:
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  {status} {name}: {result} (预期: {expected})")

    print("\n1.3 运算可行性检查:")
    a = np.array([[1, 2], [3, 4]])
    b_same_shape = np.array([[5, 6], [7, 8]])
    b_diff_shape = np.array([[1, 2, 3], [4, 5, 6]])
    b_mult_ok = np.array([[1], [2]])

    tests = [
        ("同形状可相加", MatrixValidator.can_add_or_subtract(a, b_same_shape), True),
        ("不同形状不可相加", MatrixValidator.can_add_or_subtract(a, b_diff_shape), False),
        ("可相乘(2×2 × 2×1)", MatrixValidator.can_multiply(a, b_mult_ok), True),
        ("不可相乘(2×3 × 2×2)", MatrixValidator.can_multiply(b_diff_shape, a), False),
    ]

    for name, result, expected in tests:
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  {status} {name}: {result} (预期: {expected})")

    print("\n1.4 NaN/Inf 检查:")
    matrix_with_nan = np.array([[1, np.nan], [3, 4]])
    matrix_with_inf = np.array([[1, np.inf], [3, 4]])
    normal_matrix = np.array([[1, 2], [3, 4]])

    tests = [
        ("含NaN矩阵", MatrixValidator.has_no_nan_or_inf(matrix_with_nan), False),
        ("含Inf矩阵", MatrixValidator.has_no_nan_or_inf(matrix_with_inf), False),
        ("正常矩阵", MatrixValidator.has_no_nan_or_inf(normal_matrix), True),
    ]

    for name, result, expected in tests:
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  {status} {name}: {result} (预期: {expected})")

    print("\n1.5 完整运算校验:")
    a = np.array([[1, 2], [3, 4]])
    b_ok = np.array([[5, 6], [7, 8]])
    b_bad = np.array([[1, 2, 3]])

    valid_add, msg_add = MatrixValidator.validate_for_operation(a, b_ok, "加法")
    valid_mult_bad, msg_mult_bad = MatrixValidator.validate_for_operation(a, b_bad, "乘法")
    valid_det_square, msg_det_square = MatrixValidator.validate_for_operation(a, None, "行列式")

    tests = [
        ("加法校验通过", valid_add, True),
        ("乘法维度错误校验", valid_mult_bad, False),
        ("方阵行列式校验", valid_det_square, True),
    ]

    for name, result, expected in tests:
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  {status} {name}: {result} (预期: {expected})")

    print(f"\n{'矩阵格式校验测试通过' if all_passed else '矩阵格式校验测试失败'}!")
    return all_passed


def test_matrix_formatter():
    print("\n" + "="*70)
    print("测试 2: 矩阵展示样式优化 (MatrixFormatter)")
    print("="*70)

    all_passed = True

    print("\n2.1 数字格式化:")
    test_numbers = [
        (1e-10, "0"),
        (5.0, "5"),
        (3.1415926, "3.1416"),
        (1234567.0, "1.2346e+06"),
        (0.0001234, "1.234e-04"),
        (-2.5, "-2.5"),
    ]

    for num, expected in test_numbers:
        formatted = MatrixFormatter.format_number(num, 4)
        status = "✓" if formatted == expected else "✗"
        if formatted != expected:
            all_passed = False
        print(f"  {status} {num} -> '{formatted}' (预期: '{expected}')")

    print("\n2.2 矩阵格式化展示:")
    test_matrix = np.array([
        [1, 2.5, 3.14159],
        [4.0, 5.6789, 6],
        [0.0000001, 1000000, 2.71828]
    ])

    print("  原始矩阵:")
    print(test_matrix)
    print("\n  格式化后 (精度=4):")
    formatted = MatrixFormatter.format_matrix(test_matrix, 4)
    print(formatted)

    print("\n2.3 带边框的矩阵显示:")
    print("  带边框显示效果:")
    MatrixFormatter.display_matrix(test_matrix, "测试矩阵", 4)

    all_passed = True
    print(f"\n矩阵展示样式测试完成!")
    return all_passed


def test_precision_manager():
    print("\n" + "="*70)
    print("测试 3: 运算精准度保证 (PrecisionManager)")
    print("="*70)

    all_passed = True

    print("\n3.1 高精度乘法测试:")
    a = np.array([[0.1, 0.2], [0.3, 0.4]])
    b = np.array([[0.5, 0.6], [0.7, 0.8]])

    result_high = PrecisionManager.high_precision_multiply(a, b)
    result_numpy = np.dot(a, b)

    print(f"  矩阵 A:\n{a}")
    print(f"  矩阵 B:\n{b}")
    print(f"  高精度结果:\n{result_high}")
    print(f"  NumPy 结果:\n{result_numpy}")
    print(f"  结果一致: {np.allclose(result_high, result_numpy)}")

    print("\n3.2 结果四舍五入与误差消除:")
    noisy_matrix = np.array([
        [1.0000000001, 2.0000000002],
        [3.0000000003, -0.0000000001]
    ])
    cleaned = PrecisionManager.round_result(noisy_matrix)

    print(f"  含微小误差的矩阵:\n{noisy_matrix}")
    print(f"  误差消除后:\n{cleaned}")

    expected_clean = np.array([[1, 2], [3, 0]])
    status = "✓" if np.allclose(cleaned, expected_clean) else "✗"
    if not np.allclose(cleaned, expected_clean):
        all_passed = False
    print(f"  {status} 误差消除正确")

    print("\n3.3 结果验证:")
    computed = np.array([[1, 2], [3, 4]])
    expected = np.array([[1.0000000001, 2.0000000002], [2.9999999999, 4.0000000001]])

    verified = PrecisionManager.verify_result(computed, expected, 1e-9)
    status = "✓" if verified else "✗"
    if not verified:
        all_passed = False
    print(f"  {status} 结果验证正确 (容差 1e-9): {verified}")

    print(f"\n{'运算精准度测试通过' if all_passed else '运算精准度测试失败'}!")
    return all_passed


def test_calculator_integration():
    print("\n" + "="*70)
    print("测试 4: 计算器集成测试")
    print("="*70)

    all_passed = True
    calc = MatrixCalculator()

    print("\n4.1 矩阵加法 (含校验和格式化):")
    calc.matrix_a = np.array([[1, 2], [3, 4]])
    calc.matrix_b = np.array([[5, 6], [7, 8]])
    result = calc.add()
    expected = np.array([[6, 8], [10, 12]])

    status = "✓" if np.allclose(result, expected) else "✗"
    if not np.allclose(result, expected):
        all_passed = False
    print(f"  {status} 加法结果正确")
    MatrixFormatter.display_matrix(result, "加法结果", 4)

    print("\n4.2 矩阵乘法 (高精度):")
    calc.matrix_a = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
    calc.matrix_b = np.array([[0.7, 0.8], [0.9, 1.0], [1.1, 1.2]])
    result = calc.multiply()

    expected = np.dot(calc.matrix_a, calc.matrix_b)
    status = "✓" if np.allclose(result, expected) else "✗"
    if not np.allclose(result, expected):
        all_passed = False
    print(f"  {status} 乘法结果正确")
    MatrixFormatter.display_matrix(result, "高精度乘法结果", 6)

    print("\n4.3 逆矩阵验证 (A × A^-1 = I):")
    a = np.array([[4, 7], [2, 6]])
    calc.matrix_a = a
    a_inv = calc.inverse()

    identity = np.dot(a, a_inv)
    identity_clean = PrecisionManager.round_result(identity)

    expected_identity = np.eye(2)
    status = "✓" if np.allclose(identity_clean, expected_identity) else "✗"
    if not np.allclose(identity_clean, expected_identity):
        all_passed = False
    print(f"  {status} A × A^-1 = I 验证通过")
    MatrixFormatter.display_matrix(identity_clean, "A × A^-1 (应为单位矩阵)", 4)

    print("\n4.4 错误矩阵处理:")
    calc.matrix_a = np.array([[1, 2, 3], [4, 5, 6]])
    calc.matrix_b = np.array([[1, 2], [3, 4]])

    result_bad = calc.multiply()
    status = "✓" if result_bad is None else "✗"
    if result_bad is not None:
        all_passed = False
    print(f"  {status} 维度不匹配时正确返回 None")

    print(f"\n{'计算器集成测试通过' if all_passed else '计算器集成测试失败'}!")
    return all_passed


def run_all_tests():
    print("\n" + "="*70)
    print("矩阵运算计算器 - 综合功能测试")
    print("="*70)

    results = []
    results.append(("矩阵格式校验", test_matrix_validator()))
    results.append(("展示样式优化", test_matrix_formatter()))
    results.append(("运算精准度保证", test_precision_manager()))
    results.append(("计算器集成", test_calculator_integration()))

    print("\n" + "="*70)
    print("测试结果汇总")
    print("="*70)

    all_passed = True
    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        if not passed:
            all_passed = False
        print(f"  {name}: {status}")

    print("="*70)
    if all_passed:
        print("  所有测试通过！矩阵计算器功能正常。")
    else:
        print("  部分测试失败，请检查代码。")
    print("="*70)

    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
