from fastapi import APIRouter, HTTPException, Body
from ..utils.scoring import scoring_service # Relative imports
from ..schemas import CustomerFeatures, FraudScoreResponse

router = APIRouter(
    prefix="/post-purchase",
    tags=["Post-Purchase Fraud Detection"]
)

@router.post("/score_customer/{customer_id}", response_model=FraudScoreResponse)
async def score_customer_risk(customer_id: str, features: CustomerFeatures):
    """
    Analyzes a customer's features to provide a fraud/refund abuse risk score.
    - **anomaly_score**: A lower score indicates a higher risk.
    - **is_anomaly**: True if the customer is flagged as an outlier.
    """
    if scoring_service.model is None:
        raise HTTPException(status_code=503, detail="Fraud detection model is not available.")
    
    result = scoring_service.score_customer(customer_id, features)
    return result