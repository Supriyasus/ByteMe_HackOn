import os
import shutil
from uuid import uuid4

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_image(upload_file) -> str:
    ext = upload_file.filename.split('.')[-1]
    filename = f"{uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        shutil.copyfileobj(upload_file.file, f)

    return path

