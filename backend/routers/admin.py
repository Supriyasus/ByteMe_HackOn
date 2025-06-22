from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter(prefix="/admin", tags=["Admin"])

FLAGGED_LOG = "flagged_items.json"

@router.get("/flagged/")
async def get_flagged_listings():
    if not os.path.exists(FLAGGED_LOG):
        raise HTTPException(status_code=404, detail="No flagged listings found.")

    with open(FLAGGED_LOG, "r") as f:
        data = json.load(f)

    if not data:
        return {"message": "No flagged listings yet."}
    
    return {"flagged_listings": data}
