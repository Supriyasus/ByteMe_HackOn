from fastapi import FastAPI
from routers import metrics
from fastapi.middleware.cors import CORSMiddleware
from Post_Purchase.routers import fraud_router      #For Post_Purchase
from Fake_Review_Detection.routers import review_router # For Fake Review Detection
#import routers.ingestion
app = FastAPI(
    title="BYTEME Hackathon Project",
)


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


@app.get("/")
def read_root():
    return {"message": "API is running"}