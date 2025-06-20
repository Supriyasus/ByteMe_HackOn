from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from uuid import uuid4

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# manage the upload of image by the seller and use it later for counterfeit detection
@router.post("/upload_listing/")
async def upload_product_listing(
    image: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    seller_id: str = Form(...)
):
    file_ext = image.filename.split('.')[-1]
    filename = f"{uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Save metadata to DB (skipped here, but can be added)
    return {
        "message": "Listing uploaded",
        "image_path": file_path,
        "title": title,
        "description": description,
        "seller_id": seller_id
    }

@router.post("/upload_review/")
async def upload_review(
    image: UploadFile = File(...),
    review_text: str = Form(...),
    rating: int = Form(...),
    product_id: str = Form(...),
    user_id: str = Form(...)
):
    file_ext = image.filename.split('.')[-1]
    filename = f"{uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return {
        "message": "Review uploaded",
        "image_path": file_path,
        "review_text": review_text,
        "rating": rating,
        "product_id": product_id,
        "user_id": user_id
    }

@router.post("/log_event/")
async def log_user_event(
    event_type: str = Form(...),  # "return", "complaint", etc.
    user_id: str = Form(...),
    product_id: str = Form(...),
    comment: str = Form("")
):
    # Log this into DB or file (can be used for post-purchase fraud detection)
    return {
        "message": "Event logged",
        "event": {
            "type": event_type,
            "user_id": user_id,
            "product_id": product_id,
            "comment": comment
        }
    }
