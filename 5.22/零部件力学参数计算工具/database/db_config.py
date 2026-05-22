import sqlite3
import os


class DatabaseConfig:
    def __init__(self, db_name="mechanical_calculation.db"):
        self.db_name = db_name
        self.db_path = os.path.join(os.path.dirname(__file__), db_name)
        self.conn = None
        self.cursor = None

    def connect(self):
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        return self.conn, self.cursor

    def close(self):
        if self.conn:
            self.conn.close()

    def init_tables(self):
        self.connect()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS component_params (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                component_name TEXT NOT NULL,
                param_name TEXT NOT NULL,
                param_value REAL,
                param_unit TEXT,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS calculation_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                component_name TEXT NOT NULL,
                calculation_type TEXT,
                result TEXT,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS part_base_params (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                part_id TEXT,
                part_name TEXT NOT NULL,
                part_type TEXT,
                length REAL,
                width REAL,
                height REAL,
                force REAL,
                force_direction TEXT,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()
        self.close()

    def save_part_params(self, data):
        try:
            self.connect()
            self.cursor.execute('''
                INSERT INTO part_base_params 
                (part_id, part_name, part_type, length, width, height, force, force_direction)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get("part_id"),
                data.get("part_name"),
                data.get("part_type"),
                data.get("length"),
                data.get("width"),
                data.get("height"),
                data.get("force"),
                data.get("force_direction")
            ))
            self.conn.commit()
            self.close()
            return True, None
        except Exception as e:
            self.close()
            return False, str(e)

    def get_all_parts(self):
        self.connect()
        self.cursor.execute("SELECT * FROM part_base_params ORDER BY create_time DESC")
        results = self.cursor.fetchall()
        self.close()
        return results
