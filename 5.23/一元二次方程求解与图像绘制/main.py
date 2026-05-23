from solver import QuadraticEquation
import matplotlib.pyplot as plt
import re


DEFAULT_PRECISION = 4


def parse_number(s):
    s = s.strip()
    if '/' in s:
        parts = s.split('/')
        if len(parts) == 2:
            try:
                return float(parts[0]) / float(parts[1])
            except (ValueError, ZeroDivisionError):
                pass
    try:
        return float(s)
    except ValueError:
        return None


def get_user_input():
    print("=" * 60)
    print("                一元二次方程求解器")
    print("=" * 60)
    print("方程格式: ax² + bx + c = 0")
    print("\n输入方式:")
    print("  1. 逐个输入系数")
    print("  2. 一行输入（用空格或逗号分隔，如: 1 -3 2）")
    print("  3. 支持小数、整数、分数（如: 1/2 或 0.5）")
    print("-" * 60)

    while True:
        choice = input("\n选择输入方式 (1=逐个, 2=一行): ").strip()

        if choice == '1':
            while True:
                try:
                    a_str = input("a = ").strip()
                    a = parse_number(a_str)
                    if a is None:
                        print("错误: 请输入有效的数字!")
                        continue

                    b_str = input("b = ").strip()
                    b = parse_number(b_str)
                    if b is None:
                        print("错误: 请输入有效的数字!")
                        continue

                    c_str = input("c = ").strip()
                    c = parse_number(c_str)
                    if c is None:
                        print("错误: 请输入有效的数字!")
                        continue

                    return a, b, c
                except Exception:
                    print("错误: 输入无效，请重试!")

        elif choice == '2':
            while True:
                line = input("\n请输入 a b c（用空格或逗号分隔）: ").strip()
                parts = re.split(r'[,\s]+', line)
                parts = [p for p in parts if p]

                if len(parts) != 3:
                    print(f"错误: 需要输入3个系数，当前输入了 {len(parts)} 个")
                    continue

                a = parse_number(parts[0])
                b = parse_number(parts[1])
                c = parse_number(parts[2])

                if a is None or b is None or c is None:
                    print("错误: 包含无效数字，请检查输入!")
                    continue

                return a, b, c
        else:
            print("请输入 1 或 2!")


def get_precision():
    while True:
        choice = input(f"\n结果保留小数位数 (默认 {DEFAULT_PRECISION} 位): ").strip()
        if not choice:
            return DEFAULT_PRECISION
        try:
            precision = int(choice)
            if 0 <= precision <= 15:
                return precision
            else:
                print("请输入 0-15 之间的数字!")
        except ValueError:
            print("请输入有效的数字!")


def verify_solution(equation, precision):
    solution = equation.solve()
    if solution['type'] not in ['real_distinct', 'real_equal', 'linear']:
        return None

    results = []
    for root in solution['roots']:
        value = equation.a * root ** 2 + equation.b * root + equation.c
        results.append((root, value))

    return results


def display_solution(equation, precision):
    fmt = f".{precision}f"

    print("\n" + "=" * 60)
    print(f"方程: {equation.a}x² + {equation.b}x + {equation.c} = 0")
    print("=" * 60)

    real_roots = equation.get_real_roots()
    solution = equation.solve()

    print("\n【实数根结果】")
    if len(real_roots) > 0:
        for i, root in enumerate(real_roots, 1):
            print(f"  x{i} = {root:{fmt}}")
    else:
        if solution['type'] == 'complex':
            print("  无实数根（有复数根）")
        elif solution['type'] == 'none':
            print("  无解")
        elif solution['type'] == 'infinite':
            print("  有无穷多解")

    if equation.a != 0:
        discriminant = equation.discriminant()
        print(f"\n【判别式】")
        print(f"  Δ = {discriminant:{fmt}}")

        if solution['type'] == 'real_distinct':
            print("  Δ > 0，有两个不相等的实根")
        elif solution['type'] == 'real_equal':
            print("  Δ = 0，有两个相等的实根")
        elif solution['type'] == 'complex':
            print("  Δ < 0，无实根（有两个共轭复根）")

    vertex = equation.vertex()
    if vertex:
        print(f"\n【顶点信息】")
        print(f"  顶点坐标: ({vertex[0]:{fmt}}, {vertex[1]:{fmt}})")
        if equation.a > 0:
            print(f"  开口向上，最小值: {vertex[1]:{fmt}}")
        elif equation.a < 0:
            print(f"  开口向下，最大值: {vertex[1]:{fmt}}")

    verification = verify_solution(equation, precision)
    if verification:
        print(f"\n【计算验证】")
        for i, (root, value) in enumerate(verification, 1):
            print(f"  x{i} 代入验证: ax² + bx + c = {value:.10e}")
        print(f"  (值接近0说明计算准确，浮点误差属正常现象)")


def show_plot(equation):
    fig = equation.plot()
    if fig:
        print("\n正在显示图像（包含求解结果信息）...")
        plt.show()
    else:
        print("\n无法绘制图像（不是二次或一次函数）")


def main():
    a, b, c = get_user_input()
    precision = get_precision()
    equation = QuadraticEquation(a, b, c)
    display_solution(equation, precision)

    while True:
        choice = input("\n是否显示图像? (y/n): ").lower()
        if choice in ['y', 'yes']:
            show_plot(equation)
            break
        elif choice in ['n', 'no']:
            break
        else:
            print("请输入 y 或 n")


if __name__ == "__main__":
    main()
