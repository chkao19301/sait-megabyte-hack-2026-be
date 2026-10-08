# SAIT Megabyte Hackathon 2026 - Backend

A lightweight and fast FastAPI starter service designed for rapid prototyping.

## Features
- **FastAPI**: High performance, auto-generated interactive API docs (`/docs`).
- **CORS enabled**: Pre-configured to allow frontend access (`*`) without cross-origin issues.
- **Ready-to-go**: Includes health check and sample echo API endpoints.

## Quick Start

### 1. Create Virtual Environment (First time setup)

```bash
python -m venv .venv
```

*(Optional) Copy environment variables:*
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.\.venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Development Server
```bash
python main.py
```
or via Uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The service will start at `http://localhost:8000`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service root and welcome message |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/api/echo` | Sample echo endpoint accepting `{"message": "..."}` |
| `GET` | `/docs` | Interactive Swagger UI API documentation |
| `GET` | `/redoc` | Interactive ReDoc documentation |
