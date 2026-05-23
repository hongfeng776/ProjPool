import os
import json


class Config:
    def __init__(self, config_file=None):
        self.config_file = config_file or 'config.json'
        self.config = self._load_default_config()
        
        if os.path.exists(self.config_file):
            self._load_from_file()

    def _load_default_config(self):
        return {
            'data_file': 'data/steps_data.csv',
            'output_dir': 'output',
            'target_steps': 10000,
            'date_format': '%Y-%m-%d',
            'chart_style': 'whitegrid',
            'language': 'zh-CN'
        }

    def _load_from_file(self):
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                self.config.update(user_config)
        except Exception as e:
            print(f"[警告] 加载配置文件失败: {e}")

    def get(self, key, default=None):
        return self.config.get(key, default)

    def set(self, key, value):
        self.config[key] = value

    def save(self):
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4, ensure_ascii=False)
