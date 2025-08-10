# routes/race.py
from fastapi import APIRouter
from services import race_service, driver_service

router = APIRouter()

from fastf1 import get_event_schedule

@router.get("/{year}/races")
def get_race_list(year: int):
    try:
        schedule = get_event_schedule(year)
        race_names = schedule['EventName'].tolist()
        return {"year": year, "races": race_names}
    except Exception as e:
        return {"error": str(e)}

@router.get("/{year}/{gp_name}")
def get_race(year: int, gp_name: str):
    return race_service.get_race_summary(year, gp_name)
@router.get("/{year}/{gp_name}/qualifying")
def qualifying_summary(year: int, gp_name: str):
    return race_service.get_qualifying_summary(year, gp_name)
@router.get("/{year}/{gp}/pitstops")
def pitstop_summary(year: int, gp: str):
    return race_service.get_pitstops(year, gp)
@router.get("/driver-profile/{driver_name}")
def driver_profile(driver_name: str):
    return driver_service.get_driver_profile(driver_name)
