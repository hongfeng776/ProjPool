import json
import os
import datetime
from typing import Dict, Optional
import config


class ProjectManager:
    def __init__(self):
        self.projects_dir = os.path.join(config.BASE_DIR, "projects")
        os.makedirs(self.projects_dir, exist_ok=True)

    def save_project(self, project_name: str, project_type: str,
                     params: Dict, results: Dict, filename: Optional[str] = None) -> str:
        if filename is None:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c for c in project_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            filename = f"{safe_name}_{timestamp}.json"

        filepath = os.path.join(self.projects_dir, filename)

        project_data = {
            "project_name": project_name,
            "project_type": project_type,
            "created_at": datetime.datetime.now().isoformat(),
            "params": params,
            "results": results
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(project_data, f, ensure_ascii=False, indent=2)

        return filepath

    def load_project(self, filepath: str) -> Dict:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

    def list_projects(self) -> list:
        projects = []
        if not os.path.exists(self.projects_dir):
            return projects

        for filename in os.listdir(self.projects_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(self.projects_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        projects.append({
                            "filename": filename,
                            "filepath": filepath,
                            "project_name": data.get("project_name", "未命名"),
                            "project_type": data.get("project_type", "unknown"),
                            "created_at": data.get("created_at", "")
                        })
                except:
                    continue
        return sorted(projects, key=lambda x: x["created_at"], reverse=True)

    def delete_project(self, filepath: str) -> bool:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except:
            return False

    def get_projects_directory(self) -> str:
        return self.projects_dir
