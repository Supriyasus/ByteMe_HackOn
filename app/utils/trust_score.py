from sqlalchemy.future import select
from app.models import LifecycleLog, Product, TrustScore
from datetime import datetime

async def compute_trust_score(db, product_id):
    result = await db.execute(select(LifecycleLog).where(LifecycleLog.product_id == product_id))
    logs = result.scalars().all()

    score = 100
    reasons = {}

    if any(log.current_state == "flagged_fraud" for log in logs):
        score -= 30
        reasons["flagged_fraud"] = -30

    if sum(1 for log in logs if log.current_state == "returned") >= 2:
        score -= 20
        reasons["multiple_returns"] = -20

    score = max(0, score)
    product = await db.get(Product, product_id)

    db.merge(TrustScore(
        product_id=product_id,
        seller_id=product.seller_id,
        score=score,
        last_updated=datetime.utcnow()
    ))
    await db.commit()
    return score, reasons