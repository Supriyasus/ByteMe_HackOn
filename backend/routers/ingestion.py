from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
import json
from uuid import uuid4
from datetime import datetime

from models.counterfeit_detector import (
    compute_image_text_similarity,
    compute_logo_flags
)

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

UPLOAD_DIR = "uploads/"
EVIDENCE_DIR = "evidence/"
FLAGGED_LOG = "flagged_items.json"
AUTHENTIC_LOG = "authentic_items.json"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)


# 📄 Log flagged listings
def log_flagged_product(product_id, seller_id, score, image_path, title, description, flags):
    flagged_item = {
        "product_id": product_id,
        "seller_id": seller_id,
        "similarity_score": score,
        "predicted_brand": flags["predicted_brand"],
        "claimed_brand": flags["claimed_brand"],
        "brand_confidence": flags["brand_confidence"],
        "top_3_brand_guesses": flags["top_3_brand_guesses"],
        "image_path": image_path,
        "title": title,
        "description": description,
        "status": "flagged",
        "timestamp": datetime.now().isoformat()
    }

    data = []
    if os.path.exists(FLAGGED_LOG):
        with open(FLAGGED_LOG, "r") as f:
            data = json.load(f)

    data.append(flagged_item)

    with open(FLAGGED_LOG, "w") as f:
        json.dump(data, f, indent=2)


# ✅ Log authentic listings
def log_authentic_product(product_id, seller_id, title, description):
    item = {
        "product_id": product_id,
        "seller_id": seller_id,
        "title": title,
        "description": description,
        "status": "authentic",
        "timestamp": datetime.now().isoformat()
    }

    data = []
    if os.path.exists(AUTHENTIC_LOG):
        with open(AUTHENTIC_LOG, "r") as f:
            data = json.load(f)

    data.append(item)

    with open(AUTHENTIC_LOG, "w") as f:
        json.dump(data, f, indent=2)


# 🚀 Upload route
@router.post("/upload_listing/")
async def upload_product_listing(
    image: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    seller_id: str = Form(...),
    product_id: str = Form(...)
):
    file_ext = image.filename.split('.')[-1]
    filename = f"{uuid4()}.{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    full_text = f"{title.strip()} - {description.strip()}"
    similarity_score = compute_image_text_similarity(temp_path, full_text)
    flags = compute_logo_flags(temp_path, title)

    suspected_counterfeit = (
        similarity_score < 0.25 or
        flags["brand_mismatch"]
    )

    if suspected_counterfeit:
        evidence_path = os.path.join(EVIDENCE_DIR, filename)
        shutil.move(temp_path, evidence_path)
        log_flagged_product(
            product_id=product_id,
            seller_id=seller_id,
            score=similarity_score,
            image_path=evidence_path,
            title=title,
            description=description,
            flags=flags
        )
        image_path = evidence_path
    else:
        os.remove(temp_path)
        log_authentic_product(
            product_id=product_id,
            seller_id=seller_id,
            title=title,
            description=description
        )
        image_path = None

    return {
        "message": "Listing uploaded",
        "title": title,
        "description": description,
        "seller_id": seller_id,
        "product_id": product_id,
        "clip_similarity_score": round(similarity_score, 3),
        "predicted_brand": flags["predicted_brand"],
        "brand_confidence": flags["brand_confidence"],
        "top_3_brand_guesses": flags["top_3_brand_guesses"],
        "claimed_brand": flags["claimed_brand"],
        "brand_mismatch": flags["brand_mismatch"],
        "suspected_counterfeit": suspected_counterfeit,
        "image_path": image_path if image_path else "Deleted (not suspicious)"
    }


# 📥 GET flagged items
@router.get("/flagged_items/")
def get_flagged_items():
    if os.path.exists(FLAGGED_LOG):
        with open(FLAGGED_LOG, "r") as f:
            return json.load(f)
    return []


# 📥 GET authentic items
@router.get("/authentic_items/")
def get_authentic_items():
    if os.path.exists(AUTHENTIC_LOG):
        with open(AUTHENTIC_LOG, "r") as f:
            return json.load(f)
    return []
