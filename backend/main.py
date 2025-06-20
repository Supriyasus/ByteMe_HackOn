from fastapi import FastAPI
from routers import ingestion
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(ingestion.router)

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
