import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from typing import List, Dict


class FileExistsError(Exception):
    pass


class FileManager:
    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root

    def get_user_workspace(self, user_id: str) -> str:
        user_workspace = os.path.join(self.workspace_root, user_id)
        if not os.path.exists(user_workspace):
            os.makedirs(user_workspace)
        return user_workspace

    def get_metadata_path(self, user_id: str) -> str:
        return os.path.join(self.get_user_workspace(user_id), "metadata.json")

    def load_metadata(self, user_id: str) -> Dict[str, str]:
        metadata_path = self.get_metadata_path(user_id)
        if not os.path.exists(metadata_path):
            return {}
        with open(metadata_path, "r") as f:
            return json.load(f)

    def save_metadata(self, user_id: str, metadata: dict) -> None:
        metadata_path = self.get_metadata_path(user_id)
        with open(metadata_path, "w") as f:
            json.dump(metadata, f)

    def update_last_edit_time(self, user_id: str, filename: str) -> None:
        metadata = self.load_metadata(user_id)
        metadata[filename] = datetime.now().isoformat()
        self.save_metadata(user_id, metadata)

    def list_files(self, user_id: str) -> List[Dict[str, str]]:
        user_workspace = self.get_user_workspace(user_id)
        files = os.listdir(user_workspace)
        # ignore metadata file
        files = [f for f in files if f != "metadata.json"]
        metadata = self.load_metadata(user_id)
        return [
            {"name": f, "last_edit": metadata.get(f, "Never")}
            for f in files
            if f != "metadata.json"
        ]

    def create_file(self, user_id: str, file: FileStorage) -> str:
        user_workspace = self.get_user_workspace(user_id)
        if file.filename == "" or file.filename is None:
            raise ValueError("No selected file")
        else:
            filename = secure_filename(file.filename)
        file_path = os.path.join(user_workspace, filename)
        if os.path.exists(file_path):
            raise FileExistsError(f"File {filename} already exists")

        file.save(file_path)
        self.update_last_edit_time(user_id, filename)
        return filename

    def read_file(self, user_id: str, filename: str) -> str:
        user_workspace = self.get_user_workspace(user_id)
        file_path = os.path.join(user_workspace, secure_filename(filename))
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")
        with open(file_path, "r") as f:
            content = f.read()
            self.update_last_edit_time(user_id, filename)
            return content

    def update_file(self, user_id: str, filename: str, content: str) -> None:
        user_workspace = self.get_user_workspace(user_id)
        file_path = os.path.join(user_workspace, secure_filename(filename))
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")
        with open(file_path, "w") as f:
            f.write(content)
        self.update_last_edit_time(user_id, filename)

    def delete_file(self, user_id: str, filename: str) -> None:
        user_workspace = self.get_user_workspace(user_id)
        file_path = os.path.join(user_workspace, secure_filename(filename))
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {filename} not found")
        os.remove(file_path)
        metadata = self.load_metadata(user_id)
        metadata.pop(filename, None)
        self.save_metadata(user_id, metadata)
