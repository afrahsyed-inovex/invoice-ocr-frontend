"""Upload endpoint for Munhim's invoice pipeline.

Munhim's own API (invoice_pipeline/api/app.py) is read-only: it serves results his CLI
already produced from data/. This adapter lets the frontend upload one file instead. It
calls his pipeline unchanged and returns his InvoiceRecord JSON unchanged:

    POST /extract  (multipart/form-data, field "file")  ->  InvoiceRecord

Nothing in munhims-backend/ is modified, and nothing is written there: each upload is
processed from a temporary folder that is deleted afterwards.

Run from munhims-backend/poc-munhim with his virtualenv (plus python-multipart):
    .venv/Scripts/python -m uvicorn app:app --app-dir ../../scripts/munhim-upload-api --port 8000
"""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from invoice_pipeline.cli import process_one
from invoice_pipeline.config import Settings
from invoice_pipeline.logging_config import setup_logging
from invoice_pipeline.models import InvoiceRecord
from invoice_pipeline.ocr.tesseract import TesseractEngine

logger = logging.getLogger("munhim_upload_api")

settings = Settings.from_env()
setup_logging(settings.log_level, settings.log_dir)
engine = TesseractEngine(settings.tesseract_cmd)

app = FastAPI(title="Munhim pipeline upload adapter", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "tesseract": engine.version()}


@app.post("/extract", response_model=InvoiceRecord)
def extract(file: UploadFile = File(...)) -> InvoiceRecord:
    """Run his pipeline on the uploaded file. Failures come back as his `failed` record."""
    # His record id and source_file come from the file name, so keep the original name.
    file_name = Path(file.filename or "upload").name or "upload"
    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder) / file_name
        path.write_bytes(file.file.read())
        logger.info("Processing upload %s (%s bytes)", file_name, path.stat().st_size)
        return process_one(path, engine)
