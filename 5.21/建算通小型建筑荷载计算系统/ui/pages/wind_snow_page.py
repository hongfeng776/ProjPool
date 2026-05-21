import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import config
import os
from core.calculator import WindSnowCalculator
from core.project_manager import ProjectManager
from core.report_generator import ReportGenerator
from core.pdf_exporter import PDFExporter


class WindSnowPage(ttk.Frame):
    def __init__(self, parent, db_manager=None, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.db = db_manager
        self.calculator = WindSnowCalculator(db_manager)
        self.project_manager = ProjectManager()
        self.report_generator = ReportGenerator()
        self.pdf_exporter = PDFExporter()
        self.last_wind_result = None
        self.last_wind_inputs = None
        self.last_snow_result = None
        self.last_snow_inputs = None
        self._build_ui()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=30)

        title_label = ttk.Label(
            container,
            text="风荷载与雪荷载计算",
            font=(config.FONT_FAMILY, 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(0, 10))

        subtitle_label = ttk.Label(
            container,
            text="输入地区、建筑高度和体型系数，自动计算风荷载与雪荷载标准值（依据 GB50009-2012）",
            font=(config.FONT_FAMILY, 11),
            style="Subtitle.TLabel"
        )
        subtitle_label.pack(pady=(0, 25))

        notebook = ttk.Notebook(container)
        notebook.pack(fill="both", expand=True, padx=40)

        wind_frame = ttk.Frame(notebook, style="Page.TFrame")
        snow_frame = ttk.Frame(notebook, style="Page.TFrame")
        notebook.add(wind_frame, text="💨 风荷载计算")
        notebook.add(snow_frame, text="❄️ 雪荷载计算")

        self._build_wind_tab(wind_frame)
        self._build_snow_tab(snow_frame)

    def _build_wind_tab(self, parent):
        outer = ttk.Frame(parent, style="Page.TFrame")
        outer.pack(fill="both", expand=True, padx=20, pady=20)

        form_card = tk.Frame(
            outer,
            bg="#FFFFFF",
            highlightbackground="#E0E0E0",
            highlightthickness=1
        )
        form_card.pack(fill="x")

        form_inner = tk.Frame(form_card, bg="#FFFFFF")
        form_inner.pack(fill="x", padx=40, pady=25)

        self.wind_name_var = tk.StringVar(value="示例建筑")
        self.wind_region_var = tk.StringVar(value="北京")
        self.wind_height_var = tk.StringVar(value="30")
        self.wind_shape_var = tk.StringVar(value="1.3")

        region_options = self.calculator.get_region_options()

        self._add_form_field(form_inner, "建筑名称", 0, self.wind_name_var, "text")

        tk.Label(
            form_inner,
            text="所在地区",
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=1, column=0, sticky="e", pady=12, padx=10)
        ttk.Combobox(
            form_inner,
            textvariable=self.wind_region_var,
            values=region_options,
            state="readonly",
            font=(config.FONT_FAMILY, 11),
            width=25
        ).grid(row=1, column=1, sticky="w", pady=12, padx=10)

        self._add_form_field(form_inner, "建筑高度 (m)", 2, self.wind_height_var, "number")
        self._add_form_field(form_inner, "体型系数 μs", 3, self.wind_shape_var, "number")

        hint_label = tk.Label(
            form_inner,
            text="提示：体型系数 μs 参考：矩形封闭式建筑1.3，圆形建筑0.8，迎风面0.8，背风面-0.5",
            font=(config.FONT_FAMILY, 9),
            bg="#FFFFFF",
            fg="#9E9E9E"
        )
        hint_label.grid(row=4, column=0, columnspan=2, sticky="w", pady=(5, 10), padx=10)

        btn_frame = tk.Frame(form_inner, bg="#FFFFFF")
        btn_frame.grid(row=5, column=0, columnspan=2, pady=(15, 5))

        tk.Button(
            btn_frame,
            text="🔢 计算风荷载",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            padx=30,
            pady=10,
            borderwidth=0,
            cursor="hand2",
            activebackground="#1565C0",
            activeforeground="#FFFFFF",
            command=self._on_calculate_wind
        ).pack(side="left", padx=5)

        tk.Button(
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
            command=self._on_reset_wind
        ).pack(side="left", padx=5)

        tk.Button(
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
            command=self._on_open_wind_snow_project
        ).pack(side="left", padx=5)

        form_inner.grid_columnconfigure(1, weight=1)

        self.wind_result_frame = tk.Frame(outer, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        self.wind_result_frame.pack(fill="x", pady=20)
        self.wind_result_frame.pack_forget()

    def _build_snow_tab(self, parent):
        outer = ttk.Frame(parent, style="Page.TFrame")
        outer.pack(fill="both", expand=True, padx=20, pady=20)

        form_card = tk.Frame(
            outer,
            bg="#FFFFFF",
            highlightbackground="#E0E0E0",
            highlightthickness=1
        )
        form_card.pack(fill="x")

        form_inner = tk.Frame(form_card, bg="#FFFFFF")
        form_inner.pack(fill="x", padx=40, pady=25)

        self.snow_name_var = tk.StringVar(value="示例建筑")
        self.snow_region_var = tk.StringVar(value="北京")
        self.snow_roof_var = tk.StringVar(value="平屋面(i≤5°)")

        region_options = self.calculator.get_region_options()
        roof_options = self.calculator.get_roof_options()

        self._add_form_field(form_inner, "建筑名称", 0, self.snow_name_var, "text")

        tk.Label(
            form_inner,
            text="所在地区",
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=1, column=0, sticky="e", pady=12, padx=10)
        ttk.Combobox(
            form_inner,
            textvariable=self.snow_region_var,
            values=region_options,
            state="readonly",
            font=(config.FONT_FAMILY, 11),
            width=25
        ).grid(row=1, column=1, sticky="w", pady=12, padx=10)

        tk.Label(
            form_inner,
            text="屋面类型",
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=2, column=0, sticky="e", pady=12, padx=10)
        ttk.Combobox(
            form_inner,
            textvariable=self.snow_roof_var,
            values=roof_options,
            state="readonly",
            font=(config.FONT_FAMILY, 11),
            width=25
        ).grid(row=2, column=1, sticky="w", pady=12, padx=10)

        hint_label = tk.Label(
            form_inner,
            text="提示：积雪分布系数 μr 依据屋面坡度和形式确定（GB50009-2012 表6.2.1）",
            font=(config.FONT_FAMILY, 9),
            bg="#FFFFFF",
            fg="#9E9E9E"
        )
        hint_label.grid(row=3, column=0, columnspan=2, sticky="w", pady=(5, 10), padx=10)

        btn_frame = tk.Frame(form_inner, bg="#FFFFFF")
        btn_frame.grid(row=4, column=0, columnspan=2, pady=(15, 5))

        tk.Button(
            btn_frame,
            text="🔢 计算雪荷载",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg="#388E3C",
            fg="#FFFFFF",
            padx=30,
            pady=10,
            borderwidth=0,
            cursor="hand2",
            activebackground="#2E7D32",
            activeforeground="#FFFFFF",
            command=self._on_calculate_snow
        ).pack(side="left", padx=5)

        tk.Button(
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
            command=self._on_reset_snow
        ).pack(side="left", padx=5)

        form_inner.grid_columnconfigure(1, weight=1)

        self.snow_result_frame = tk.Frame(outer, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        self.snow_result_frame.pack(fill="x", pady=20)
        self.snow_result_frame.pack_forget()

    def _add_form_field(self, parent, label_text, row, variable, field_type="text"):
        tk.Label(
            parent,
            text=label_text,
            font=(config.FONT_FAMILY, 11),
            bg="#FFFFFF",
            fg="#424242"
        ).grid(row=row, column=0, sticky="e", pady=12, padx=10)

        tk.Entry(
            parent,
            textvariable=variable,
            font=(config.FONT_FAMILY, 11),
            width=28,
            relief="solid",
            borderwidth=1,
            highlightthickness=1,
            highlightbackground="#E0E0E0",
            highlightcolor=config.COLOR_PRIMARY
        ).grid(row=row, column=1, sticky="w", pady=12, padx=10)

    def _on_calculate_wind(self):
        try:
            name = self.wind_name_var.get().strip() or "未命名建筑"
            region = self.wind_region_var.get()
            height = float(self.wind_height_var.get())
            shape = float(self.wind_shape_var.get())

            if height <= 0:
                raise ValueError("建筑高度必须大于0")
            if shape <= 0:
                raise ValueError("体型系数必须大于0")

            results = self.calculator.calculate_wind_load(
                region=region,
                height=height,
                shape_factor=shape,
                building_name=name
            )

            self.last_wind_result = results
            self.last_wind_inputs = {
                "building_name": name,
                "region": region,
                "height": height,
                "shape_factor": shape
            }
            self._display_wind_results(results, name)
            messagebox.showinfo("计算成功", f"「{name}」风荷载计算完成！\n\n风荷载标准值: {results['风荷载标准值 wk']['value']:.4f} kN/m²\n\n已保存到数据库。")

        except ValueError as e:
            messagebox.showerror("输入错误", f"请检查输入：{str(e)}")
        except Exception as e:
            messagebox.showerror("计算错误", f"计算过程中出现错误：{str(e)}")

    def _on_reset_wind(self):
        self.wind_name_var.set("示例建筑")
        self.wind_region_var.set("北京")
        self.wind_height_var.set("30")
        self.wind_shape_var.set("1.3")
        self.wind_result_frame.pack_forget()

    def _on_calculate_snow(self):
        try:
            name = self.snow_name_var.get().strip() or "未命名建筑"
            region = self.snow_region_var.get()
            roof = self.snow_roof_var.get()

            results = self.calculator.calculate_snow_load(
                region=region,
                roof_type=roof,
                building_name=name
            )

            self.last_snow_result = results
            self.last_snow_inputs = {
                "building_name": name,
                "region": region,
                "roof_type": roof
            }
            self._display_snow_results(results, name)
            messagebox.showinfo("计算成功", f"「{name}」雪荷载计算完成！\n\n雪荷载标准值: {results['雪荷载标准值 sk']['value']:.4f} kN/m²\n\n已保存到数据库。")

        except Exception as e:
            messagebox.showerror("计算错误", f"计算过程中出现错误：{str(e)}")

    def _on_reset_snow(self):
        self.snow_name_var.set("示例建筑")
        self.snow_region_var.set("北京")
        self.snow_roof_var.set("平屋面(i≤5°)")
        self.snow_result_frame.pack_forget()

    def _display_wind_results(self, results, name):
        for widget in self.wind_result_frame.winfo_children():
            widget.destroy()

        self.wind_result_frame.pack(fill="x", pady=20)

        header = tk.Frame(self.wind_result_frame, bg=config.COLOR_PRIMARY)
        header.pack(fill="x")

        tk.Label(
            header,
            text=f"🌬️ 风荷载计算结果 - {name}",
            font=(config.FONT_FAMILY, 13, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF"
        ).pack(side="left", padx=20, pady=12)

        tk.Label(
            header,
            text=f"wk = βz × μs × μz × w0",
            font=(config.FONT_FAMILY, 9),
            bg=config.COLOR_PRIMARY,
            fg="#BBDEFB"
        ).pack(side="right", padx=20, pady=12)

        tree_frame = tk.Frame(self.wind_result_frame, bg="#FFFFFF")
        tree_frame.pack(fill="x", padx=20, pady=20)

        style = ttk.Style()
        style.configure(
            "WindResult.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=28
        )
        style.configure(
            "WindResult.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E3F2FD",
            foreground="#1976D2"
        )
        style.map("WindResult.Treeview", background=[("selected", "#BBDEFB")], foreground=[("selected", "#0D47A1")])

        columns = ("item", "value", "unit")
        tree = ttk.Treeview(
            tree_frame,
            columns=columns,
            show="headings",
            style="WindResult.Treeview",
            height=7
        )
        tree.heading("item", text="项目")
        tree.heading("value", text="数值")
        tree.heading("unit", text="单位")
        tree.column("item", width=220, anchor="w")
        tree.column("value", width=150, anchor="e")
        tree.column("unit", width=100, anchor="center")

        text_keys = ["所在地区"]
        highlight_key = "风荷载标准值 wk"

        for key, data in results.items():
            if data.get("is_text"):
                val = str(data["value"])
            else:
                val = f"{data['value']:.4f}"

            display_key = key
            tags = ()
            if key == highlight_key:
                display_key = f"⭐ {key}"
                tags = ("highlight",)

            tree.insert("", "end", values=(display_key, val, data["unit"]), tags=tags)

        tree.tag_configure("highlight", background="#E3F2FD", foreground="#1565C0", font=(config.FONT_FAMILY, 10, "bold"))

        tree.pack(fill="x")

        self._add_wind_action_buttons()

    def _add_wind_action_buttons(self):
        action_frame = tk.Frame(self.wind_result_frame, bg="#FFFFFF")
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
            command=self._on_save_wind_project
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
            command=self._on_generate_wind_report
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
            command=self._on_export_wind_pdf
        ).pack(side="left", padx=5)

    def _display_snow_results(self, results, name):
        for widget in self.snow_result_frame.winfo_children():
            widget.destroy()

        self.snow_result_frame.pack(fill="x", pady=20)

        header = tk.Frame(self.snow_result_frame, bg="#388E3C")
        header.pack(fill="x")

        tk.Label(
            header,
            text=f"❄️ 雪荷载计算结果 - {name}",
            font=(config.FONT_FAMILY, 13, "bold"),
            bg="#388E3C",
            fg="#FFFFFF"
        ).pack(side="left", padx=20, pady=12)

        tk.Label(
            header,
            text=f"sk = μr × s0",
            font=(config.FONT_FAMILY, 9),
            bg="#388E3C",
            fg="#C8E6C9"
        ).pack(side="right", padx=20, pady=12)

        tree_frame = tk.Frame(self.snow_result_frame, bg="#FFFFFF")
        tree_frame.pack(fill="x", padx=20, pady=20)

        style = ttk.Style()
        style.configure(
            "SnowResult.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=28
        )
        style.configure(
            "SnowResult.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E8F5E9",
            foreground="#2E7D32"
        )
        style.map("SnowResult.Treeview", background=[("selected", "#C8E6C9")], foreground=[("selected", "#1B5E20")])

        columns = ("item", "value", "unit")
        tree = ttk.Treeview(
            tree_frame,
            columns=columns,
            show="headings",
            style="SnowResult.Treeview",
            height=6
        )
        tree.heading("item", text="项目")
        tree.heading("value", text="数值")
        tree.heading("unit", text="单位")
        tree.column("item", width=220, anchor="w")
        tree.column("value", width=150, anchor="e")
        tree.column("unit", width=100, anchor="center")

        highlight_key = "雪荷载标准值 sk"

        for key, data in results.items():
            if data.get("is_text"):
                val = str(data["value"])
            else:
                val = f"{data['value']:.4f}"

            display_key = key
            tags = ()
            if key == highlight_key:
                display_key = f"⭐ {key}"
                tags = ("highlight",)

            tree.insert("", "end", values=(display_key, val, data["unit"]), tags=tags)

        tree.tag_configure("highlight", background="#E8F5E9", foreground="#2E7D32", font=(config.FONT_FAMILY, 10, "bold"))

        tree.pack(fill="x")

        self._add_snow_action_buttons()

    def _add_snow_action_buttons(self):
        action_frame = tk.Frame(self.snow_result_frame, bg="#FFFFFF")
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
            command=self._on_save_snow_project
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
            command=self._on_generate_snow_report
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
            command=self._on_export_snow_pdf
        ).pack(side="left", padx=5)

    def _on_save_wind_project(self):
        if self.last_wind_result is None or self.last_wind_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再保存项目！")
            return
        try:
            filepath = self.project_manager.save_project(
                project_name=self.last_wind_inputs.get("building_name", "未命名"),
                project_type="风荷载计算",
                input_params=self.last_wind_inputs,
                results=self.last_wind_result
            )
            messagebox.showinfo("保存成功", f"项目已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("保存失败", f"保存项目时出错：{str(e)}")

    def _on_save_snow_project(self):
        if self.last_snow_result is None or self.last_snow_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再保存项目！")
            return
        try:
            filepath = self.project_manager.save_project(
                project_name=self.last_snow_inputs.get("building_name", "未命名"),
                project_type="雪荷载计算",
                input_params=self.last_snow_inputs,
                results=self.last_snow_result
            )
            messagebox.showinfo("保存成功", f"项目已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("保存失败", f"保存项目时出错：{str(e)}")

    def _on_generate_wind_report(self):
        if self.last_wind_result is None or self.last_wind_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再生成计算书！")
            return
        try:
            report_content = self.report_generator.generate_wind_report(
                input_params=self.last_wind_inputs,
                results=self.last_wind_result
            )

            default_filename = f"{self.last_wind_inputs.get('building_name', '计算书')}_风荷载计算书.txt"
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

    def _on_generate_snow_report(self):
        if self.last_snow_result is None or self.last_snow_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再生成计算书！")
            return
        try:
            report_content = self.report_generator.generate_snow_report(
                input_params=self.last_snow_inputs,
                results=self.last_snow_result
            )

            default_filename = f"{self.last_snow_inputs.get('building_name', '计算书')}_雪荷载计算书.txt"
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

    def _on_export_wind_pdf(self):
        if self.last_wind_result is None or self.last_wind_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再导出 PDF！")
            return
        try:
            report_content = self.report_generator.generate_wind_report(
                input_params=self.last_wind_inputs,
                results=self.last_wind_result
            )

            default_filename = f"{self.last_wind_inputs.get('building_name', '计算书')}_风荷载计算书.pdf"
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
                title="建筑风荷载计算书"
            )
            messagebox.showinfo("导出成功", f"PDF 已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("导出失败", f"导出 PDF 时出错：{str(e)}")

    def _on_export_snow_pdf(self):
        if self.last_snow_result is None or self.last_snow_inputs is None:
            messagebox.showwarning("提示", "请先进行计算后再导出 PDF！")
            return
        try:
            report_content = self.report_generator.generate_snow_report(
                input_params=self.last_snow_inputs,
                results=self.last_snow_result
            )

            default_filename = f"{self.last_snow_inputs.get('building_name', '计算书')}_雪荷载计算书.pdf"
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
                title="建筑雪荷载计算书"
            )
            messagebox.showinfo("导出成功", f"PDF 已保存到：\n{filepath}")
        except Exception as e:
            messagebox.showerror("导出失败", f"导出 PDF 时出错：{str(e)}")
