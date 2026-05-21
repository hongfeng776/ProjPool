import tkinter as tk
from tkinter import ttk, messagebox
import config


class CalculationResultsPage(ttk.Frame):
    def __init__(self, parent, db_manager=None, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.db = db_manager
        self.selected_building_id = None
        self._build_ui()
        self.load_buildings()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=30)

        title_label = ttk.Label(
            container,
            text="计算结果管理",
            font=(config.FONT_FAMILY, 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(0, 10))

        subtitle_label = ttk.Label(
            container,
            text="查看历史计算记录和详细结果",
            font=(config.FONT_FAMILY, 11),
            style="Subtitle.TLabel"
        )
        subtitle_label.pack(pady=(0, 20))

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
            command=self.load_buildings
        )
        refresh_btn.pack(side="left", padx=5)

        delete_btn = tk.Button(
            toolbar,
            text="🗑️ 删除选中",
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
            text="共 0 条记录",
            font=(config.FONT_FAMILY, 10),
            bg=config.COLOR_BACKGROUND,
            fg="#757575"
        )
        self.count_label.pack(side="right", padx=10)

        content_paned = tk.PanedWindow(container, orient=tk.HORIZONTAL, bg=config.COLOR_BACKGROUND)
        content_paned.pack(fill="both", expand=True, padx=10)

        left_frame = tk.Frame(content_paned, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        content_paned.add(left_frame, width=400)

        left_header = tk.Frame(left_frame, bg=config.COLOR_PRIMARY)
        left_header.pack(fill="x")
        tk.Label(
            left_header,
            text="🏢 建筑项目列表",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF"
        ).pack(side="left", padx=15, pady=10)

        style = ttk.Style()
        style.configure(
            "Building.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=28
        )
        style.configure(
            "Building.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E3F2FD",
            foreground="#1976D2"
        )
        style.map("Building.Treeview", background=[("selected", "#BBDEFB")], foreground=[("selected", "#0D47A1")])

        b_columns = ("id", "name", "type", "area", "date")
        self.building_tree = ttk.Treeview(
            left_frame,
            columns=b_columns,
            show="headings",
            style="Building.Treeview",
            height=15
        )

        self.building_tree.heading("id", text="ID")
        self.building_tree.heading("name", text="建筑名称")
        self.building_tree.heading("type", text="类型")
        self.building_tree.heading("area", text="面积(m²)")
        self.building_tree.heading("date", text="创建时间")

        self.building_tree.column("id", width=40, anchor="center")
        self.building_tree.column("name", width=150, anchor="w")
        self.building_tree.column("type", width=70, anchor="center")
        self.building_tree.column("area", width=80, anchor="e")
        self.building_tree.column("date", width=120, anchor="center")

        b_scroll = ttk.Scrollbar(left_frame, orient="vertical", command=self.building_tree.yview)
        self.building_tree.configure(yscrollcommand=b_scroll.set)

        self.building_tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        b_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

        self.building_tree.bind("<<TreeviewSelect>>", self.on_building_select)

        right_frame = tk.Frame(content_paned, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        content_paned.add(right_frame)

        right_header = tk.Frame(right_frame, bg="#388E3C")
        right_header.pack(fill="x")
        self.detail_title = tk.Label(
            right_header,
            text="📊 计算详情",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg="#388E3C",
            fg="#FFFFFF"
        )
        self.detail_title.pack(side="left", padx=15, pady=10)

        detail_empty_frame = tk.Frame(right_frame, bg="#FFFFFF")
        detail_empty_frame.pack(fill="both", expand=True)
        tk.Label(
            detail_empty_frame,
            text="👈 请选择左侧建筑查看详细计算结果",
            font=(config.FONT_FAMILY, 12),
            bg="#FFFFFF",
            fg="#9E9E9E"
        ).pack(pady=80)

        self.detail_frame = tk.Frame(right_frame, bg="#FFFFFF")

        r_columns = ("item", "value", "unit")
        self.result_tree = ttk.Treeview(
            self.detail_frame,
            columns=r_columns,
            show="headings",
            style="Result.Treeview",
            height=18
        )

        self.result_tree.heading("item", text="荷载项目")
        self.result_tree.heading("value", text="数值")
        self.result_tree.heading("unit", text="单位")

        self.result_tree.column("item", width=240, anchor="w")
        self.result_tree.column("value", width=150, anchor="e")
        self.result_tree.column("unit", width=100, anchor="center")

        r_scroll = ttk.Scrollbar(self.detail_frame, orient="vertical", command=self.result_tree.yview)
        self.result_tree.configure(yscrollcommand=r_scroll.set)

        self.result_tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        r_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

        self.detail_empty_frame = detail_empty_frame
        self.right_frame = right_frame

    def load_buildings(self):
        for item in self.building_tree.get_children():
            self.building_tree.delete(item)

        if self.db is None:
            return

        buildings = self.db.query(
            "SELECT id, name, building_type, area, created_at FROM buildings ORDER BY id DESC"
        )

        for b in buildings:
            self.building_tree.insert(
                "", "end",
                values=(
                    b["id"],
                    b["name"],
                    b["building_type"],
                    f"{b['area']:.1f}",
                    b["created_at"]
                )
            )

        self.count_label.config(text=f"共 {len(buildings)} 条记录")

    def on_building_select(self, event):
        selected = self.building_tree.selection()
        if not selected:
            return

        item = self.building_tree.item(selected[0])
        building_id = item["values"][0]
        building_name = item["values"][1]
        self.selected_building_id = building_id

        self.detail_title.config(text=f"📊 计算详情 - {building_name}")

        for child in self.right_frame.winfo_children():
            if child != self.detail_empty_frame and child != self.detail_frame and child.winfo_class() != "Frame":
                pass

        self.detail_empty_frame.pack_forget()
        self.detail_frame.pack(fill="both", expand=True)

        self.load_results(building_id)

    def load_results(self, building_id):
        for item in self.result_tree.get_children():
            self.result_tree.delete(item)

        if self.db is None:
            return

        results = self.db.query(
            """SELECT result_name, result_value, result_unit
               FROM calculation_results
               WHERE building_id = ?
               ORDER BY id""",
            (building_id,)
        )

        dead_items = ["楼板自重", "楼面装修", "吊顶重量", "墙体重量", "门窗重量"]
        live_items = ["活载标准值(面荷载)", "活载标准值(总荷载)"]

        for r in results:
            val = f"{r['result_value']:.3f}"
            tags = ()
            name = r["result_name"]

            if name in dead_items:
                tags = ("dead",)
            elif name in live_items:
                tags = ("live",)
            elif "恒载" in name or "荷载组合" in name or "总荷载" in name:
                tags = ("summary",)

            display_name = name
            if name == "恒载标准值(面荷载)":
                display_name = "👉 恒载标准值(面荷载)"
            elif name == "活载标准值(面荷载)":
                display_name = "👉 活载标准值(面荷载)"
            elif name == "荷载组合(1.2恒+1.4活)":
                display_name = "⭐ 荷载组合(1.2恒+1.4活)"

            self.result_tree.insert(
                "", "end",
                values=(display_name, val, r["result_unit"]),
                tags=tags
            )

        self.result_tree.tag_configure("dead", background="#FFF3E0", foreground="#E65100")
        self.result_tree.tag_configure("live", background="#E8F5E9", foreground="#2E7D32")
        self.result_tree.tag_configure("summary", background="#E3F2FD", foreground="#1565C0", font=(config.FONT_FAMILY, 10, "bold"))

    def delete_selected(self):
        selected = self.building_tree.selection()
        if not selected:
            messagebox.showwarning("提示", "请先选择要删除的记录")
            return

        if not messagebox.askyesno("确认删除", "确定要删除选中的建筑记录及其计算结果吗？此操作不可恢复。"):
            return

        item = self.building_tree.item(selected[0])
        building_id = item["values"][0]

        try:
            self.db.execute("DELETE FROM calculation_results WHERE building_id = ?", (building_id,))
            self.db.execute("DELETE FROM buildings WHERE id = ?", (building_id,))
            self.building_tree.delete(selected[0])

            for child in self.detail_frame.winfo_children():
                if isinstance(child, ttk.Treeview):
                    for i in child.get_children():
                        child.delete(i)

            self.detail_frame.pack_forget()
            self.detail_empty_frame.pack(fill="both", expand=True)
            self.detail_title.config(text="📊 计算详情")

            count = len(self.building_tree.get_children())
            self.count_label.config(text=f"共 {count} 条记录")

            messagebox.showinfo("成功", "记录已删除")

        except Exception as e:
            messagebox.showerror("删除失败", f"删除时出现错误：{str(e)}")

    def refresh(self):
        self.load_buildings()
