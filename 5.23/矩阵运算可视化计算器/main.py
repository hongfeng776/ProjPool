import numpy as np
from matrix_input import MatrixInput, input_single_matrix, MatrixValidator, MatrixFormatter


class PrecisionManager:
    DEFAULT_PRECISION = 10
    EPSILON = 1e-12

    @staticmethod
    def set_precision(precision: int) -> None:
        np.set_printoptions(precision=precision, suppress=False)

    @staticmethod
    def round_result(matrix: np.ndarray, decimals: int = 10) -> np.ndarray:
        if matrix is None:
            return None
        rounded = np.round(matrix, decimals=decimals)
        rounded[np.abs(rounded) < PrecisionManager.EPSILON] = 0
        return rounded

    @staticmethod
    def high_precision_multiply(matrix_a: np.ndarray, matrix_b: np.ndarray) -> np.ndarray:
        matrix_a_high = matrix_a.astype(np.float64)
        matrix_b_high = matrix_b.astype(np.float64)
        result = np.dot(matrix_a_high, matrix_b_high)
        return PrecisionManager.round_result(result)

    @staticmethod
    def verify_result(computed: np.ndarray, expected: np.ndarray, tolerance: float = 1e-10) -> bool:
        if computed is None or expected is None:
            return False
        return np.allclose(computed, expected, atol=tolerance)


class MatrixCalculator:
    def __init__(self):
        self.matrix_a = None
        self.matrix_b = None
        self.result = None
        self.precision = 4

    def set_precision(self, precision: int) -> None:
        if 1 <= precision <= 15:
            self.precision = precision
            PrecisionManager.set_precision(precision)
            print(f"显示精度已设置为 {precision} 位小数")
        else:
            print("错误：精度范围应为 1-15")

    def input_matrices(self, need_b: bool = True) -> None:
        self.matrix_a = input_single_matrix("输入矩阵 A")
        MatrixFormatter.display_matrix(self.matrix_a, "矩阵 A", self.precision)

        if need_b:
            self.matrix_b = input_single_matrix("输入矩阵 B")
            MatrixFormatter.display_matrix(self.matrix_b, "矩阵 B", self.precision)

    def check_matrices(self, need_b: bool = True, operation: str = "运算") -> bool:
        valid, msg = MatrixValidator.validate_for_operation(
            self.matrix_a, self.matrix_b if need_b else None, operation
        )
        if not valid:
            print(msg)
            return False
        return True

    def add(self, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=True, operation="加法"):
            return None
        self.result = PrecisionManager.round_result(self.matrix_a + self.matrix_b)
        if show_result:
            MatrixFormatter.display_operation(self.matrix_a, self.matrix_b, self.result, "加法", self.precision)
        return self.result

    def subtract(self, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=True, operation="减法"):
            return None
        self.result = PrecisionManager.round_result(self.matrix_a - self.matrix_b)
        if show_result:
            MatrixFormatter.display_operation(self.matrix_a, self.matrix_b, self.result, "减法", self.precision)
        return self.result

    def multiply(self, show_steps: bool = False, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=True, operation="乘法"):
            return None
        
        if show_steps:
            self._multiply_with_steps()
        else:
            self.result = PrecisionManager.high_precision_multiply(self.matrix_a, self.matrix_b)
        
        if show_result:
            MatrixFormatter.display_operation(self.matrix_a, self.matrix_b, self.result, "乘法", self.precision)
        return self.result

    def _multiply_with_steps(self) -> None:
        rows_a, cols_a = self.matrix_a.shape
        rows_b, cols_b = self.matrix_b.shape
        
        dtype = np.result_type(self.matrix_a.dtype, self.matrix_b.dtype)
        self.result = np.zeros((rows_a, cols_b), dtype=np.float64)
        
        print("\n" + "="*70)
        print("矩阵乘法运算步骤详解")
        print("="*70)
        print(f"\n矩阵 A ({rows_a}×{cols_a}):")
        print(MatrixFormatter.format_matrix(self.matrix_a, self.precision))
        print(f"\n矩阵 B ({rows_b}×{cols_b}):")
        print(MatrixFormatter.format_matrix(self.matrix_b, self.precision))
        print(f"\n结果矩阵 C 将是 {rows_a}×{cols_b} 的矩阵")
        print(f"C[i][j] = A 的第 i 行 × B 的第 j 列（点积）")
        print("-"*70)
        
        for i in range(rows_a):
            for j in range(cols_b):
                row_a = self.matrix_a[i]
                col_b = self.matrix_b[:, j]
                
                print(f"\n计算 C[{i+1}][{j+1}]:")
                print(f"  A 的第 {i+1} 行: {row_a}")
                print(f"  B 的第 {j+1} 列: {col_b}")
                
                dot_product = 0.0
                calculation_steps = []
                for k in range(cols_a):
                    product = float(row_a[k]) * float(col_b[k])
                    calculation_steps.append(f"{MatrixFormatter.format_number(row_a[k], self.precision)}×{MatrixFormatter.format_number(col_b[k], self.precision)}")
                    dot_product += product
                
                print(f"  = {' + '.join(calculation_steps)}")
                print(f"  = {MatrixFormatter.format_number(dot_product, self.precision)}")
                
                self.result[i][j] = dot_product
        
        self.result = PrecisionManager.round_result(self.result)
        print("\n" + "-"*70)

    def scalar_multiply(self, scalar: float, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=False, operation="数乘"):
            return None
        self.result = PrecisionManager.round_result(self.matrix_a * scalar)
        if show_result:
            MatrixFormatter.display_matrix(self.result, f"{scalar} × A 结果", self.precision)
        return self.result

    def transpose(self, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=False, operation="转置"):
            return None
        self.result = self.matrix_a.T
        if show_result:
            MatrixFormatter.display_matrix(self.result, "A^T 转置结果", self.precision)
        return self.result

    def determinant(self, show_result: bool = False) -> float:
        if not self.check_matrices(need_b=False, operation="行列式"):
            return None
        det = np.linalg.det(self.matrix_a.astype(np.float64))
        det_rounded = PrecisionManager.round_result(np.array([[det]]))[0, 0]
        if show_result:
            print(f"\n行列式 |A| = {MatrixFormatter.format_number(det_rounded, self.precision)}")
        return det_rounded

    def inverse(self, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=False, operation="求逆"):
            return None
        try:
            self.result = PrecisionManager.round_result(np.linalg.inv(self.matrix_a.astype(np.float64)))
            if show_result:
                MatrixFormatter.display_matrix(self.result, "A^-1 逆矩阵", self.precision)
            return self.result
        except np.linalg.LinAlgError:
            print("错误：矩阵不可逆（奇异矩阵）")
            return None

    def rank(self, show_result: bool = False) -> int:
        if not self.check_matrices(need_b=False, operation="求秩"):
            return None
        rank = np.linalg.matrix_rank(self.matrix_a)
        if show_result:
            print(f"\n矩阵的秩 = {rank}")
        return rank

    def eigenvalues(self, show_result: bool = False) -> np.ndarray:
        if not self.check_matrices(need_b=False, operation="特征值"):
            return None
        eigvals = np.linalg.eigvals(self.matrix_a.astype(np.float64))
        if show_result:
            print("\n矩阵的特征值：")
            for i, val in enumerate(eigvals, 1):
                if np.iscomplex(val):
                    real_part = MatrixFormatter.format_number(val.real, self.precision)
                    imag_part = MatrixFormatter.format_number(val.imag, self.precision)
                    print(f"  λ{i} = {real_part} + {imag_part}j")
                else:
                    print(f"  λ{i} = {MatrixFormatter.format_number(val.real, self.precision)}")
        return eigvals

    def show_result(self, operation_name: str) -> None:
        if self.result is not None:
            MatrixFormatter.display_matrix(self.result, f"{operation_name} 结果", self.precision)


def display_menu():
    print("\n" + "="*60)
    print("        矩阵运算可视化计算器")
    print("="*60)
    print("【基本运算】")
    print("  1. 矩阵加法 (A + B)")
    print("  2. 矩阵减法 (A - B)")
    print("  3. 矩阵乘法 (A × B)")
    print("  4. 数乘矩阵 (k × A)")
    print("  5. 矩阵转置 (A^T)")
    print("【矩阵分析】")
    print("  6. 计算行列式 |A|")
    print("  7. 矩阵求逆 (A^-1)")
    print("  8. 计算矩阵的秩")
    print("  9. 计算特征值")
    print("【系统设置】")
    print("  s. 设置显示精度")
    print("  0. 退出")
    print("="*60)


def main():
    calculator = MatrixCalculator()
    print("欢迎使用矩阵运算可视化计算器！")
    print("输入 's' 可设置显示精度，输入 '0' 退出")

    while True:
        display_menu()
        choice = input("请选择运算：").strip().lower()

        if choice == '0':
            print("\n感谢使用矩阵运算计算器，再见！")
            break

        elif choice == 's':
            try:
                prec = int(input("请输入显示精度（1-15，默认4）："))
                calculator.set_precision(prec)
            except ValueError:
                print("错误：请输入有效的数字")

        elif choice == '1':
            calculator.input_matrices(need_b=True)
            result = calculator.add(show_result=True)

        elif choice == '2':
            calculator.input_matrices(need_b=True)
            result = calculator.subtract(show_result=True)

        elif choice == '3':
            calculator.input_matrices(need_b=True)
            show_steps = input("是否显示运算步骤？(y/n): ").lower() == 'y'
            result = calculator.multiply(show_steps=show_steps, show_result=True)

        elif choice == '4':
            calculator.input_matrices(need_b=False)
            try:
                scalar = float(input("请输入标量 k："))
                result = calculator.scalar_multiply(scalar, show_result=True)
            except ValueError:
                print("错误：请输入有效的数字")

        elif choice == '5':
            calculator.input_matrices(need_b=False)
            result = calculator.transpose(show_result=True)

        elif choice == '6':
            calculator.input_matrices(need_b=False)
            det = calculator.determinant(show_result=True)

        elif choice == '7':
            calculator.input_matrices(need_b=False)
            result = calculator.inverse(show_result=True)

        elif choice == '8':
            calculator.input_matrices(need_b=False)
            rank = calculator.rank(show_result=True)

        elif choice == '9':
            calculator.input_matrices(need_b=False)
            eigenvalues = calculator.eigenvalues(show_result=True)

        else:
            print("错误：无效的选择，请重新输入")

        input("\n按回车键继续...")


if __name__ == "__main__":
    main()
