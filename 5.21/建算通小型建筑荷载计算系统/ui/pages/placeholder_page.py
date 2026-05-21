import tkinter as tk
from tkinter import ttk


class PlaceholderPage(ttk.Frame):
    def __init__(self, parent, title="模块", description="该功能模块正在开发中...", **kwargs):
        super().__init__(parent, **kwargs)
        self.parent = parent
        self.title_text = title
        self.description_text = description
        self._build_ui()

    def _build_ui(self):
        self.configure(style="Page.TFrame")

        container = ttk.Frame(self, style="Page.TFrame")
        container.pack(fill="both", expand=True, padx=40, pady=40)

        title_label = ttk.Label(
            container,
            text=self.title_text,
            font=("Microsoft YaHei", 22, "bold"),
            style="Title.TLabel"
        )
        title_label.pack(pady=(30, 15))

        separator = ttk.Separator(container, orient="horizontal")
        separator.pack(fill="x", padx=100, pady=10)

        desc_label = ttk.Label(
            container,
            text=self.description_text,
            font=("Microsoft YaHei", 11),
            style="Info.TLabel"
        )
        desc_label.pack(pady=20)

        box = tk.Frame(
            container,
            bg="#FAFAFA",
            highlightbackground="#E0E0E0",
            highlightthickness=1
        )
        box.pack(pady=30, padx=100, fill="x")

        tk.Label(
            box,
            text="🚧 模块占位",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#FAFAFA",
            fg="#9E9E9E"
        ).pack(pady=30)
