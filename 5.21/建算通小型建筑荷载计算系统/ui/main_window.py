import tkinter as tk
from tkinter import ttk
import config
from database.db_manager import DatabaseManager
from ui.pages.home_page import HomePage
from ui.pages.placeholder_page import PlaceholderPage
from ui.pages.load_input_page import LoadInputPage
from ui.pages.load_manage_page import LoadManagePage
from ui.pages.calculation_results_page import CalculationResultsPage
from ui.pages.wind_snow_page import WindSnowPage
from ui.pages.report_page import ReportPage


class MainWindow:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title(config.APP_TITLE)
        self.root.geometry(f"{config.APP_WIDTH}x{config.APP_HEIGHT}")
        self.root.minsize(900, 600)
        self.root.configure(bg=config.COLOR_BACKGROUND)

        self.db = DatabaseManager()
        self.current_page = None
        self.pages = {}

        self._setup_styles()
        self._build_ui()

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")

        style.configure("Page.TFrame", background=config.COLOR_BACKGROUND)
        style.configure("Sidebar.TFrame", background=config.COLOR_SECONDARY)
        style.configure("Header.TFrame", background=config.COLOR_PRIMARY)
        style.configure("Content.TFrame", background=config.COLOR_BACKGROUND)

        style.configure(
            "Title.TLabel",
            background=config.COLOR_BACKGROUND,
            foreground=config.COLOR_SECONDARY,
            font=(config.FONT_FAMILY, config.FONT_SIZE_TITLE, "bold")
        )
        style.configure(
            "Subtitle.TLabel",
            background=config.COLOR_BACKGROUND,
            foreground="#757575",
            font=(config.FONT_FAMILY, 12)
        )
        style.configure(
            "Version.TLabel",
            background=config.COLOR_BACKGROUND,
            foreground="#BDBDBD",
            font=(config.FONT_FAMILY, 9)
        )
        style.configure(
            "Info.TLabel",
            background=config.COLOR_BACKGROUND,
            foreground="#9E9E9E",
            font=(config.FONT_FAMILY, 10)
        )

        style.configure(
            "Nav.TButton",
            background=config.COLOR_SECONDARY,
            foreground="#FFFFFF",
            font=(config.FONT_FAMILY, 11),
            padding=(20, 12),
            borderwidth=0
        )
        style.map(
            "Nav.TButton",
            background=[("active", "#616161"), ("pressed", "#1976D2")],
            foreground=[("active", "#FFFFFF")]
        )

        style.configure(
            "NavActive.TButton",
            background=config.COLOR_PRIMARY,
            foreground="#FFFFFF",
            font=(config.FONT_FAMILY, 11, "bold"),
            padding=(20, 12),
            borderwidth=0
        )

        style.configure(
            "Header.TLabel",
            background=config.COLOR_PRIMARY,
            foreground="#FFFFFF",
            font=(config.FONT_FAMILY, 14, "bold")
        )

    def _build_ui(self):
        self.root.columnconfigure(1, weight=1)
        self.root.rowconfigure(1, weight=1)

        self._build_header()
        self._build_sidebar()
        self._build_content_area()

        self._show_page("home")

    def _build_header(self):
        header = ttk.Frame(self.root, style="Header.TFrame", height=56)
        header.grid(row=0, column=0, columnspan=2, sticky="ew")
        header.grid_propagate(False)

        tk.Label(
            header,
            text="  🏗️  建算通",
            bg=config.COLOR_PRIMARY,
            fg="#FFFFFF",
            font=(config.FONT_FAMILY, 14, "bold")
        ).pack(side="left", padx=10, pady=10)

        tk.Label(
            header,
            text=f"v{config.APP_VERSION}",
            bg=config.COLOR_PRIMARY,
            fg="#BBDEFB",
            font=(config.FONT_FAMILY, 9)
        ).pack(side="left", pady=10)

        self.db_status_label = tk.Label(
            header,
            text="● 数据库已连接",
            bg=config.COLOR_PRIMARY,
            fg="#81C784",
            font=(config.FONT_FAMILY, 9)
        )
        self.db_status_label.pack(side="right", padx=15)

    def _build_sidebar(self):
        sidebar = tk.Frame(self.root, bg=config.COLOR_SECONDARY, width=200)
        sidebar.grid(row=1, column=0, sticky="nsw")
        sidebar.grid_propagate(False)

        nav_items = [
            ("home", "🏠", "首页"),
            ("load_input", "📝", "荷载录入"),
            ("wind_snow", "🌬️", "风/雪荷载"),
            ("load_manage", "📋", "荷载管理"),
            ("calc", "🧮", "计算结果"),
            ("report", "�", "项目/报告"),
            ("settings", "⚙️", "系统设置"),
        ]

        self.nav_buttons = {}

        for key, icon, label in nav_items:
            btn = tk.Button(
                sidebar,
                text=f"  {icon}  {label}",
                bg=config.COLOR_SECONDARY,
                fg="#FFFFFF",
                font=(config.FONT_FAMILY, 11),
                anchor="w",
                padx=20,
                pady=12,
                borderwidth=0,
                cursor="hand2",
                activebackground="#616161",
                activeforeground="#FFFFFF",
                command=lambda k=key: self._show_page(k)
            )
            btn.pack(fill="x")
            self.nav_buttons[key] = btn

        tk.Frame(sidebar, bg="#616161", height=1).pack(fill="x", pady=5)

        tk.Label(
            sidebar,
            text=f"\n建算通 v{config.APP_VERSION}\n© 2026",
            bg=config.COLOR_SECONDARY,
            fg="#9E9E9E",
            font=(config.FONT_FAMILY, 8),
            justify="center"
        ).pack(side="bottom", pady=15)

    def _build_content_area(self):
        self.content = ttk.Frame(self.root, style="Content.TFrame")
        self.content.grid(row=1, column=1, sticky="nsew")
        self.content.grid_rowconfigure(0, weight=1)
        self.content.grid_columnconfigure(0, weight=1)

    def _on_calc_complete(self, results):
        if hasattr(self, 'pages') and 'calc' in self.pages and self.pages['calc'] is not None:
            try:
                self.pages['calc'].refresh()
            except:
                pass
        if hasattr(self, 'pages') and 'load_manage' in self.pages and self.pages['load_manage'] is not None:
            try:
                self.pages['load_manage'].refresh()
            except:
                pass

    def _show_page(self, page_key):
        if self.current_page is not None:
            self.current_page.destroy()

        for key, btn in self.nav_buttons.items():
            if key == page_key:
                btn.configure(bg=config.COLOR_PRIMARY, font=(config.FONT_FAMILY, 11, "bold"))
            else:
                btn.configure(bg=config.COLOR_SECONDARY, font=(config.FONT_FAMILY, 11))

        if not hasattr(self, 'pages'):
            self.pages = {}

        if page_key == "home":
            self.current_page = HomePage(self.content)
            self.pages['home'] = self.current_page
        elif page_key == "load_input":
            self.current_page = LoadInputPage(
                self.content,
                db_manager=self.db,
                on_calculate_complete=self._on_calc_complete
            )
            self.pages['load_input'] = self.current_page
        elif page_key == "wind_snow":
            self.current_page = WindSnowPage(self.content, db_manager=self.db)
            self.pages['wind_snow'] = self.current_page
        elif page_key == "load_manage":
            self.current_page = LoadManagePage(self.content, db_manager=self.db)
            self.pages['load_manage'] = self.current_page
        elif page_key == "calc":
            self.current_page = CalculationResultsPage(self.content, db_manager=self.db)
            self.pages['calc'] = self.current_page
        elif page_key == "report":
            self.current_page = ReportPage(self.content, db_manager=self.db)
            self.pages['report'] = self.current_page
        elif page_key == "settings":
            self.current_page = PlaceholderPage(self.content, "系统设置", "配置系统参数和偏好")
            self.pages['settings'] = self.current_page
        else:
            self.current_page = HomePage(self.content)
            self.pages['home'] = self.current_page

        self.current_page.grid(row=0, column=0, sticky="nsew")

    def run(self):
        self.root.mainloop()
