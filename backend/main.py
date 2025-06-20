from fastapi import FastAPI
from routers import metrics
from fastapi.middleware.cors import CORSMiddleware
from Post_Purchase.routers import fraud_router      #For Post_Purchase

app = FastAPI()

app.include_router(ingestion.router)
app.include_router(metrics.router)
app.include_router(fraud_router.router, prefix="/api/v1")   #For Post_Purchase

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
