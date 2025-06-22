import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/reviews",
    tags=["Fake Review Detection"]
)

# --- Define the base directory for our reports using os.path ---
# Get the path of the current file's directory (e.g., .../routers/)
current_dir = os.path.dirname(__file__)

# Go up two levels to get to the Fake_Review_Detection module's parent, which is the `backend` directory.
# `os.path.join` will correctly handle this.
# Note: For your fraud_router, it's `..` twice, here it's also twice:
# from .../routers/ -> .../Fake_Review_Detection/ -> backend/
# So we need to go up two directories from `/routers` to get to `/backend`.
backend_dir = os.path.join(current_dir, '..', '..')

# Now define the full path to the data directory
DATA_DIR = os.path.join(backend_dir, 'data')
# --- End of path definition ---

@router.get("/flagged")
async def get_flagged_reviews_report():
    """
    Retrieves the pre-generated report of flagged reviews.
    """
    report_path = os.path.join(DATA_DIR, "flagged_reviews_report.json")
    
    try:
        with open(report_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        # This debug message is very helpful
        print(f"DEBUG: Could not find report at absolute path: {os.path.abspath(report_path)}")
        raise HTTPException(
            status_code=404, 
            detail="Flagged reviews report not found. Please run the bulk analysis script first."
        )

@router.get("/stats")
async def get_review_stats_report():
    """
    Provides aggregate stats on fake vs. real reviews for charting.
    """
    report_path = os.path.join(DATA_DIR, "review_stats_report.json")
    
    try:
        with open(report_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"DEBUG: Could not find report at absolute path: {os.path.abspath(report_path)}")
        raise HTTPException(
            status_code=404, 
            detail="Review stats report not found. Please run the bulk analysis script first."
        )