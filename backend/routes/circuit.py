# routers/circuit.py
from fastapi import APIRouter, HTTPException
from services.circuit_service import build_circuit_payload

router = APIRouter(prefix="/circuit", tags=["Circuit"])

@router.get("/{year}/{gp_name}/details")
def circuit_details(year: int, gp_name: str):
    try:
        payload = build_circuit_payload(year, gp_name)
        if payload.get("circuit") is None:
            # Not fatal: we still return event + fastest laps,
            # but you can decide to raise 404 if you want strict matching.
            return payload
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
