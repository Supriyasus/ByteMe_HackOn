# backend/scripts/kaggle_downloader.py

import kagglehub
import os
import shutil
import pandas as pd

TARGET_BRANDS = [
    "nike", "adidas", "puma", "apple", "samsung", "sony", "hp", "levis",
    "fila", "reebok", "pepsi", "nestle", "oreo", "coca_cola", "huawei"
]

def normalize_brand(name):
    return name.strip().lower().replace(" ", "_")

def download_and_prepare():
    path = kagglehub.dataset_download("prosperchuks/fakereal-logo-detection-dataset")
    print("✅ Dataset downloaded to:", path)

    file_map = os.path.join(path, "file_mapping.csv")
    gen_dir = os.path.join(path, "genLogoOutput")
    out_dir = os.path.join(path, "output")

    # 🛠️ Fix: ensure destination is always backend/logo_dataset
    project_root = os.path.dirname(os.path.dirname(__file__))  # Goes from scripts/ → backend/
    dest_dir = os.path.join(project_root, "logo_dataset")
    os.makedirs(dest_dir, exist_ok=True)

    df = pd.read_csv(file_map)
    df.columns = [col.strip() for col in df.columns]

    if "Filename" not in df.columns or "Brand Name" not in df.columns:
        raise ValueError(f"Expected columns not found. Got: {df.columns.tolist()}")

    df = df.rename(columns={
        "Filename": "Path",
        "Brand Name": "Brand"
    }).dropna(subset=["Path", "Brand"])

    moved = 0
    for _, row in df.iterrows():
        brand = normalize_brand(row["Brand"])
        if brand not in TARGET_BRANDS:
            continue

        rel_path = row["Path"]
        if "genLogoOutput" in rel_path:
            src_path = os.path.join(gen_dir, os.path.relpath(rel_path, "genLogoOutput"))
        else:
            src_path = os.path.join(out_dir, os.path.relpath(rel_path, "output"))

        dst_folder = os.path.join(dest_dir, brand)
        os.makedirs(dst_folder, exist_ok=True)

        if os.path.exists(src_path):
            shutil.copy(src_path, os.path.join(dst_folder, os.path.basename(src_path)))
            moved += 1

    print(f"✅ Copied {moved} images into {dest_dir}")

if __name__ == "__main__":
    download_and_prepare()
