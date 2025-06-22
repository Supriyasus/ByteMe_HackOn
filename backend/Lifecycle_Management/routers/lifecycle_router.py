from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from uuid import UUID
from typing import List

# --- THIS IS THE FIX ---
# Import the specific modules you need using relative paths.
# The two dots (..) go up one directory from `routers/` to `Lifecycle_Management/`.
from ..db import SessionLocal
from .. import models, schemas # <-- This line imports your models.py and schemas.py
from ..utils.trust_score import compute_trust_score

router = APIRouter(
    prefix="/lifecycle", # Added prefix for better organization
    tags=["Product Lifecycle"]
)

# This get_db function is now correctly defined here
async def get_db():
    async with SessionLocal() as session:
        yield session

valid_transitions = {
    "listed": ["purchased"], "purchased": ["delivered", "returned"],
    "delivered": ["reviewed", "returned"], "reviewed": ["flagged_fraud"],
    "returned": ["flagged_fraud"], "flagged_fraud": []
}

@router.post("/product/state-transition")
async def transition_product_state(data: schemas.StateTransition, db: AsyncSession = Depends(get_db)):
    # The `data` parameter now correctly resolves `schemas.StateTransition`
    
    product = await db.get(models.Product, data.product_id)
    if not product:
        # For a hackathon demo, it's useful to create a product if it doesn't exist
        print(f"DEBUG: Product {data.product_id} not found, creating it.")
        product = models.Product(id=data.product_id, current_state="listed")
        db.add(product)
        # In a real app, you might raise this error instead:
        # raise HTTPException(status_code=404, detail="Product not found")

    if data.new_state not in valid_transitions.get(product.current_state, []):
        raise HTTPException(status_code=400, detail="Invalid state transition")

    # This line now correctly resolves `models.LifecycleLog`
    log = models.LifecycleLog(
        product_id=data.product_id,
        seller_id=data.seller_id,
        previous_state=product.current_state,
        current_state=data.new_state,
        timestamp=datetime.utcnow(),
        extra_metadata=str(data.metadata) # Store as string for SQLite compatibility
    )

    product.current_state = data.new_state
    db.add(log)
    await db.commit()
    return {"message": "Transition successful"}

@router.get(
    "/product/{product_id}/lifecycle",
    response_model=List[schemas.LifecycleLogResponse] # This now resolves correctly
)
async def get_lifecycle(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.LifecycleLog).where(models.LifecycleLog.product_id == product_id).order_by(models.LifecycleLog.timestamp)
    )
    logs = result.scalars().all()
    if not logs:
        raise HTTPException(status_code=404, detail="No lifecycle logs found for this product.")
    return logs

@router.get("/product/{product_id}/trust-score")
async def get_score(product_id: UUID, db: AsyncSession = Depends(get_db)):
    score, reasons = await compute_trust_score(db, product_id)
    return { "product_id": product_id, "score": score, "reasons": reasons }