import os
from fastapi import FastAPI
from routers import ingestion
from routers import metrics
from fastapi.middleware.cors import CORSMiddleware
from Post_Purchase.routers import fraud_router      #For Post_Purchase
from Fake_Review_Detection.routers import review_router # For Fake Review Detection


app = FastAPI(
    title="BYTEME Hackathon Project",
)

app.include_router(ingestion.router)

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#app.include_router(ingestion.router)
app.include_router(metrics.router)
app.include_router(fraud_router.router, prefix="/api/v1")   #For Post_Purchase
app.include_router(review_router.router, prefix="/api/v1")  # For Fake Review Detection


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
