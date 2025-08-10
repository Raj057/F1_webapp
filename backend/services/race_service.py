# services/race_service.py
import fastf1
import pandas as pd



def get_race_summary(year: int, gp_name: str):
    try:
        session = fastf1.get_session(year, gp_name, 'R')
        session.load()
        drivers = list(session.drivers)
        results = []

        #max_laps = session.laps.groupby('Driver')['LapNumber'].max().max()

        results_df = session.results
        results_df["DriverNumber"] = results_df["DriverNumber"].astype(str)  # Convert to string for match
        final_classification = results_df.set_index("Abbreviation")["Position"]
        status_map = results_df.set_index("Abbreviation")["Status"].to_dict()
        abbr_map = results_df.set_index("DriverNumber")["Abbreviation"].to_dict()

        for drv in drivers:
            drv_data = session.laps.pick_drivers(drv)
            completed_laps = len(drv_data)
            avg_lap_time = drv_data['LapTime'].mean()
            avg_lap_str = "NaT" if pd.isna(avg_lap_time) else str(avg_lap_time).split(" ")[-1][:10]

            abbr = abbr_map.get(drv, "N/A")
            position = final_classification.get(abbr, "N/A")

            driver_info = session.get_driver(drv)

            results.append({
                "driver_number": drv,
                "driver_name": f"{driver_info['FirstName']} {driver_info['LastName']}",
                "abbreviation": abbr,
                "team": driver_info['TeamName'],
                "laps": completed_laps,
                "avg_laptime": avg_lap_str.lstrip("0:"),  # removes leading "00:"
                "status": status_map.get(abbr, "N/A"),
                "position": position
            })


        return {
            "circuit": session.event['EventName'],
            "location": session.event['Location'],
            "country": session.event['Country'],
            "results": results
        }

    except Exception as e:
        return {"error": str(e)}

# services/race_service.py

def format_time(t):
    if pd.isna(t):
        return "N/A"
    total_seconds = t.total_seconds()
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:06.3f}"  # MM:SS.mmm

def get_qualifying_summary(year: int, gp_name: str):
    try:
        session = fastf1.get_session(year, gp_name, 'Q')
        session.load()
        results = session.results

        qualifying_results = []
        for _, row in results.iterrows():
            driver_info = session.get_driver(row["DriverNumber"])
            qualifying_results.append({
                "position": row["Position"],
                "driver_number": row["DriverNumber"],
                "driver_name": f"{driver_info['FirstName']} {driver_info['LastName']}",
                "abbreviation": row["Abbreviation"],
                "team": row["TeamName"],
                "q1": format_time(row["Q1"]),
                "q2": format_time(row["Q2"]),
                "q3": format_time(row["Q3"]),
            })

        return {
            "circuit": session.event['EventName'],
            "location": session.event['Location'],
            "country": session.event['Country'],
            "qualifying_results": qualifying_results
        }

    except Exception as e:
        return {"error": str(e)}

def get_pitstops(year: int, gp_name: str):
    try:
        session = fastf1.get_session(year, gp_name, 'R')
        session.load()

        pit_data = session.get_pit_stops()
        if pit_data.empty:
            return {"message": "No pit stop data available"}

        pitstops = []
        for _, row in pit_data.iterrows():
            driver_info = session.get_driver(row["DriverNumber"])
            pitstops.append({
                "driver_number": row["DriverNumber"],
                "driver_name": f"{driver_info['FirstName']} {driver_info['LastName']}",
                "lap": int(row["Lap"]),
                "pit_time": f"{float(row['PitTime']):.3f}"
            })

        return {
            "circuit": session.event['EventName'],
            "location": session.event['Location'],
            "country": session.event['Country'],
            "pitstops": pitstops
        }

    except Exception as e:
        return {"error": str(e)}
