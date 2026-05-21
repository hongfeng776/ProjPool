import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "buildings.db")

APP_TITLE = "建算通 - 小型建筑荷载计算系统"
APP_VERSION = "0.1.0"
APP_WIDTH = 1100
APP_HEIGHT = 700

FONT_FAMILY = "Microsoft YaHei"
FONT_SIZE_TITLE = 18
FONT_SIZE_LABEL = 10

COLOR_PRIMARY = "#1976D2"
COLOR_SECONDARY = "#424242"
COLOR_BACKGROUND = "#F5F5F5"
COLOR_CARD = "#FFFFFF"
COLOR_BORDER = "#E0E0E0"
