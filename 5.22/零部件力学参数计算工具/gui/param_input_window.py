import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext


class ParamInputWindow:
    def __init__(self, root):
        self.root = root
        self.root.title("零部件力学参数计算工具 v2.0")
        self.root.geometry("1100x800")
        self.root.minsize(1000, 700)
        
        self.create_widgets()

    def create_widgets(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        notebook = ttk.Notebook(main_frame)
        notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.create_single_tab(notebook)
        self.create_batch_tab(notebook)

    def create_single_tab(self, notebook):
        single_frame = ttk.Frame(notebook, padding="15")
        notebook.add(single_frame, text="单组计算")
        
        single_frame.columnconfigure(1, weight=1)
        single_frame.rowconfigure(5, weight=1)
        
        title_label = ttk.Label(single_frame, text="单组零部件力学计算", font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 15))
        
        info_frame = ttk.LabelFrame(single_frame, text="基本信息", padding="10")
        info_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        info_frame.columnconfigure(1, weight=1)
        info_frame.columnconfigure(3, weight=1)
        
        ttk.Label(info_frame, text="零件编号:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.single_part_id = ttk.Entry(info_frame, width=30)
        self.single_part_id.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        
        ttk.Label(info_frame, text="零件名称:").grid(row=0, column=2, sticky=tk.W, pady=5)
        self.single_part_name = ttk.Entry(info_frame, width=30)
        self.single_part_name.grid(row=0, column=3, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        ttk.Label(info_frame, text="零件类型:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.single_part_type = ttk.Combobox(info_frame, values=["轴类", "齿轮", "弹簧", "螺栓", "板类", "其他"], width=27)
        self.single_part_type.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        
        ttk.Label(info_frame, text="材料:").grid(row=1, column=2, sticky=tk.W, pady=5)
        self.single_material = ttk.Combobox(info_frame, values=["Q235", "Q345", "45钢", "40Cr", "不锈钢304"], width=27)
        self.single_material.grid(row=1, column=3, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        self.single_material.current(0)
        
        size_frame = ttk.LabelFrame(single_frame, text="尺寸参数", padding="10")
        size_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        size_frame.columnconfigure(1, weight=1)
        size_frame.columnconfigure(3, weight=1)
        
        ttk.Label(size_frame, text="长度 (L):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.single_length = ttk.Entry(size_frame, width=30)
        self.single_length.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        ttk.Label(size_frame, text="mm").grid(row=0, column=2, sticky=tk.W, pady=5)
        
        ttk.Label(size_frame, text="宽度 (W):").grid(row=0, column=3, sticky=tk.W, pady=5)
        self.single_width = ttk.Entry(size_frame, width=30)
        self.single_width.grid(row=0, column=4, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        ttk.Label(size_frame, text="mm").grid(row=0, column=5, sticky=tk.W, pady=5)
        
        ttk.Label(size_frame, text="高度 (H):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.single_height = ttk.Entry(size_frame, width=30)
        self.single_height.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        ttk.Label(size_frame, text="mm").grid(row=1, column=2, sticky=tk.W, pady=5)
        
        force_frame = ttk.LabelFrame(single_frame, text="受力参数", padding="10")
        force_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        force_frame.columnconfigure(1, weight=1)
        force_frame.columnconfigure(3, weight=1)
        
        ttk.Label(force_frame, text="受力大小 (F):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.single_force = ttk.Entry(force_frame, width=30)
        self.single_force.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 20))
        ttk.Label(force_frame, text="N").grid(row=0, column=2, sticky=tk.W, pady=5)
        
        ttk.Label(force_frame, text="受力方向:").grid(row=0, column=3, sticky=tk.W, pady=5)
        self.single_force_direction = ttk.Combobox(force_frame, values=["轴向", "径向", "横向", "纵向", "其他"], width=27)
        self.single_force_direction.grid(row=0, column=4, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        result_frame = ttk.LabelFrame(single_frame, text="力学计算结果", padding="10")
        result_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        result_frame.columnconfigure(1, weight=1)
        result_frame.columnconfigure(3, weight=1)
        
        result_items = [
            ("横截面积 (A):", "cross_sectional_area", "mm²", 0, 0),
            ("拉伸应力 (σ):", "tensile_stress", "MPa", 0, 3),
            ("压缩应力 (σ):", "compressive_stress", "MPa", 1, 0),
            ("剪切应力 (τ):", "shear_stress", "MPa", 1, 3),
            ("轴向应变 (ε):", "axial_strain", "mm/mm", 2, 0),
            ("伸长量 (ΔL):", "elongation", "mm", 2, 3),
            ("安全系数 (n):", "safety_factor", "", 3, 0),
        ]
        
        self.single_result_labels = {}
        for label_text, key, unit, row, col in result_items:
            ttk.Label(result_frame, text=label_text).grid(row=row, column=col, sticky=tk.W, pady=5, padx=(0, 5))
            result_label = ttk.Label(result_frame, text="-", font=("Arial", 10, "bold"), foreground="blue")
            result_label.grid(row=row, column=col+1, sticky=tk.W, pady=5, padx=(0, 10))
            if unit:
                ttk.Label(result_frame, text=unit).grid(row=row, column=col+2, sticky=tk.W, pady=5)
            self.single_result_labels[key] = result_label
        
        ttk.Label(result_frame, text="材料属性:").grid(row=3, column=3, sticky=tk.W, pady=5)
        self.material_info_label = ttk.Label(result_frame, text="Q235 | E=206GPa | σs=235MPa", foreground="gray")
        self.material_info_label.grid(row=3, column=4, sticky=tk.W, pady=5, columnspan=2)
        
        validation_frame = ttk.LabelFrame(single_frame, text="校验信息", padding="10")
        validation_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        validation_frame.columnconfigure(0, weight=1)
        validation_frame.rowconfigure(0, weight=1)
        
        self.validation_text = scrolledtext.ScrolledText(validation_frame, height=6, wrap=tk.WORD)
        self.validation_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        buttons_frame = ttk.Frame(single_frame)
        buttons_frame.grid(row=6, column=0, columnspan=3, pady=5)
        
        self.single_calc_btn = ttk.Button(buttons_frame, text="开始计算", width=18)
        self.single_calc_btn.grid(row=0, column=0, padx=10)
        
        self.single_submit_btn = ttk.Button(buttons_frame, text="提交存储", width=18)
        self.single_submit_btn.grid(row=0, column=1, padx=10)
        
        self.single_clear_btn = ttk.Button(buttons_frame, text="清空输入", width=18, command=self.clear_single_inputs)
        self.single_clear_btn.grid(row=0, column=2, padx=10)
        
        self.single_status_label = ttk.Label(single_frame, text="", foreground="green")
        self.single_status_label.grid(row=7, column=0, columnspan=3, pady=(5, 0))

    def create_batch_tab(self, notebook):
        batch_frame = ttk.Frame(notebook, padding="15")
        notebook.add(batch_frame, text="批量计算")
        
        batch_frame.columnconfigure(0, weight=1)
        batch_frame.rowconfigure(4, weight=1)
        
        title_label = ttk.Label(batch_frame, text="批量零部件力学计算", font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=4, pady=(0, 15))
        
        file_frame = ttk.LabelFrame(batch_frame, text="数据导入", padding="10")
        file_frame.grid(row=1, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(0, 10))
        file_frame.columnconfigure(1, weight=1)
        
        ttk.Label(file_frame, text="CSV文件:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.batch_file_path = ttk.Entry(file_frame, width=70)
        self.batch_file_path.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 10))
        
        self.batch_browse_btn = ttk.Button(file_frame, text="浏览...", width=10)
        self.batch_browse_btn.grid(row=0, column=2, pady=5, padx=(0, 5))
        
        self.batch_sample_btn = ttk.Button(file_frame, text="生成示例CSV", width=15)
        self.batch_sample_btn.grid(row=1, column=0, pady=5)
        
        self.batch_load_btn = ttk.Button(file_frame, text="加载数据", width=12)
        self.batch_load_btn.grid(row=1, column=1, sticky=tk.W, pady=5, padx=(10, 0))
        
        self.batch_data_count_label = ttk.Label(file_frame, text="已加载: 0 条数据", foreground="blue")
        self.batch_data_count_label.grid(row=1, column=2, pady=5, padx=(10, 0))
        
        action_frame = ttk.Frame(batch_frame)
        action_frame.grid(row=2, column=0, columnspan=4, pady=(0, 10))
        
        self.batch_calc_btn = ttk.Button(action_frame, text="批量计算", width=18)
        self.batch_calc_btn.grid(row=0, column=0, padx=10)
        
        self.batch_export_csv_btn = ttk.Button(action_frame, text="导出CSV", width=18)
        self.batch_export_csv_btn.grid(row=0, column=1, padx=10)
        
        self.batch_export_excel_btn = ttk.Button(action_frame, text="导出Excel报告", width=18)
        self.batch_export_excel_btn.grid(row=0, column=2, padx=10)
        
        self.batch_clear_btn = ttk.Button(action_frame, text="清空数据", width=18, command=self.clear_batch_data)
        self.batch_clear_btn.grid(row=0, column=3, padx=10)
        
        stats_frame = ttk.LabelFrame(batch_frame, text="统计信息", padding="10")
        stats_frame.grid(row=3, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(0, 10))
        stats_frame.columnconfigure(5, weight=1)
        
        self.stats_labels = {}
        stats_items = [
            ("总计:", "total"),
            ("成功:", "success"),
            ("失败:", "failed"),
            ("有警告:", "warning"),
            ("耗时:", "time")
        ]
        
        for i, (label_text, key) in enumerate(stats_items):
            ttk.Label(stats_frame, text=label_text).grid(row=0, column=i*2, sticky=tk.W, padx=(10 if i>0 else 0, 5))
            label = ttk.Label(stats_frame, text="-", font=("Arial", 10, "bold"))
            label.grid(row=0, column=i*2+1, sticky=tk.W)
            self.stats_labels[key] = label
        
        result_frame = ttk.LabelFrame(batch_frame, text="批量计算结果", padding="10")
        result_frame.grid(row=4, column=0, columnspan=4, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        result_frame.columnconfigure(0, weight=1)
        result_frame.rowconfigure(0, weight=1)
        
        columns = ("序号", "零件编号", "零件名称", "零件类型", "材料", "截面积", "拉应力", "安全系数", "状态")
        self.batch_result_tree = ttk.Treeview(result_frame, columns=columns, show="headings", height=15)
        
        col_widths = [60, 80, 100, 80, 80, 90, 90, 90, 80]
        for col, width in zip(columns, col_widths):
            self.batch_result_tree.heading(col, text=col)
            self.batch_result_tree.column(col, width=width, anchor="center")
        
        vsb = ttk.Scrollbar(result_frame, orient="vertical", command=self.batch_result_tree.yview)
        hsb = ttk.Scrollbar(result_frame, orient="horizontal", command=self.batch_result_tree.xview)
        self.batch_result_tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        self.batch_result_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        vsb.grid(row=0, column=1, sticky=(tk.N, tk.S))
        hsb.grid(row=1, column=0, sticky=(tk.W, tk.E))
        
        self.batch_result_tree.tag_configure("success", background="#E8F5E9")
        self.batch_result_tree.tag_configure("warning", background="#FFF3E0")
        self.batch_result_tree.tag_configure("error", background="#FFEBEE")
        
        self.batch_status_label = ttk.Label(batch_frame, text="", foreground="green")
        self.batch_status_label.grid(row=5, column=0, columnspan=4, pady=(5, 0))

    def get_single_input_data(self):
        try:
            data = {
                "part_id": self.single_part_id.get().strip(),
                "part_name": self.single_part_name.get().strip(),
                "part_type": self.single_part_type.get().strip(),
                "material": self.single_material.get().strip(),
                "length": float(self.single_length.get().strip()) if self.single_length.get().strip() else None,
                "width": float(self.single_width.get().strip()) if self.single_width.get().strip() else None,
                "height": float(self.single_height.get().strip()) if self.single_height.get().strip() else None,
                "force": float(self.single_force.get().strip()) if self.single_force.get().strip() else None,
                "force_direction": self.single_force_direction.get().strip()
            }
            return data
        except ValueError:
            messagebox.showerror("错误", "请输入有效的数值！")
            return None

    def display_single_results(self, calc_result):
        results = calc_result.get("results", {})
        
        for key, label in self.single_result_labels.items():
            value = results.get(key)
            if value is not None:
                if key in ["axial_strain", "safety_factor"]:
                    label.config(text=f"{value:.6f}")
                else:
                    label.config(text=f"{value:.4f}")
            else:
                label.config(text="-")
        
        material = results.get("material", "Q235")
        e = results.get("elastic_modulus", 206)
        ys = results.get("yield_strength", 235)
        self.material_info_label.config(text=f"{material} | E={e}GPa | σs={ys}MPa")
        
        self.validation_text.delete(1.0, tk.END)
        
        if calc_result.get("warnings"):
            self.validation_text.insert(tk.END, "【警告信息】\n", "warning")
            for w in calc_result["warnings"]:
                self.validation_text.insert(tk.END, f"⚠ {w}\n", "warning_text")
        
        if calc_result.get("errors"):
            self.validation_text.insert(tk.END, "\n【错误信息】\n", "error")
            for e in calc_result["errors"]:
                self.validation_text.insert(tk.END, f"✗ {e}\n", "error_text")
        
        if not calc_result.get("warnings") and not calc_result.get("errors"):
            self.validation_text.insert(tk.END, "✓ 所有校验通过，计算结果有效", "success")
        
        self.validation_text.tag_configure("warning", foreground="#FF9800", font=("Arial", 10, "bold"))
        self.validation_text.tag_configure("warning_text", foreground="#F57C00")
        self.validation_text.tag_configure("error", foreground="#F44336", font=("Arial", 10, "bold"))
        self.validation_text.tag_configure("error_text", foreground="#D32F2F")
        self.validation_text.tag_configure("success", foreground="#4CAF50", font=("Arial", 10, "bold"))

    def clear_single_inputs(self):
        self.single_part_id.delete(0, tk.END)
        self.single_part_name.delete(0, tk.END)
        self.single_part_type.set("")
        self.single_material.current(0)
        self.single_length.delete(0, tk.END)
        self.single_width.delete(0, tk.END)
        self.single_height.delete(0, tk.END)
        self.single_force.delete(0, tk.END)
        self.single_force_direction.set("")
        self.single_status_label.config(text="")
        self.validation_text.delete(1.0, tk.END)
        self.material_info_label.config(text="Q235 | E=206GPa | σs=235MPa")
        for label in self.single_result_labels.values():
            label.config(text="-")

    def show_single_status(self, message, is_success=True):
        color = "green" if is_success else "red"
        self.single_status_label.config(text=message, foreground=color)

    def update_batch_data_count(self, count):
        self.batch_data_count_label.config(text=f"已加载: {count} 条数据")

    def update_stats(self, total=0, success=0, failed=0, warning=0, elapsed_time=0):
        self.stats_labels["total"].config(text=f"{total}")
        self.stats_labels["success"].config(text=f"{success}", foreground="green" if success > 0 else "black")
        self.stats_labels["failed"].config(text=f"{failed}", foreground="red" if failed > 0 else "black")
        self.stats_labels["warning"].config(text=f"{warning}", foreground="orange" if warning > 0 else "black")
        self.stats_labels["time"].config(text=f"{elapsed_time:.3f}s")

    def display_batch_results(self, results):
        for item in self.batch_result_tree.get_children():
            self.batch_result_tree.delete(item)
        
        success_count = 0
        warning_count = 0
        
        for r in results:
            res = r.get("results", {})
            is_success = r.get("success", False)
            has_warning = len(r.get("warnings", [])) > 0
            
            if is_success:
                success_count += 1
            if has_warning:
                warning_count += 1
            
            if is_success and not has_warning:
                tag = "success"
            elif has_warning:
                tag = "warning"
            else:
                tag = "error"
            
            status = "✓" if is_success else "✗"
            
            self.batch_result_tree.insert("", "end", values=(
                r["index"],
                r["part_id"],
                r["part_name"],
                r["part_type"],
                res.get("material", ""),
                f"{res.get('cross_sectional_area', '-'):.2f}" if res.get("cross_sectional_area") else "-",
                f"{res.get('tensile_stress', '-'):.2f}" if res.get("tensile_stress") else "-",
                f"{res.get('safety_factor', '-'):.3f}" if res.get("safety_factor") else "-",
                status
            ), tags=(tag,))
        
        return success_count, len(results) - success_count, warning_count

    def clear_batch_data(self):
        self.batch_file_path.delete(0, tk.END)
        for item in self.batch_result_tree.get_children():
            self.batch_result_tree.delete(item)
        self.update_batch_data_count(0)
        self.update_stats()
        self.batch_status_label.config(text="")

    def show_batch_status(self, message, is_success=True):
        color = "green" if is_success else "red"
        self.batch_status_label.config(text=message, foreground=color)
