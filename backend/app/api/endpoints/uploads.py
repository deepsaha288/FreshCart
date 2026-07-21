"""Local image upload API endpoint."""
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile


router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIRECTORY = Path(__file__).resolve().parents[3] / "uploads"
MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """Save an image selected from the administrator's computer."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Use a JPG, PNG, WEBP, or GIF image")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The selected image is empty")
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")

    extension = Path(file.filename or "image").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
        }[file.content_type]

    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    (UPLOAD_DIRECTORY / filename).write_bytes(contents)

    return {"image_url": f"{str(request.base_url).rstrip('/')}/uploads/{filename}"}