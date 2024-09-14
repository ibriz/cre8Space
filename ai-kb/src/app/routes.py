from fastapi import APIRouter
from router.rag_operations import router as rag_operations_router

router = APIRouter(prefix="/api/v1")

router.include_router(rag_operations_router)