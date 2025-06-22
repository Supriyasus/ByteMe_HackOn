from sqlalchemy import Column, String, TIMESTAMP, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Float
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String)
    image_url = Column(String)
    current_state = Column(String, default="listed")
    created_at = Column(TIMESTAMP)

class LifecycleLog(Base):
    __tablename__ = "product_lifecycle_log"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"))
    seller_id = Column(UUID(as_uuid=True))
    previous_state = Column(String)
    current_state = Column(String)
    timestamp = Column(TIMESTAMP)
    extra_metadata = Column("metadata", JSON)

class TrustScore(Base):
    __tablename__ = "trust_scores"
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"), primary_key=True)
    seller_id = Column(UUID(as_uuid=True))
    score = Column(Float)
    last_updated = Column(TIMESTAMP)