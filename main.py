import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Hackathon API Service",
    description="Simple FastAPI backend for hackathon development",
    version="0.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EchoRequest(BaseModel):
    message: str


class EchoResponse(BaseModel):
    status: str
    received: str


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the Hackathon API service!",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/echo", response_model=EchoResponse)
def echo_message(payload: EchoRequest):
    return EchoResponse(
        status="success",
        received=payload.message,
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
