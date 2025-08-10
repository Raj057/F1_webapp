# models/race_models.py
from pydantic import BaseModel
from typing import List

class DriverResult(BaseModel):
    driver: str
    team: str
    laps: int
    avg_laptime: str

class RaceSummary(BaseModel):
    circuit: str
    location: str
    country: str
    results: List[DriverResult]
