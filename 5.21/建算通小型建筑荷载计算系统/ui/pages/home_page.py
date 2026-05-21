import tkinter as tk
from tkinter import ttk


class HomePage(ttk.Frame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self._build_ui()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=40)

        title_label = ttk.Label(
            container,
            text="建算通",
            font=("Microsoft YaHei", 36, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(40, 10))

        subtitle_label = ttk.Label(
            container,
            text="小型建筑荷载计算系统",
            font=("Microsoft YaHei", 16),
            style="Subtitle.TLabel"
        )
        subtitle_label.pack(pady=(0, 20))

        version_label = ttk.Label(
            container,
            text="版本 0.1.0",
            font=("Microsoft YaHei", 9),
            style="Version.TLabel"
        )
        version_label.pack(pady=(0, 60))

        card_frame = ttk.Frame(container, style="Page.TFrame")
        card_frame.pack()

        cards = [
            ("新建项目", "开始一个新的建筑荷载计算项目", "#1976D2"),
            ("荷载管理", "查看和管理已录入的荷载工况", "#388E3C"),
            ("计算结果", "查看历史计算结果和报告", "#F57C00"),
            ("系统设置", "配置系统参数和偏好", "#7B1FA2"),
        ]

        for i, (title, desc, color) in enumerate(cards):
            card = tk.Frame(
                card_frame,
                bg="#FFFFFF",
                highlightbackground="#E0E0E0",
                highlightthickness=1
            )
            card.grid(row=i // 2, column=i % 2, padx=15, pady=15, sticky="nsew")

            card_frame.grid_columnconfigure(i % 2, minsize=220, weight=1)
            card_frame.grid_rowconfigure(i // 2, minsize=120, weight=1)

            color_bar = tk.Frame(card, bg=color, height=4)
            color_bar.pack(fill="x", side="top")

            card_inner = tk.Frame(card, bg="#FFFFFF")
            card_inner.pack(fill="both", expand=True, padx=20, pady=20)

            lbl_title = tk.Label(
                card_inner,
                text=title,
                font=("Microsoft YaHei", 13, "bold"),
                bg="#FFFFFF",
                fg="#424242"
            )
            lbl_title.pack(anchor="w")

            lbl_desc = tk.Label(
                card_inner,
                text=desc,
                font=("Microsoft YaHei", 9),
                bg="#FFFFFF",
                fg="#9E9E9E",
                wraplength=180,
                justify="left"
            )
            lbl_desc.pack(anchor="w", pady=(5, 0))

        info_label = ttk.Label(
            container,
            text="提示：请从左侧导航栏选择功能模块",
            font=("Microsoft YaHei", 10),
            style="Info.TLabel"
        )
        info_label.pack(side="bottom", pady=20)
