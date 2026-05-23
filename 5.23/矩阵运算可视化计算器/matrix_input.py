import numpy as np
from typing import Tuple, Optional, List, Union


class MatrixValidator:
    @staticmethod
    def is_valid_matrix(data: Union[List, np.ndarray]) -> bool:
        if data is None:
            return False
        if isinstance(data, np.ndarray):
            return data.ndim == 2 and data.size > 0
        if isinstance(data, list):
            if not data or not isinstance(data[0], list):
                return False
            row_length = len(data[0])
            return all(len(row) == row_length for row in data) and row_length > 0
        return False

    @staticmethod
    def has_valid_dimensions(matrix: np.ndarray, min_rows: int = 1, min_cols: int = 1) -> bool:
        if matrix is None or matrix.ndim != 2:
            return False
        return matrix.shape[0] >= min_rows and matrix.shape[1] >= min_cols

    @staticmethod
    def is_square(matrix: np.ndarray) -> bool:
        if matrix is None or matrix.ndim != 2:
            return False
        return matrix.shape[0] == matrix.shape[1]

    @staticmethod
    def can_multiply(matrix_a: np.ndarray, matrix_b: np.ndarray) -> bool:
        if matrix_a is None or matrix_b is None:
            return False
        if matrix_a.ndim != 2 or matrix_b.ndim != 2:
            return False
        return matrix_a.shape[1] == matrix_b.shape[0]

    @staticmethod
    def can_add_or_subtract(matrix_a: np.ndarray, matrix_b: np.ndarray) -> bool:
        if matrix_a is None or matrix_b is None:
            return False
        if matrix_a.ndim != 2 or matrix_b.ndim != 2:
            return False
        return matrix_a.shape == matrix_b.shape

    @staticmethod
    def has_no_nan_or_inf(matrix: np.ndarray) -> bool:
        if matrix is None:
            return False
        return not (np.any(np.isnan(matrix)) or np.any(np.isinf(matrix)))

    @staticmethod
    def validate_matrix(matrix: np.ndarray, operation: str = "运算") -> Tuple[bool, str]:
        if matrix is None:
            return False, f"错误：矩阵为空，无法执行{operation}"
        if matrix.ndim != 2:
            return False, f"错误：必须是二维矩阵才能执行{operation}"
        if matrix.size == 0:
            return False, f"错误：矩阵为空，无法执行{operation}"
        if not MatrixValidator.has_no_nan_or_inf(matrix):
            return False, f"错误：矩阵包含 NaN 或 Inf 值，无法执行{operation}"
        return True, "矩阵格式有效"

    @staticmethod
    def validate_for_operation(matrix_a: np.ndarray, matrix_b: Optional[np.ndarray], operation: str) -> Tuple[bool, str]:
        valid_a, msg_a = MatrixValidator.validate_matrix(matrix_a, operation)
        if not valid_a:
            return False, msg_a
        
        if matrix_b is not None:
            valid_b, msg_b = MatrixValidator.validate_matrix(matrix_b, operation)
            if not valid_b:
                return False, msg_b
            
            if operation in ["加法", "减法"]:
                if not MatrixValidator.can_add_or_subtract(matrix_a, matrix_b):
                    return False, f"错误：矩阵形状不匹配，无法执行{operation}（A: {matrix_a.shape}, B: {matrix_b.shape}）"
            elif operation == "乘法":
                if not MatrixValidator.can_multiply(matrix_a, matrix_b):
                    return False, f"错误：矩阵维度不匹配，无法执行{operation}（A的列数: {matrix_a.shape[1]}, B的行数: {matrix_b.shape[0]}）"
        
        if operation in ["行列式", "求逆", "特征值"]:
            if not MatrixValidator.is_square(matrix_a):
                return False, f"错误：必须是方阵才能执行{operation}"
        
        return True, "校验通过"


class MatrixFormatter:
    @staticmethod
    def format_number(num: float, precision: int = 4) -> str:
        if abs(num) < 1e-9:
            return "0"
        if abs(num) >= 1e6 or (0 < abs(num) < 1e-3):
            return f"{num:.{precision}e}"
        if abs(num - round(num)) < 1e-10:
            return str(int(round(num)))
        formatted = f"{num:.{precision}f}"
        if '.' in formatted:
            formatted = formatted.rstrip('0').rstrip('.')
        return formatted

    @staticmethod
    def format_matrix(matrix: np.ndarray, precision: int = 4, max_width: int = 80) -> str:
        if matrix is None or matrix.ndim != 2:
            return "无效矩阵"
        
        rows, cols = matrix.shape
        formatted_rows = []
        
        for i in range(rows):
            formatted_cells = []
            for j in range(cols):
                formatted_cells.append(MatrixFormatter.format_number(matrix[i, j], precision))
            formatted_rows.append(formatted_cells)
        
        col_widths = [max(len(row[j]) for row in formatted_rows) for j in range(cols)]
        
        lines = []
        for row in formatted_rows:
            line_parts = []
            for j, cell in enumerate(row):
                line_parts.append(cell.rjust(col_widths[j]))
            lines.append("  ".join(line_parts))
        
        return "\n".join(lines)

    @staticmethod
    def display_matrix(matrix: np.ndarray, title: str = "矩阵", precision: int = 4, show_shape: bool = True) -> None:
        if matrix is None:
            print(f"\n{title}:")
            print("  [空矩阵]")
            return
        
        rows, cols = matrix.shape
        formatted = MatrixFormatter.format_matrix(matrix, precision)
        matrix_lines = formatted.split('\n')
        max_line_len = max(len(line) for line in matrix_lines) if matrix_lines else 20
        
        shape_str = f"形状: {rows}×{cols} | 类型: {matrix.dtype}"
        content_width = max(max_line_len, len(title), len(shape_str) if show_shape else 0)
        border = "─" * (content_width + 4)
        
        print(f"\n┌{border}┐")
        print(f"│  {title:^{content_width}}  │")
        print(f"├{border}┤")
        
        for line in matrix_lines:
            print(f"│  {line:<{content_width}}  │")
        
        if show_shape:
            print(f"├{border}┤")
            print(f"│  {shape_str:<{content_width}}  │")
        
        print(f"└{border}┘")

    @staticmethod
    def display_operation(matrix_a: np.ndarray, matrix_b: Optional[np.ndarray], 
                          result: np.ndarray, operation: str, precision: int = 4) -> None:
        print("\n" + "="*70)
        print(f"{' ' + operation + ' 运算结果 ':^70}")
        print("="*70)
        
        MatrixFormatter.display_matrix(matrix_a, "矩阵 A", precision)
        
        if matrix_b is not None:
            op_symbol = {"加法": "+", "减法": "-", "乘法": "×"}.get(operation, "?")
            print(f"\n{' ' + op_symbol + ' ':^70}")
            MatrixFormatter.display_matrix(matrix_b, "矩阵 B", precision)
        
        print(f"\n{' = ':^70}")
        MatrixFormatter.display_matrix(result, "运算结果", precision)
        print("="*70)


class MatrixInput:
    def __init__(self):
        pass

    def input_manually(self, rows: int, cols: int) -> np.ndarray:
        matrix = np.zeros((rows, cols), dtype=float)
        print(f"请输入 {rows}x{cols} 矩阵的元素：")
        for i in range(rows):
            while True:
                try:
                    row_input = input(f"第 {i+1} 行（用空格或逗号分隔）：")
                    elements = [float(x.strip()) for x in row_input.replace(',', ' ').split()]
                    if len(elements) != cols:
                        print(f"错误：请输入 {cols} 个元素")
                        continue
                    matrix[i] = elements
                    break
                except ValueError:
                    print("错误：请输入有效的数字")
        return matrix

    def input_from_string(self, input_str: str, rows: int, cols: int) -> np.ndarray:
        elements = [float(x.strip()) for x in input_str.replace(',', ' ').split()]
        if len(elements) != rows * cols:
            raise ValueError(f"需要 {rows * cols} 个元素，但提供了 {len(elements)} 个")
        return np.array(elements).reshape(rows, cols)

    def generate_random(self, rows: int, cols: int, low: float = 0, high: float = 10) -> np.ndarray:
        return np.random.uniform(low, high, size=(rows, cols)).round(2)

    def generate_identity(self, size: int) -> np.ndarray:
        return np.eye(size)

    def generate_zeros(self, rows: int, cols: int) -> np.ndarray:
        return np.zeros((rows, cols))

    def generate_ones(self, rows: int, cols: int) -> np.ndarray:
        return np.ones((rows, cols))

    def generate_diagonal(self, diagonal_elements: list) -> np.ndarray:
        return np.diag(diagonal_elements)

    def from_file(self, filepath: str, delimiter: str = ',') -> np.ndarray:
        try:
            matrix = np.loadtxt(filepath, delimiter=delimiter)
            valid, msg = MatrixValidator.validate_matrix(matrix, "文件读取")
            if not valid:
                raise ValueError(msg)
            return matrix
        except Exception as e:
            raise IOError(f"读取文件失败：{e}")

    @staticmethod
    def display_matrix(matrix: np.ndarray, title: str = "矩阵", precision: int = 4) -> None:
        MatrixFormatter.display_matrix(matrix, title, precision)

    @staticmethod
    def get_matrix_shape() -> Tuple[int, int]:
        while True:
            try:
                rows = int(input("请输入矩阵行数："))
                cols = int(input("请输入矩阵列数："))
                if rows <= 0 or cols <= 0:
                    print("错误：行数和列数必须大于0")
                    continue
                return rows, cols
            except ValueError:
                print("错误：请输入有效的整数")


def input_single_matrix(prompt: str = "输入矩阵") -> np.ndarray:
    print(f"\n{'='*50}")
    print(f"{' ' + prompt + ' ':^50}")
    print("="*50)
    matrix_input = MatrixInput()
    print("选择输入方式：")
    print("1. 手动输入")
    print("2. 生成随机矩阵")
    print("3. 生成单位矩阵")
    print("4. 生成零矩阵")
    print("5. 生成全一矩阵")
    print("6. 生成对角矩阵")
    print("7. 从文件读取")

    while True:
        try:
            choice = int(input("请选择（1-7）："))
            if choice < 1 or choice > 7:
                print("错误：请输入1-7之间的数字")
                continue
            break
        except ValueError:
            print("错误：请输入有效的数字")

    if choice == 1:
        rows, cols = matrix_input.get_matrix_shape()
        return matrix_input.input_manually(rows, cols)
    elif choice == 2:
        rows, cols = matrix_input.get_matrix_shape()
        low = float(input("最小值（默认0）：") or 0)
        high = float(input("最大值（默认10）：") or 10)
        return matrix_input.generate_random(rows, cols, low, high)
    elif choice == 3:
        size = int(input("请输入矩阵大小："))
        return matrix_input.generate_identity(size)
    elif choice == 4:
        rows, cols = matrix_input.get_matrix_shape()
        return matrix_input.generate_zeros(rows, cols)
    elif choice == 5:
        rows, cols = matrix_input.get_matrix_shape()
        return matrix_input.generate_ones(rows, cols)
    elif choice == 6:
        elements = input("请输入对角线元素（用空格或逗号分隔）：")
        diagonal_list = [float(x.strip()) for x in elements.replace(',', ' ').split()]
        return matrix_input.generate_diagonal(diagonal_list)
    elif choice == 7:
        filepath = input("请输入文件路径：")
        delimiter = input("分隔符（默认逗号）：") or ','
        return matrix_input.from_file(filepath, delimiter)


if __name__ == "__main__":
    mi = MatrixInput()
    print("矩阵输入模块测试")
    mat = input_single_matrix("测试矩阵输入")
    MatrixFormatter.display_matrix(mat, "输入的矩阵")
