import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import config
import os
from core.calculator import LoadCalculator
from core.project_manager import ProjectManager
from core.report_generator import ReportGenerator
from core.pdf_exporter import PDFExporter


class LoadInputPage(ttk.Frame):
    def __init__(self, parent, db_manager=None, on_calculate_complete=None, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.db = db_manager
        self.on_calculate_complete = on_calculate_complete
        self.calculator = LoadCalculator(db_manager)
        self.project_manager = ProjectManager()
        self.report_generator = ReportGenerator()
        self.pdf_exporter = PDFExporter()
        self.last_result = None
        self.last_inputs = None
        self._build_ui()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=30)

        title_label = ttk.Label(
            container,
            text="荷载录入与计算",
            font=(config.FONT_FAMILY, 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(0, 10))

        subtitle_label = ttk.Label(
            container,
            text="输入建筑参数，自动计算恒荷载和活荷载标准值",
            font=(config.FONT_FAMILY, 11),
            style="Subtitle.TLabel"
        )
        subtitle_label.pack(pady=(0, 25))

        form_card = tk.Frame(
            container,
            bg="#FFFFFF",
            highlightbackground="#E0E0E0",
            highlightthickness=1
        )
        form_card.pack(fill="x", padx=60, pady=10)

        form_inner = tk.Frame(form_card, bg="#FFFFFF")
        form_inner.pack(fill="x", padx=40, pady=30)

        self.name_var = tk.StringVar(value="示例建筑")
        self.area_var = tk.StringVar(value="100")
        self.height_var = tk.StringVar(value="3.0")
        self.wall_var = tk.StringVar(value="0.2")
        self.type_var = tk.StringVar(value="住宅")

        self._add_form_field(form_inner, "建筑名称", 0, self.name_var, "text")
        self._add_form_field(form_inner, "楼层面积 (m²)", 1, self.area_var, "number")
        self._add_form_field(form_inner, "层高 (m)", 2, self.height_var, "number")
        self._add_form_field(form_inner, "墙体厚度 (m)", 3, self.wall_var, "number")

        type_options = self.calculator.get_live_load_options()

        tk.Label(
            form_inner,
            text="使用功能",
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=4, column=0, sticky="e", pady=15, padx=10)

        type_combobox = ttk.Combobox(
            form_inner,
            textvariable=self.type_var,
            values=type_options,
            state="readonly",
            font=(config.FONT_FAMILY, 11),
            width=25
        )
        type_combobox.grid(row=4, column=1, sticky="w", pady=15, padx=10)

        hint_label = tk.Label(
            form_inner,
            text="提示：使用功能决定了活荷载标准值的取值（依据 GB50009-2012）",
            font=(config.FONT_FAMILY, 9),
            bg="#FFFFFF",
            fg="#9E9E9E"
        )
        hint_label.grid(row=5, column=0, columnspan=2, sticky="w", pady=(5, 10), padx=10)

        btn_frame = tk.Frame(form_inner, bg="#FFFFFF")
        btn_frame.grid(row=6, column=0, columnspan=2, pady=(20, 10))

        calc_btn = tk.Button(
            btn_frame,
            text="🔢 开始计算",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            padx=30,
            pady=10,
            borderwidth=0,
            cursor="hand2",
            activebackground="#1565C0",
            activeforeground="#FFFFFF",
            command=self._on_calculate
        )
        calc_btn.pack(side="left", padx=5)

        clear_btn = tk.Button(
            btn_frame,
            text="重置",
            font=(config.FONT_FAMILY, 11),
            bg="#E0E0E0",
            fg="#424242",
            padx=20,
            pady=10,
            borderwidth=0,
            cursor="hand2",
            activebackground="#BDBDBD",
            activeforeground="#424242",
            command=self._on_reset
        )
        clear_btn.pack(side="left", padx=5)

        open_btn = tk.Button(
            btn_frame,
            text="📂 打开项目",
            font=(config.FONT_FAMILY, 11),
            bg="#7B1FA2",
            fg="#FFFFFF",
            padx=20,
            pady=10,
            borderwidth=0,
            cursor="hand2",
            activebackground="#6A1B9A",
            activeforeground="#FFFFFF",
            command=self._on_open_project
        )
        open_btn.pack(side="left", padx=5)

        self.result_frame = tk.Frame(container, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        self.result_frame.pack(fill="both", expand=True, padx=60, pady=20)
        self.result_frame.pack_forget()

        form_inner.grid_columnconfigure(1, weight=1)

    def _add_form_field(self, parent, label_text, row, variable, field_type="text"):
        tk.Label(
            parent,
            text=label_text,
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=row, column=0, sticky="e", pady=12, padx=10)

        entry = tk.Entry(
            parent,
            textvariable=variable,
            font=(config.FONT_FAMILY, 11),
            width=28,
            relief="solid",
            borderwidth=1,
            highlightthickness=1,
            highlightbackground="#E0E0E0",
            highlightcolor=config.COLOR_PRIMARY
        )
        entry.grid(row=row, column=1, sticky="w", pady=12, padx=10)

    def _on_calculate(self):
        try:
            name = self.name_var.get().strip() or "未命名建筑"
            area = float(self.area_var.get())
            height = float(self.height_var.get())
            wall = float(self.wall_var.get())
            b_type = self.type_var.get()

            if area <= 0 or height <= 0 or wall <= 0:
                raise ValueError("所有尺寸参数必须大于0")

            results = self.calculator.calculate(
                area=area,
                floor_height=height,
                wall_thickness=wall,
                building_type=b_type,
                building_name=name
            )

            self.last_result = results
            self.last_inputs = {
                "building_name": name,
                "area": area,
                "floor_height": height,
                "wall_thickness": wall,
                "building_type": b_type
            }
            self._display_results(results, name, area, height, wall, b_type)

            if self.on_calculate_complete:
                self.on_calculate_complete(results)

            messagebox.showinfo("计算成功", f"建筑「{name}」荷载计算完成！\n\n已保存到数据库。")

        except ValueError as e:
            messagebox.showerror("输入错误", f"请检查输入：{str(e)}")
        except Exception as e:
            messagebox.showerror("计算错误", f"计算过程中出现错误：{str(e)}")

    def _on_reset(self):
        self.name_var.set("示例建筑")
        self.area_var.set("100")
        self.height_var.set("3.0")
        self.wall_var.set("0.2")
        self.type_var.set("住宅")
        self.result_frame.pack_forget()

    def _display_results(self, results, name, area, height, wall, b_type):
        for widget in self.result_frame.winfo_children():
            widget.destroy()

        self.result_frame.pack(fill="both", expand=True, padx=60, pady=20)

        header = tk.Frame(self.result_frame, bg=config.COLOR_PRIMARY)
        header.pack(fill="x")

        tk.Label(
            header,
            text=f"📋 计算结果 - {name}",
            font=(config.FONT_FAMILY, 13, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF"
        ).pack(side="left", padx=20, pady=12)

        info_text = f"面积:{area}m²  层高:{height}m  墙厚:{wall}m  类型:{b_type}"
        tk.Label(
            header,
            text=info_text,
            font=(config.FONT_FAMILY, 9),
            bg=config.COLOR_PRIMARY,
            fg="#BBDEFB"
        ).pack(side="right", padx=20, pady=12)

        tree_frame = tk.Frame(self.result_frame, bg="#FFFFFF")
        tree_frame.pack(fill="both", expand=True, padx=20, pady=20)

        style = ttk.Style()
        style.configure(
            "Result.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=30
        )
        style.configure(
            "Result.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E3F2FD",
            foreground="#1976D2"
        )
        style.map("Result.Treeview", background=[("selected", "#BBDEFB")], foreground=[("selected", "#0D47A1")])

        columns = ("item", "value", "unit")
        tree = ttk.Treeview(
            tree_frame,
            columns=columns,
            show="headings",
            style="Result.Treeview",
            height=12
        )

        tree.heading("item", text="荷载项目")
        tree.heading("value", text="数值")
        tree.heading("unit", text="单位")

        tree.column("item", width=220, anchor="w")
        tree.column("value", width=150, anchor="e")
        tree.column("unit", width=100, anchor="center")

        dead_items = ["楼板自重", "楼面装修", "吊顶重量", "墙体重量", "门窗重量"]
        live_items = ["活载标准值(面荷载)", "活载标准值(总荷载)"]
        summary_items = ["恒载标准值(面荷载)", "恒载标准值(总荷载)", "荷载组合(1.2恒+1.4活)", "总荷载设计值"]

        for key, data in results.items():
            val = f"{data['value']:.3f}"
            tags = ()
            if key in dead_items:
                tags = ("dead",)
            elif key in live_items:
                tags = ("live",)
            elif key in summary_items:
                tags = ("summary",)

            display_key = key
            if key == "恒载标准值(面荷载)":
                display_key = "👉 恒载标准值(面荷载)"
            elif key == "活载标准值(面荷载)":
                display_key = "👉 活载标准值(面荷载)"
            elif key == "荷载组合(1.2恒+1.4活)":
                display_key = "⭐ 荷载组合(1.2恒+1.4活)"

            tree.insert("", "end", values=(display_key, val, data["unit"]), tags=tags)

        tree.tag_configure("dead", background="#FFF3E0", foreground="#E65100")
        tree.tag_configure("live", background="#E8F5E9", foreground="#2E7D32")
        tree.tag_configure("summary", background="#E3F2FD", foreground="#1565C0", font=(config.FONT_FAMILY, 10, "bold"))

        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)

        tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        legend_frame = tk.Frame(self.result_frame, bg="#FFFFFF")
        legend_frame.pack(fill="x", padx=20, pady=(0, 15))

        legends = [
            ("#FFF3E0", "恒荷载组成"),
            ("#E8F5E9", "活荷载"),
            ("#E3F2FD", "汇总结果")
        ]
        for color, text in legends:
            frame = tk.Frame(legend_frame, bg="#FFFFFF")
            frame.pack(side="left", padx=15)
            tk.Frame(frame, bg=color, width=16, height=16, highlightbackground="#E0E0E0", highlightthickness=1).pack(side="left")
            tk.Label(frame, text=text, font=(config.FONT_FAMILY, 9), bg="#FFFFFF", fg="#757575").pack(side="left", padx=5)

        action_frame = tk.Frame(self.result_frame, bg="#FFFFFF")
        action_frame.pack(fill="x", padx=20, pady=(10, 20))

        tk.Button(
            action_frame,
            text="💾 保存项目",
            font=(config.FONT_FAMILY, 10),
            bg="#4CAF50",
            fg="#FFFFFF",
            padx=18,
            pady=8,
            borderwidth=0,
            cursor="hand2",
            activebackground="#388E3C",
            activeforeground="#FFFFFF",
            command=self._on_save_project
        ).pack(side="left", padx=5)

        tk.Button(
            action_frame,
            text="📄 生成计算书",
            font=(config.FONT_FAMILY, 10),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            padx=18,
            pady=8,
            borderwidth=0,
            cursor="hand2",
            activebackground="#1565C0",
            activeforeground="#FFFFFF",
            command=self._on_generate_report
        ).pack(side="left", padx=5)

        tk.Button(
            action_frame,
            text="📑 导出 PDF",
            font=(config.FONT_FAMILY, 10),
            bg="#E91E63",
            fg="#FFFFFF",
            padx=18,
            pady=8,
            borderwidth=0,
            cursor="hand2",
            activebackground="#C2185B",
            activeforeground="#FFFFFF",
            command=self._on_export_pdf
        ).pack(side="left", padx=5)

    def _on_save_project(self):
        if self.last_result is None or self.last_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再保存项目！")
            return
        try:
            filepath = self.project_manager.save_project(
                project_name=self.last_inputs.get("building_name", "未命名"),
                project_type="恒活荷载计算",
                input_params=self.last_inputs,
                results=self.last_result
            )
            messagebox.showinfo("保存成功", f"项目已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("保存失败", f"保存项目时出错：{str(e)}")

    def _on_open_project(self):
        filepath = filedialog.askopenfilename(
            title="打开项目",
            filetypes=[("项目文件", "*.json"), ("所有文件", "*.*")],
            initialdir=self.project_manager.projects_dir
        )
        if not filepath:
            return
        try:
            project_data = self.project_manager.load_project(filepath)
            if project_data is None:
                raise ValueError("无法加载项目文件")

            inputs = project_data.get("input_params", {})
            results = project_data.get("results", {})

            self.name_var.set(inputs.get("building_name", ""))
            self.area_var.set(str(inputs.get("area", "")))
            self.height_var.set(str(inputs.get("floor_height", "")))
            self.wall_var.set(str(inputs.get("wall_thickness", "")))
            self.type_var.set(inputs.get("building_type", "办公楼"))

            self.last_inputs = inputs
            self.last_result = results
            self._display_results(
                results,
                inputs.get("building_name", ""),
                inputs.get("area", 0),
                inputs.get("floor_height", 0),
                inputs.get("wall_thickness", 0),
                inputs.get("building_type", "办公楼")
            )

            messagebox.showinfo("加载成功", f"项目已加载：{project_data.get('project_name', '')}")
        except Exception as e:
            messagebox.showerror("加载失败", f"加载项目时出错：{str(e)}")

    def _on_generate_report(self):
        if self.last_result is None or self.last_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再生成计算书！")
            return
        try:
            report_content = self.report_generator.generate_dead_live_report(
                input_params=self.last_inputs,
                results=self.last_result
            )

            default_filename = f"{self.last_inputs.get('building_name', '计算书')}_恒活荷载计算书.txt"
            filepath = filedialog.asksaveasfilename(
                title="保存计算书",
                defaultextension=".txt",
                initialfile=default_filename,
                filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")]
            )
            if not filepath:
                return

            self.report_generator.report_to_text(report_content, filepath)
            messagebox.showinfo("生成成功", f"计算书已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("生成失败", f"生成计算书时出错：{str(e)}")

    def _on_export_pdf(self):
        if self.last_result is None or self.last_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再导出 PDF！")
            return
        try:
            report_content = self.report_generator.generate_dead_live_report(
                input_params=self.last_inputs,
                results=self.last_result
            )

            default_filename = f"{self.last_inputs.get('building_name', '计算书')}_恒活荷载计算书.pdf"
            filepath = filedialog.asksaveasfilename(
                title="导出 PDF",
                defaultextension=".pdf",
                initialfile=default_filename,
                filetypes=[("PDF 文件", "*.pdf"), ("所有文件", "*.*")]
            )
            if not filepath:
                return

            self.pdf_exporter.export_to_pdf(
                report_content=report_content,
                output_path=filepath,
                title="建筑恒荷载与活荷载计算书"
            )
            messagebox.showinfo("导出成功", f"PDF 已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("导出失败", f"导出 PDF 时出错：{str(e)}")
