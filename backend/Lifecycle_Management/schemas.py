from pydantic import BaseModel, UUID4
from typing import Optional, Dict
from uuid import UUID
from datetime import datetime

class StateTransition(BaseModel):
    product_id: UUID4
    seller_id: UUID4
    new_state: str
    metadata: Optional[Dict] = {}

class StateResponse(BaseModel):
    previous_state: str
    current_state: str
    timestamp: str
    metadata: Optional[Dict]

class LifecycleLogResponse(BaseModel):
    product_id: UUID4
    seller_id: UUID4
    previous_state: str
    current_state: str
    timestamp: datetime
    extra_metadata: Optional[Dict] = None

    class Config:
        orm_mode = True

class TrustScoreResponse(BaseModel):
    product_id: UUID4
    score: float
    reasons: Optional[Dict] = {}