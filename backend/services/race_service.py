# services/race_service.py
import fastf1
import pandas as pd

def format_time_val(val, is_gap=False, mode="race"):
    """
    Format time values for race results, fastest laps, or qualifying.
    
    mode:
        "race"  -> Total race time or gap to leader (supports hours if needed)
        "lap"   -> Lap time formatting (fastest laps, qualifying times) as m:ss.xxx
    """
    if pd.isna(val) or val is None:
        return None

    val_str = str(val).strip()

    # Remove '0 days ' or similar if present
    if "days" in val_str:
        val_str = val_str.split("days")[-1].strip()

    # Keep only 3 decimal places
    if "." in val_str:
        sec_part, ms_part = val_str.split(".")
        val_str = f"{sec_part}.{ms_part[:3]}"

    if mode == "race":
        # For gaps, prefix with "+" if not already
        if is_gap and not val_str.startswith("+"):
            val_str = f"+{val_str}"
        return val_str

    elif mode == "lap":
        # Remove any leading hours (ensure m:ss.xxx)
        parts = val_str.split(":")
        if len(parts) > 2:
            # Drop hours if present
            val_str = ":".join(parts[-2:])
        return val_str

    # Default fallback
    return val_str



import math

def safe_val(val):
    """Convert NaN/NaT to None so JSON serialization works."""
    if isinstance(val, float) and math.isnan(val):
        return None
    if pd.isna(val):
        return None
    return val

def get_race_summary(year: int, gp_name: str):
    try:
        session = fastf1.get_session(year, gp_name, 'R')
        session.load()
        drivers = list(session.drivers)
        results = []

        results_df = session.results
        results_df["DriverNumber"] = results_df["DriverNumber"].astype(str)
        final_classification = results_df.set_index("Abbreviation")["Position"]
        status_map = results_df.set_index("Abbreviation")["Status"].to_dict()
        abbr_map = results_df.set_index("DriverNumber")["Abbreviation"].to_dict()
        total_time_map = results_df.set_index("Abbreviation")["Time"].to_dict()
        
        fastest_lap_map = {}
        for drv in drivers:
            drv_data = session.laps.pick_drivers(drv)
            if not drv_data.empty:
                fastest_lap_map[abbr_map.get(drv, "N/A")] = drv_data['LapTime'].min()
            else:
                fastest_lap_map[abbr_map.get(drv, "N/A")] = None

        for drv in drivers:
            drv_data = session.laps.pick_drivers(drv)
            completed_laps = len(drv_data)
            avg_lap_time = drv_data['LapTime'].mean()
            avg_lap_str = "NaT" if pd.isna(avg_lap_time) else str(avg_lap_time).split(" ")[-1][:10]

            abbr = abbr_map.get(drv, "N/A")
            position = final_classification.get(abbr, "N/A")
            total_time_val = total_time_map.get(abbr)

            # Keep P1's actual time, others show as +gap
            formatted_total_time = format_time_val(total_time_val, is_gap=(position != 1), mode="race")

            fastest_lap_val = fastest_lap_map.get(abbr)
            formatted_fastest_lap = format_time_val(fastest_lap_val, mode="lap")

            driver_info = session.get_driver(drv)
            grid_pos = safe_val(driver_info.get("GridPosition", None))

            results.append({
                "driver_number": drv,
                "driver_name": f"{driver_info['FirstName']} {driver_info['LastName']}",
                "abbreviation": abbr,
                "team": driver_info['TeamName'],
                "laps": completed_laps,
                "avg_laptime": None if avg_lap_str == "NaT" else avg_lap_str.lstrip("0:"),
                "total_time": safe_val(formatted_total_time),
                "fastest_lap_time": safe_val(formatted_fastest_lap),
                "status": status_map.get(abbr, "N/A"),
                "position": safe_val(position),
                "grid": grid_pos
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
                "q1": format_time_val(row["Q1"],mode="lap"),
                "q2": format_time_val(row["Q2"],mode="lap"),
                "q3": format_time_val(row["Q3"],mode="lap"),
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
    import pandas as pd
    import fastf1

    pit_csv = pd.read_csv("data/pit_stops.csv")
    races_csv = pd.read_csv("data/races.csv")
    drivers_csv = pd.read_csv("data/drivers.csv")

    session = fastf1.get_session(year, gp_name, 'R')
    session.load()

    race_row = races_csv[
        (races_csv['year'] == year) &
        (races_csv['name'].str.lower() == gp_name.lower())
    ]
    race_id = race_row.iloc[0]['raceId'] if not race_row.empty else None

    pit_df = session.laps[session.laps['PitInTime'].notna()].copy()
    pit_df['PitStopDuration'] = (
        pit_df['PitOutTime'] - pit_df['PitInTime']
    ).dt.total_seconds()

    pitstops_list = []
    for _, row in pit_df.iterrows():
        driver_num = row['DriverNumber']
        driver_info = session.get_driver(driver_num)
        driver_code = driver_info['Abbreviation']
        driver_match = drivers_csv[drivers_csv['code'] == driver_code]
        driver_id = driver_match.iloc[0]['driverId'] if not driver_match.empty else None

        prev_lap = session.laps[
            (session.laps['DriverNumber'] == driver_num) &
            (session.laps['LapNumber'] == row['LapNumber'] - 1)
        ]
        tyre_before = prev_lap['Compound'].iloc[0] if not prev_lap.empty else None

        next_lap = session.laps[
            (session.laps['DriverNumber'] == driver_num) &
            (session.laps['LapNumber'] == row['LapNumber'] + 1)
        ]
        tyre_after = next_lap['Compound'].iloc[0] if not next_lap.empty else None

        pit_stop_time = row['PitStopDuration'] if pd.notnull(row['PitStopDuration']) else None

        if race_id is not None and driver_id is not None:
            csv_match = pit_csv[
                (pit_csv['raceId'] == race_id) &
                (pit_csv['driverId'] == driver_id) &
                (pit_csv['lap'] == row['LapNumber'])
            ]
            if not csv_match.empty and pd.notnull(csv_match.iloc[0]['milliseconds']):
                pit_stop_time = float(csv_match.iloc[0]['milliseconds']) / 1000.0

        pitstops_list.append({
            "driver_number": driver_num,
            "driver_name": driver_info['FullName'],
            "lap": int(row['LapNumber']),
            "pit_stop_time": round(pit_stop_time, 3) if pit_stop_time is not None else None,
            "tyre_before": tyre_before,
            "tyre_after": tyre_after
        })

    team_by_driver = {p['driver_name']: session.get_driver(p['driver_number'])['TeamName'] for p in pitstops_list}

    return {
        "circuit": session.event['EventName'],
        "location": session.event['Location'],
        "country": session.event['Country'],
        "pitstops": pitstops_list,
        "teamByDriver": team_by_driver
    }


def get_race_positions(year: int, gp_name: str):
    session = fastf1.get_session(year, gp_name, 'R')
    session.load()

    laps = sorted(session.laps['LapNumber'].unique())
    drivers = session.drivers
    abbr_map = {drv: session.get_driver(drv)['Abbreviation'] for drv in drivers}
    name_map = {abbr_map[drv]: f"{session.get_driver(drv)['FirstName']} {session.get_driver(drv)['LastName']}" for drv in drivers}
    team_map = {abbr_map[drv]: session.get_driver(drv)['TeamName'] for drv in drivers}

    positions = {}
    for drv in drivers:
        abbr = abbr_map[drv]
        drv_laps = session.laps.pick_drivers(drv).set_index('LapNumber')
        pos_series = []
        for lap in laps:
            if lap in drv_laps.index:
                val = drv_laps.loc[lap]['Position']
                pos_series.append(int(val) if pd.notna(val) else None)
            else:
                pos_series.append(None)
        positions[abbr] = pos_series

    return {
        "laps": laps,
        "positions": positions,
        "driverNames": name_map,
        "teamByAbbr": team_map
    }
