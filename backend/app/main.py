"""FastAPI main application"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.mongodb import mongodb
from app.api.endpoints import auth, products, cart, orders, categories, uploads
from app.api.endpoints.uploads import UPLOAD_DIRECTORY


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    await mongodb.connect()
    yield
    # Shutdown
    await mongodb.disconnect()


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.invoice.pdf_service import PDFInvoiceService

UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY), name="uploads")

INVOICE_DIRECTORY = PDFInvoiceService.get_invoice_dir()
app.mount("/invoices", StaticFiles(directory=INVOICE_DIRECTORY), name="invoices")


# Include routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(uploads.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to FreshCart API"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "OK",
        "app": settings.API_TITLE,
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT
    }
