from fastf1.ergast import Ergast
import datetime

ergast = Ergast()

# Hardcoded name-to-driverRef mapping for simplicity
'''def build_driver_name_map():
    try:
        driver_map = {}
        result = ergast.get_driver_info().content  # returns list of driver dicts

        for driver in result:
            full_name = f"{driver['givenName']} {driver['familyName']}".lower()
            driver_id = driver['driverId']
            driver_map[full_name] = driver_id

        return driver_map

    except Exception as e:
        print("Failed to build driver map:", e)
        return {}'''  # fallback empty dict or static backup

# Precompute it once
#name_to_code = build_driver_name_map()
name_to_code = {
    "Lewis Hamilton": "hamilton",
    "Max Verstappen": "max_verstappen",
    "Sebastian Vettel": "vettel",
    "Fernando Alonso": "alonso",
    "Charles Leclerc": "leclerc"
    # Add more as needed
}

def get_driver_profile(driver_name: str):
    driver_id = name_to_code.get(driver_name)
    if not driver_id:
        return {"error": "Driver not found."}

    # Get driver info
    driver_info = ergast.get_driver(driver_id).content[0]
    dob = driver_info['dateOfBirth']
    nationality = driver_info['nationality']

    # Get career stats
    results = ergast.get_driver_results(driver_id).content
    total_wins = sum(1 for r in results if r['position'] == '1')
    podiums = sum(1 for r in results if r['position'] in ['1', '2', '3'])

    # Pole positions (from qualifying results)
    qualifying_results = ergast.get_driver_qualifying_results(driver_id).content
    poles = sum(1 for q in qualifying_results if q['position'] == '1')

    # Fastest laps (not always available)
    fastest_laps = sum(1 for r in results if r.get('fastestLapRank') == '1')

    return {
        "name": driver_name,
        "date_of_birth": dob,
        "nationality": nationality,
        "career_stats": {
            "wins": total_wins,
            "podiums": podiums,
            "pole_positions": poles,
            "fastest_laps": fastest_laps
        }
    }