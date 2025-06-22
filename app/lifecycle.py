from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from uuid import UUID
from typing import List

from app.db import SessionLocal
from app import models, schemas
from app.schemas import LifecycleLogResponse
from app.utils.trust_score import compute_trust_score

router = APIRouter()

valid_transitions = {
    "listed": ["purchased"],
    "purchased": ["delivered", "returned"],
    "delivered": ["reviewed", "returned"],
    "reviewed": ["flagged_fraud"],
    "returned": ["flagged_fraud"],
    "flagged_fraud": []
}

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/product/state-transition")
async def transition_product_state(data: schemas.StateTransition, db: AsyncSession = Depends(get_db)):
    product = await db.get(models.Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.new_state not in valid_transitions.get(product.current_state, []):
        raise HTTPException(status_code=400, detail="Invalid state transition")

    log = models.LifecycleLog(
        product_id=data.product_id,
        seller_id=data.seller_id,
        previous_state=product.current_state,
        current_state=data.new_state,
        timestamp=datetime.utcnow(),
        extra_metadata=data.metadata
    )

    product.current_state = data.new_state
    db.add(log)
    await db.commit()
    return {"message": "Transition successful"}

@router.get(
    "/product/{product_id}/lifecycle",
    response_model=List[LifecycleLogResponse]
)
async def get_lifecycle(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.LifecycleLog).where(models.LifecycleLog.product_id == product_id)
    )
    logs = result.scalars().all()
    return logs

@router.get("/product/{product_id}/trust-score")
async def get_score(product_id: UUID, db: AsyncSession = Depends(get_db)):
    score, reasons = await compute_trust_score(db, product_id)
    return {
        "product_id": product_id,
        "score": score,
        "reasons": reasons
    }