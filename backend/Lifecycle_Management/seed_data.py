import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import asyncio
from datetime import datetime
import uuid
from backend.Lifecycle_Management.db import SessionLocal
from backend.Lifecycle_Management.models import Product, LifecycleLog
from sqlalchemy.ext.asyncio import AsyncSession

# Sample lifecycle transitions
transitions = [
    ("listed", "purchased"),
    ("purchased", "delivered"),
    ("delivered", "reviewed"),
]

async def seed_data():
    async with SessionLocal() as session:
        # Insert products
        product_ids = []
        for i in range(5):
            product_id = uuid.uuid4()
            seller_id = uuid.uuid4()
            product = Product(
                product_id=product_id,
                seller_id=seller_id,
                title=f"Product {i+1}",
                image_url=f"https://example.com/image{i+1}.jpg",
                current_state="listed",
                created_at=datetime.utcnow(),
            )
            session.add(product)
            product_ids.append((product_id, seller_id))

        await session.commit()

        # Insert lifecycle logs
        for product_id, seller_id in product_ids:
            state = "listed"
            for prev, curr in transitions:
                if state == prev:
                    log = LifecycleLog(
                        id=str(uuid.uuid4()),
                        product_id=product_id,
                        seller_id=seller_id,
                        previous_state=prev,
                        current_state=curr,
                        timestamp=datetime.utcnow(),
                        extra_metadata={"channel": "web", "country": "IN"},
                    )
                    session.add(log)
                    state = curr

        await session.commit()
        print("✅ Seed data inserted successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
