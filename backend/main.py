# File: backend/main.py

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Import all your routers ---
# These are in the local 'backend/routers/' folder
from routers import ingestion, metrics, admin, detect 

# These are in their own feature modules
from Post_Purchase.routers import fraud_router
from Fake_Review_Detection.routers import review_router

# --- 2. Initialize the FastAPI App ---
app = FastAPI(
    title="BYTEME Hackathon Project",
    description="API for Trust & Safety features including counterfeit detection, fake review analysis, and post-purchase fraud."
)

# --- 3. Add CORS Middleware ---
# This allows your React frontend (on localhost:3000) to communicate with the API.
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. Include all routers ---
# This is the central point where you define the final URL structure.

# General/utility routers
app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"]) # e.g., /api/v1/admin/flagged/

# Core feature routers
app.include_router(ingestion.router, prefix="/api/v1", tags=["Ingestion"]) # e.g., /api/v1/ingest/upload_listing/
app.include_router(detect.router, prefix="/api/v1", tags=["Detection"]) # e.g., /api/v1/detect/counterfeit/

# Other feature-specific routers
app.include_router(fraud_router.router, prefix="/api/v1")
app.include_router(review_router.router, prefix="/api/v1")


# --- 5. Define a root endpoint for a simple health check ---
@app.get("/")
def read_root():
    return {"message": "Trust & Safety API is running"}