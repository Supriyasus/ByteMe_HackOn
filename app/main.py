from fastapi import FastAPI
from app import lifecycle
from app.models import Base
from app.db import engine

app = FastAPI()
app.include_router(lifecycle.router)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
