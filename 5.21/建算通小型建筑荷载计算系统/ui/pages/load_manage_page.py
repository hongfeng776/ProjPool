import tkinter as tk
from tkinter import ttk, messagebox
import config
from core.calculator import LoadCalculator, LOAD_PARAMS


class LoadManagePage(ttk.Frame):
    def __init__(self, parent, db_manager=None, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.db = db_manager
        self._build_ui()
        self.load_load_cases()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=30)

        title_label = ttk.Label(
            container,
            text="荷载管理",
            font=(config.FONT_FAMILY, 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(0, 10))

        subtitle_label = ttk.Label(
            container,
            text="查看和管理已录入的荷载工况",
            font=(config.FONT_FAMILY, 11),
            style="Subtitle.TLabel"
        )
        subtitle_label.pack(pady=(0, 20))

        info_card = tk.Frame(
            container,
            bg="#E3F2FD",
            highlightbackground="#90CAF9",
            highlightthickness=1
        )
        info_card.pack(fill="x", padx=10, pady=(0, 20))

        tk.Label(
            info_card,
            text="📖 活荷载标准值参考表（GB50009-2012）",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg="#E3F2FD",
            fg="#1565C0"
        ).pack(anchor="w", padx=20, pady=(15, 10))

        params_frame = tk.Frame(info_card, bg="#E3F2FD")
        params_frame.pack(fill="x", padx=20, pady=(0, 15))

        columns = ("type", "live_load", "wall_density", "floor_thickness")
        params_tree = ttk.Treeview(
            params_frame,
            columns=columns,
            show="headings",
            height=6
        )

        params_tree.heading("type", text="建筑类型")
        params_tree.heading("live_load", text="活载标准值 (kN/m²)")
        params_tree.heading("wall_density", text="墙体容重 (kN/m³)")
        params_tree.heading("floor_thickness", text="楼板厚度 (m)")

        params_tree.column("type", width=150, anchor="center")
        params_tree.column("live_load", width=160, anchor="center")
        params_tree.column("wall_density", width=150, anchor="center")
        params_tree.column("floor_thickness", width=150, anchor="center")

        for b_type, params in LOAD_PARAMS.items():
            params_tree.insert(
                "", "end",
                values=(b_type, params["live_load"], params["wall_density"], params["floor_thickness"])
            )

        p_scroll = ttk.Scrollbar(params_frame, orient="vertical", command=params_tree.yview)
        params_tree.configure(yscrollcommand=p_scroll.set)

        params_tree.pack(side="left", fill="both", expand=True)
        p_scroll.pack(side="right", fill="y")

        toolbar = tk.Frame(container, bg=config.COLOR_BACKGROUND)
        toolbar.pack(fill="x", padx=10, pady=(0, 10))

        refresh_btn = tk.Button(
            toolbar,
            text="🔄 刷新",
            font=(config.FONT_FAMILY, 10),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#1565C0",
            activeforeground="#FFFFFF",
            command=self.load_load_cases
        )
        refresh_btn.pack(side="left", padx=5)

        add_btn = tk.Button(
            toolbar,
            text="➕ 新增荷载",
            font=(config.FONT_FAMILY, 10),
            bg="#388E3C",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#2E7D32",
            activeforeground="#FFFFFF",
            command=self.add_load_case
        )
        add_btn.pack(side="left", padx=5)

        delete_btn = tk.Button(
            toolbar,
            text="🗑️ 删除",
            font=(config.FONT_FAMILY, 10),
            bg="#D32F2F",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#B71C1C",
            activeforeground="#FFFFFF",
            command=self.delete_selected
        )
        delete_btn.pack(side="left", padx=5)

        self.count_label = tk.Label(
            toolbar,
            text="共 0 条荷载记录",
            font=(config.FONT_FAMILY, 10),
            bg=config.COLOR_BACKGROUND,
            fg="#757575"
        )
        self.count_label.pack(side="right", padx=10)

        table_card = tk.Frame(container, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        table_card.pack(fill="both", expand=True, padx=10)

        table_header = tk.Frame(table_card, bg=config.COLOR_SECONDARY)
        table_header.pack(fill="x")
        tk.Label(
            table_header,
            text="📋 已录入荷载工况列表",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg=config.COLOR_SECONDARY,
            fg="#FFFFFF"
        ).pack(side="left", padx=15, pady=10)

        style = ttk.Style()
        style.configure(
            "LoadManage.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=28
        )
        style.configure(
            "LoadManage.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E3F2FD",
            foreground="#1976D2"
        )
        style.map("LoadManage.Treeview", background=[("selected", "#BBDEFB")], foreground=[("selected", "#0D47A1")])

        columns = ("id", "building", "case_name", "load_type", "magnitude", "unit", "date")
        self.load_tree = ttk.Treeview(
            table_card,
            columns=columns,
            show="headings",
            style="LoadManage.Treeview",
            height=12
        )

        self.load_tree.heading("id", text="ID")
        self.load_tree.heading("building", text="所属建筑")
        self.load_tree.heading("case_name", text="荷载名称")
        self.load_tree.heading("load_type", text="荷载类型")
        self.load_tree.heading("magnitude", text="数值")
        self.load_tree.heading("unit", text="单位")
        self.load_tree.heading("date", text="录入时间")

        self.load_tree.column("id", width=50, anchor="center")
        self.load_tree.column("building", width=150, anchor="w")
        self.load_tree.column("case_name", width=180, anchor="w")
        self.load_tree.column("load_type", width=100, anchor="center")
        self.load_tree.column("magnitude", width=100, anchor="e")
        self.load_tree.column("unit", width=80, anchor="center")
        self.load_tree.column("date", width=140, anchor="center")

        scrollbar = ttk.Scrollbar(table_card, orient="vertical", command=self.load_tree.yview)
        self.load_tree.configure(yscrollcommand=scrollbar.set)

        self.load_tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        scrollbar.pack(side="right", fill="y", padx=(0, 10), pady=10)

    def load_load_cases(self):
        for item in self.load_tree.get_children():
            self.load_tree.delete(item)

        if self.db is None:
            return

        cases = self.db.query("""
            SELECT lc.id, b.name as building_name, lc.case_name,
                   lc.load_type, lc.magnitude, lc.unit, lc.created_at
            FROM load_cases lc
            LEFT JOIN buildings b ON lc.building_id = b.id
            ORDER BY lc.id DESC
        """)

        for c in cases:
            building_name = c["building_name"] if c["building_name"] else "未关联"
            self.load_tree.insert(
                "", "end",
                values=(
                    c["id"],
                    building_name,
                    c["case_name"],
                    c["load_type"] or "-",
                    f"{c['magnitude']:.2f}" if c["magnitude"] else "-",
                    c["unit"] or "-",
                    c["created_at"]
                )
            )

        self.count_label.config(text=f"共 {len(cases)} 条荷载记录")

    def add_load_case(self):
        if self.db is None:
            messagebox.showwarning("提示", "数据库未连接")
            return

        buildings = self.db.query("SELECT id, name FROM buildings ORDER BY id DESC")
        if not buildings:
            messagebox.showwarning("提示", "请先在「荷载录入」页面添加建筑并完成计算")
            return

        dialog = tk.Toplevel(self)
        dialog.title("新增荷载工况")
        dialog.geometry("420x420")
        dialog.configure(bg="#F5F5F5")
        dialog.transient(self)
        dialog.grab_set()

        frm = tk.Frame(dialog, bg="#F5F5F5")
        frm.pack(fill="both", expand=True, padx=25, pady=25)

        tk.Label(frm, text="新增荷载工况", font=(config.FONT_FAMILY, 15, "bold"), bg="#F5F5F5", fg="#424242").pack(pady=(0, 15))

        tk.Label(frm, text="所属建筑", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        building_options = [f"{b['id']} - {b['name']}" for b in buildings]
        building_var = tk.StringVar(value=building_options[0])
        ttk.Combobox(frm, textvariable=building_var, values=building_options, state="readonly", font=(config.FONT_FAMILY, 10)).pack(fill="x")

        tk.Label(frm, text="荷载名称", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        name_var = tk.StringVar(value="附加荷载")
        tk.Entry(frm, textvariable=name_var, font=(config.FONT_FAMILY, 10), relief="solid", borderwidth=1).pack(fill="x")

        tk.Label(frm, text="荷载类型", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        type_options = ["恒荷载", "活荷载", "风荷载", "雪荷载", "其他"]
        type_var = tk.StringVar(value=type_options[0])
        ttk.Combobox(frm, textvariable=type_var, values=type_options, state="readonly", font=(config.FONT_FAMILY, 10)).pack(fill="x")

        tk.Label(frm, text="数值", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        mag_var = tk.StringVar(value="0.0")
        tk.Entry(frm, textvariable=mag_var, font=(config.FONT_FAMILY, 10), relief="solid", borderwidth=1).pack(fill="x")

        tk.Label(frm, text="单位", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        unit_options = ["kN/m²", "kN/m", "kN", "kN/m³"]
        unit_var = tk.StringVar(value=unit_options[0])
        ttk.Combobox(frm, textvariable=unit_var, values=unit_options, state="readonly", font=(config.FONT_FAMILY, 10)).pack(fill="x")

        tk.Label(frm, text="描述", font=(config.FONT_FAMILY, 10), bg="#F5F5F5", fg="#424242").pack(anchor="w", pady=(10, 3))
        desc_var = tk.StringVar(value="")
        tk.Entry(frm, textvariable=desc_var, font=(config.FONT_FAMILY, 10), relief="solid", borderwidth=1).pack(fill="x")

        def save():
            try:
                building_id = int(building_var.get().split(" - ")[0])
                magnitude = float(mag_var.get())
                if magnitude <= 0:
                    raise ValueError("数值必须大于0")

                self.db.execute("""
                    INSERT INTO load_cases (building_id, case_name, load_type, magnitude, unit, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (building_id, name_var.get().strip(), type_var.get(), magnitude, unit_var.get(), desc_var.get().strip()))

                dialog.destroy()
                self.load_load_cases()
                messagebox.showinfo("成功", "荷载工况已添加")

            except ValueError as e:
                messagebox.showerror("输入错误", f"请检查数值：{str(e)}")
            except Exception as e:
                messagebox.showerror("保存失败", f"保存时出错：{str(e)}")

        btn_frame = tk.Frame(frm, bg="#F5F5F5")
        btn_frame.pack(fill="x", pady=(25, 0))

        tk.Button(
            btn_frame,
            text="保存",
            font=(config.FONT_FAMILY, 11, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            padx=25,
            pady=8,
            borderwidth=0,
            cursor="hand2",
            command=save
        ).pack(side="right", padx=5)

        tk.Button(
            btn_frame,
            text="取消",
            font=(config.FONT_FAMILY, 11),
            bg="#E0E0E0",
            fg="#424242",
            padx=25,
            pady=8,
            borderwidth=0,
            cursor="hand2",
            command=dialog.destroy
        ).pack(side="right", padx=5)

    def delete_selected(self):
        selected = self.load_tree.selection()
        if not selected:
            messagebox.showwarning("提示", "请先选择要删除的荷载记录")
            return

        if not messagebox.askyesno("确认删除", "确定要删除选中的荷载记录吗？"):
            return

        item = self.load_tree.item(selected[0])
        load_id = item["values"][0]

        try:
            self.db.execute("DELETE FROM load_cases WHERE id = ?", (load_id,))
            self.load_load_cases()
            messagebox.showinfo("成功", "荷载记录已删除")
        except Exception as e:
            messagebox.showerror("删除失败", f"删除时出错：{str(e)}")

    def refresh(self):
        self.load_load_cases()
