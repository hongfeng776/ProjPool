import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import config
from core.project_manager import ProjectManager
from core.report_generator import ReportGenerator
from core.pdf_exporter import PDFExporter


class ReportPage(ttk.Frame):
    def __init__(self, parent, db_manager=None, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.db = db_manager
        self.project_manager = ProjectManager()
        self.report_generator = ReportGenerator()
        self.pdf_exporter = PDFExporter()
        self.selected_project = None
        self.current_report = None
        self._build_ui()
        self.load_projects()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=30)

        title_label = ttk.Label(
            container,
            text="项目管理与报告导出",
            font=(config.FONT_FAMILY, 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(0, 10))

        subtitle_label = ttk.Label(
            container,
            text="管理计算项目，生成计算书并导出为 PDF",
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
            command=self.load_projects
        )
        refresh_btn.pack(side="left", padx=5)

        open_btn = tk.Button(
            toolbar,
            text="📂 打开项目",
            font=(config.FONT_FAMILY, 10),
            bg="#388E3C",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#2E7D32",
            activeforeground="#FFFFFF",
            command=self.open_selected_project
        )
        open_btn.pack(side="left", padx=5)

        report_btn = tk.Button(
            toolbar,
            text="📄 生成计算书",
            font=(config.FONT_FAMILY, 10),
            bg="#F57C00",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#EF6C00",
            activeforeground="#FFFFFF",
            command=self.generate_report
        )
        report_btn.pack(side="left", padx=5)

        pdf_btn = tk.Button(
            toolbar,
            text="📥 导出 PDF",
            font=(config.FONT_FAMILY, 10),
            bg="#7B1FA2",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#6A1B9A",
            activeforeground="#FFFFFF",
            command=self.export_pdf
        )
        pdf_btn.pack(side="left", padx=5)

        txt_btn = tk.Button(
            toolbar,
            text="📝 导出 TXT",
            font=(config.FONT_FAMILY, 10),
            bg="#00796B",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#00695C",
            activeforeground="#FFFFFF",
            command=self.export_txt
        )
        txt_btn.pack(side="left", padx=5)

        delete_btn = tk.Button(
            toolbar,
            text="🗑️ 删除项目",
            font=(config.FONT_FAMILY, 10),
            bg="#D32F2F",
            fg="#FFFFFF",
            padx=15,
            pady=6,
            borderwidth=0,
            cursor="hand2",
            activebackground="#B71C1C",
            activeforeground="#FFFFFF",
            command=self.delete_project
        )
        delete_btn.pack(side="left", padx=5)

        self.count_label = tk.Label(
            toolbar,
            text="共 0 个项目",
            font=(config.FONT_FAMILY, 10),
            bg=config.COLOR_BACKGROUND,
            fg="#757575"
        )
        self.count_label.pack(side="right", padx=10)

        content_paned = tk.PanedWindow(container, orient=tk.HORIZONTAL, bg=config.COLOR_BACKGROUND)
        content_paned.pack(fill="both", expand=True, padx=10)

        left_frame = tk.Frame(content_paned, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        content_paned.add(left_frame, width=350)

        left_header = tk.Frame(left_frame, bg=config.COLOR_PRIMARY)
        left_header.pack(fill="x")
        tk.Label(
            left_header,
            text="📁 项目列表",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF"
        ).pack(side="left", padx=15, pady=10)

        style = ttk.Style()
        style.configure(
            "Project.Treeview",
            font=(config.FONT_FAMILY, 10),
            rowheight=28
        )
        style.configure(
            "Project.Treeview.Heading",
            font=(config.FONT_FAMILY, 10, "bold"),
            background="#E3F2FD",
            foreground="#1976D2"
        )
        style.map("Project.Treeview", background=[("selected", "#BBDEFB")], foreground=[("selected", "#0D47A1")])

        p_columns = ("name", "type", "date")
        self.project_tree = ttk.Treeview(
            left_frame,
            columns=p_columns,
            show="headings",
            style="Project.Treeview",
            height=18
        )

        self.project_tree.heading("name", text="项目名称")
        self.project_tree.heading("type", text="类型")
        self.project_tree.heading("date", text="创建时间")

        self.project_tree.column("name", width=150, anchor="w")
        self.project_tree.column("type", width=80, anchor="center")
        self.project_tree.column("date", width=100, anchor="center")

        p_scroll = ttk.Scrollbar(left_frame, orient="vertical", command=self.project_tree.yview)
        self.project_tree.configure(yscrollcommand=p_scroll.set)

        self.project_tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        p_scroll.pack(side="right", fill="y", padx=(0, 10), pady=10)

        self.project_tree.bind("<<TreeviewSelect>>", self.on_project_select)

        right_frame = tk.Frame(content_paned, bg="#FFFFFF", highlightbackground="#E0E0E0", highlightthickness=1)
        content_paned.add(right_frame)

        right_header = tk.Frame(right_frame, bg="#F57C00")
        right_header.pack(fill="x")
        self.report_title = tk.Label(
            right_header,
            text="📄 计算书预览",
            font=(config.FONT_FAMILY, 12, "bold"),
            bg="#F57C00",
            fg="#FFFFFF"
        )
        self.report_title.pack(side="left", padx=15, pady=10)

        report_empty_frame = tk.Frame(right_frame, bg="#FFFFFF")
        report_empty_frame.pack(fill="both", expand=True)
        tk.Label(
            report_empty_frame,
            text="👈 请选择左侧项目生成计算书",
            font=(config.FONT_FAMILY, 12),
            bg="#FFFFFF",
            fg="#9E9E9E"
        ).pack(pady=80)

        self.report_frame = tk.Frame(right_frame, bg="#FFFFFF")

        self.report_text = tk.Text(
            self.report_frame,
            font=("Consolas", 10),
            bg="#FAFAFA",
            fg="#424242",
            wrap=tk.NONE,
            relief="flat",
            padx=20,
            pady=20
        )

        text_scroll_v = ttk.Scrollbar(self.report_frame, orient="vertical", command=self.report_text.yview)
        text_scroll_h = ttk.Scrollbar(self.report_frame, orient="horizontal", command=self.report_text.xview)
        self.report_text.configure(yscrollcommand=text_scroll_v.set, xscrollcommand=text_scroll_h.set)

        self.report_text.grid(row=0, column=0, sticky="nsew", padx=(10, 0), pady=10)
        text_scroll_v.grid(row=0, column=1, sticky="ns", padx=(0, 10), pady=10)
        text_scroll_h.grid(row=1, column=0, sticky="ew", padx=(10, 0), pady=(0, 10))

        self.report_frame.grid_columnconfigure(0, weight=1)
        self.report_frame.grid_rowconfigure(0, weight=1)

        self.report_empty_frame = report_empty_frame
        self.right_frame = right_frame

    def load_projects(self):
        for item in self.project_tree.get_children():
            self.project_tree.delete(item)

        projects = self.project_manager.list_projects()

        for p in projects:
            created_at = p["created_at"].replace("T", " ")[:16] if "T" in p["created_at"] else p["created_at"][:16]
            self.project_tree.insert(
                "", "end",
                values=(
                    p["project_name"],
                    p["project_type"],
                    created_at
                ),
                tags=(p["filepath"],)
            )

        self.count_label.config(text=f"共 {len(projects)} 个项目")

    def on_project_select(self, event):
        selected = self.project_tree.selection()
        if not selected:
            return

        item = self.project_tree.item(selected[0])
        filepath = item["tags"][0] if item["tags"] else None
        self.selected_project = filepath

    def open_selected_project(self):
        if not self.selected_project:
            messagebox.showwarning("提示", "请先选择一个项目")
            return

        try:
            project_data = self.project_manager.load_project(self.selected_project)
            project_name = project_data.get("project_name", "未命名")
            messagebox.showinfo(
                "项目信息",
                f"项目名称：{project_name}\n"
                f"项目类型：{project_data.get('project_type', 'unknown')}\n"
                f"创建时间：{project_data.get('created_at', '')}\n\n"
                f"提示：可直接生成计算书"
            )
        except Exception as e:
            messagebox.showerror("打开失败", f"无法打开项目：{str(e)}")

    def generate_report(self):
        if not self.selected_project:
            messagebox.showwarning("提示", "请先选择一个项目")
            return

        try:
            project_data = self.project_manager.load_project(self.selected_project)
            params = project_data.get("params", {})
            results = project_data.get("results", {})
            project_type = project_data.get("project_type", "")

            if "dead_live" in project_type or "恒载" in project_type or "活载" in project_type:
                report = self.report_generator.generate_dead_live_report(params, results)
            elif "wind" in project_type or "风荷载" in project_type:
                report = self.report_generator.generate_wind_report(params, results)
            elif "snow" in project_type or "雪荷载" in project_type:
                report = self.report_generator.generate_snow_report(params, results)
            else:
                report = self.report_generator.generate_dead_live_report(params, results)

            self.current_report = report
            self.report_empty_frame.pack_forget()
            self.report_frame.pack(fill="both", expand=True)

            self.report_text.config(state=tk.NORMAL)
            self.report_text.delete(1.0, tk.END)
            self.report_text.insert(tk.END, report)
            self.report_text.config(state=tk.DISABLED)

            self.report_title.config(text=f"📄 计算书预览 - {project_data.get('project_name', '未命名')}")

        except Exception as e:
            messagebox.showerror("生成失败", f"生成计算书时出现错误：{str(e)}")

    def export_pdf(self):
        if not self.current_report:
            messagebox.showwarning("提示", "请先生成计算书预览")
            return

        if not self.selected_project:
            project_name = "计算书"
        else:
            project_data = self.project_manager.load_project(self.selected_project)
            project_name = project_data.get("project_name", "计算书")

        try:
            filepath = filedialog.asksaveasfilename(
                defaultextension=".pdf",
                filetypes=[("PDF 文件", "*.pdf"), ("所有文件", "*.*")],
                initialfile=f"{project_name}_计算书.pdf",
                title="导出 PDF"
            )

            if not filepath:
                return

            self.pdf_exporter.export_to_pdf(self.current_report, filepath, f"{project_name} 荷载计算书")
            messagebox.showinfo("导出成功", f"PDF 已成功导出到：\n{filepath}")

        except Exception as e:
            messagebox.showerror("导出失败", f"导出 PDF 时出现错误：{str(e)}")

    def export_txt(self):
        if not self.current_report:
            messagebox.showwarning("提示", "请先生成计算书预览")
            return

        if not self.selected_project:
            project_name = "计算书"
        else:
            project_data = self.project_manager.load_project(self.selected_project)
            project_name = project_data.get("project_name", "计算书")

        try:
            filepath = filedialog.asksaveasfilename(
                defaultextension=".txt",
                filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
                initialfile=f"{project_name}_计算书.txt",
                title="导出 TXT"
            )

            if not filepath:
                return

            self.report_generator.report_to_text(self.current_report, filepath)
            messagebox.showinfo("导出成功", f"文本文件已成功导出到：\n{filepath}")

        except Exception as e:
            messagebox.showerror("导出失败", f"导出文本时出现错误：{str(e)}")

    def delete_project(self):
        if not self.selected_project:
            messagebox.showwarning("提示", "请先选择要删除的项目")
            return

        if not messagebox.askyesno("确认删除", "确定要删除选中的项目吗？此操作不可恢复。"):
            return

        try:
            if self.project_manager.delete_project(self.selected_project):
                selected = self.project_tree.selection()
                if selected:
                    self.project_tree.delete(selected[0])

                self.current_report = None
                self.selected_project = None
                self.report_frame.pack_forget()
                self.report_empty_frame.pack(fill="both", expand=True)
                self.report_title.config(text="📄 计算书预览")

                count = len(self.project_tree.get_children())
                self.count_label.config(text=f"共 {count} 个项目")

                messagebox.showinfo("成功", "项目已删除")
            else:
                messagebox.showerror("删除失败", "无法删除项目")

        except Exception as e:
            messagebox.showerror("删除失败", f"删除时出现错误：{str(e)}")
