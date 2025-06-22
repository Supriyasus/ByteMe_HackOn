from fastapi import APIRouter, UploadFile, File, Form
import os
import shutil
from uuid import uuid4

from models.counterfeit_detector import (
    compute_image_text_similarity,
    compute_logo_flags  # ✅ updated to OCR-free function
)

router = APIRouter(prefix="/detect", tags=["Detection"])

UPLOAD_DIR = "uploads"
EVIDENCE_DIR = "evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

@router.post("/counterfeit/")
async def detect_counterfeit(
    image: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...)
):
    ext = image.filename.split('.')[-1]
    filename = f"{uuid4()}.{ext}"
    temp_path = os.path.join(UPLOAD_DIR, filename)

    with open(temp_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # 🧠 Combine title and description for CLIP
    full_text = f"{title.strip()} - {description.strip()}"

    # 1️⃣ CLIP score
    similarity_score = compute_image_text_similarity(temp_path, full_text)

    # 2️⃣ Logo-based brand check
    flag_info = compute_logo_flags(temp_path, title)

    # 🚩 Flag if any detection fails
    suspected_counterfeit = (
        similarity_score < 0.30 or
        flag_info["brand_mismatch"]
    )

    if suspected_counterfeit:
        final_path = os.path.join(EVIDENCE_DIR, filename)
        shutil.move(temp_path, final_path)
        image_path = final_path
    else:
        os.remove(temp_path)
        image_path = None

    return {
        "title": title,
        "description": description,
        "image_path": image_path if image_path else "Deleted (not suspicious)",
        "similarity_score": round(similarity_score, 3),
        "suspected_counterfeit": suspected_counterfeit,
        "predicted_brand": flag_info["predicted_brand"],
        "claimed_brand": flag_info["claimed_brand"],
        "brand_confidence": flag_info["brand_confidence"],
        "top_3_brand_guesses": flag_info["top_3_brand_guesses"],
        "brand_mismatch": flag_info["brand_mismatch"]
    }
