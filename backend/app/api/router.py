from fastapi import APIRouter

router = APIRouter(prefix="/v1", tags=["health"])


@router.get("/health", summary="Health check")
async def health_check() -> dict[str, str]:
  return {"status": "ok"}
