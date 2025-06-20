from pydantic import BaseModel
from typing import List

# This model defines the features required for a single customer
# Your frontend or another service would provide this data
class CustomerFeatures(BaseModel):
    total_invoices: int
    total_items: int
    total_spend: float
    distinct_products: int
    days_as_customer: int
    recency: int
    total_items_returned: int
    total_value_returned: float
    total_return_invoices: int
    return_rate_by_items: float
    return_rate_by_value: float
    return_rate_by_invoices: float

class FraudScoreResponse(BaseModel):
    customer_id: str
    is_anomaly: bool
    anomaly_score: float
    assessment: str