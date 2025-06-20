import os
import json
from fastapi import APIRouter, HTTPException, Body
from ..utils.scoring import scoring_service # Relative imports
from ..utils.schemas import CustomerFeatures, FraudScoreResponse

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

# Endpoint for list of suspicious
@router.get("/suspicious_customers_report")
async def get_suspicious_customers_report():
    """
    Retrieves a pre-generated report of the top customers
    flagged for anomalous return behavior.
    """
    # report_path = 'backend/data/suspicious_customers_report.json'
     # Is your server running from the root directory? Let's make the path more robust.
    # This builds a path from the current file's location.
    current_dir = os.path.dirname(__file__)
    report_path = os.path.join(current_dir, '..', '..', 'data', 'suspicious_customers_report.json')

    try:
        with open(report_path, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"DEBUG: Could not find report at absolute path: {os.path.abspath(report_path)}")

        raise HTTPException(
            status_code=404, 
            detail="Suspicious customers report not found. Please run the training pipeline."
        )