from fastapi import FastAPI
from routers import ingestion
from fastapi.middleware.cors import CORSMiddleware
from Post_Purchase.routers import fraud_router      #For Post_Purchase

app = FastAPI()

app.include_router(ingestion.router)
app.include_router(fraud_router.router, prefix="/api/v1")   #For Post_Purchase

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Trust & Safety API running"}
