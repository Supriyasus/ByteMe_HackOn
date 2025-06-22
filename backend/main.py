import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ingestion
from routers import detect
from routers import admin 

app = FastAPI()

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
UPLOAD_DIR = "uploads"
EVIDENCE_DIR = "evidence"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# Include routers
app.include_router(ingestion.router)
app.include_router(detect.router)
app.include_router(admin.router)

# Root route
@app.get("/")
def read_root():
    return {"message": "Counterfeit Detection API running"}
