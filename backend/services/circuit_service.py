# services/circuit_service.py
from functools import lru_cache
from pathlib import Path
from typing import Optional, Dict, Any

import pandas as pd
import fastf1

# Optional: speed up FastF1 by caching requests locally
# fastf1.Cache.enable_cache(Path(__file__).resolve().parents[1] / "f1_cache")

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "circuits.csv"

# You can extend this later with special cases or alternate names
ALIAS_OVERRIDES = {
    # "EventName or GP identifier" : "circuitRef from CSV"
    # Examples:
    "São Paulo Grand Prix": "interlagos",   # CSV often calls it Interlagos
    "Mexico City Grand Prix": "hermanos_rodriguez",
    "Emilia Romagna Grand Prix": "imola",
    "Dutch Grand Prix": "zandvoort",
    "Azerbaijan Grand Prix": "baku",
    "Saudi Arabian Grand Prix": "jeddah",
    "Qatar Grand Prix": "losail",
    "Las Vegas Grand Prix": "las_vegas",
}

def _norm(s: str) -> str:
    return "".join(ch.lower() for ch in s if ch.isalnum() or ch.isspace()).strip()

@lru_cache(maxsize=1)
def load_circuits_df() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    # Precompute normalized keys to help matching
    df["_norm_name"] = df["name"].apply(_norm)
    df["_norm_loc_country"] = (df["location"] + " " + df["country"]).apply(_norm)
    # Optional columns (length, turns) if you later add them to the CSV
    for col in ["length_km", "turns", "layout_img_url"]:
        if col not in df.columns:
            df[col] = None
    return df

def _find_circuit_row(event_name: str, location: str, country: str) -> Optional[pd.Series]:
    df = load_circuits_df()

    # 1) alias direct
    if event_name in ALIAS_OVERRIDES:
        ref = ALIAS_OVERRIDES[event_name]
        hit = df[df["circuitRef"].str.lower() == ref.lower()]
        if not hit.empty:
            return hit.iloc[0]

    # 2) location+country exact-ish
    loc_ctry = _norm(f"{location} {country}")
    hit = df[df["_norm_loc_country"] == loc_ctry]
    if not hit.empty:
        return hit.iloc[0]

    # 3) fuzzy-ish by name containment (cheap heuristic)
    ev_norm = _norm(event_name)
    candidates = df[df["_norm_name"].apply(lambda n: n in ev_norm or ev_norm in n)]
    if not candidates.empty:
        return candidates.iloc[0]

    # 4) fallback: location-only
    loc_only = _norm(location)
    cands = df[df["location"].apply(lambda s: _norm(str(s)) == loc_only)]
    if not cands.empty:
        return cands.iloc[0]

    return None

def get_event_context(year: int, gp_name: str) -> Dict[str, Any]:
    """Loads event meta from FastF1 without heavy dataframes."""
    # Race session is enough to get Event info (you can also use Quali)
    ses = fastf1.get_session(year, gp_name, "R")
    ses.load()  # Loads schedules/meta; not super heavy
    ev = ses.event
    return {
        "event_name": ev.EventName,
        "event_location": ev.Location,
        "event_country": ev.Country,
        "event_official_name": ev.OfficialEventName,
        "event_round": int(ev.RoundNumber) if hasattr(ev, "RoundNumber") else None,
        "circuit_name_fastf1": getattr(ev, "Circuit", None),
    }

def get_fastest_laps(year: int, gp_name: str) -> Dict[str, Any]:
    """Fastest qualifying lap and fastest race lap for THIS event/year."""
    qual = fastf1.get_session(year, gp_name, "Q")
    qual.load()
    race = fastf1.get_session(year, gp_name, "R")
    race.load()

    fastest = {}

    try:
        qf = qual.laps.pick_fastest()
        fastest["fastest_qual"] = {
            "driver": qf.get("Driver", None),
            "team": qf.get("Team", None),
            "time": str(qf.get("LapTime", None)),
            "lap_number": int(qf.get("LapNumber", 0)) if pd.notna(qf.get("LapNumber", None)) else None
        }
    except Exception:
        fastest["fastest_qual"] = None

    try:
        rf = race.laps.pick_fastest()
        fastest["fastest_race"] = {
            "driver": rf.get("Driver", None),
            "team": rf.get("Team", None),
            "time": str(rf.get("LapTime", None)),
            "lap_number": int(rf.get("LapNumber", 0)) if pd.notna(rf.get("LapNumber", None)) else None
        }
    except Exception:
        fastest["fastest_race"] = None

    return fastest

def build_circuit_payload(year: int, gp_name: str) -> Dict[str, Any]:
    """Combines CSV + FastF1 event meta + fastest laps into one response."""
    ctx = get_event_context(year, gp_name)
    row = _find_circuit_row(ctx["event_name"], ctx["event_location"], ctx["event_country"])

    base_meta = {
        "requested_gp": {"year": year, "gp_name": gp_name},
        "event": ctx,
        "csv_match_found": row is not None
    }

    if row is None:
        # Return event meta and fastest laps anyway
        base_meta["circuit"] = None
        base_meta["fastest_laps"] = get_fastest_laps(year, gp_name)
        return base_meta

    circuit_meta = {
        "circuitId": int(row["circuitId"]),
        "circuitRef": row["circuitRef"],
        "name": row["name"],
        "location": row["location"],
        "country": row["country"],
        "lat": float(row["lat"]) if pd.notna(row["lat"]) else None,
        "lng": float(row["lng"]) if pd.notna(row["lng"]) else None,
        "alt": float(row["alt"]) if pd.notna(row["alt"]) else None,
        "wiki_url": row["url"],
        # Optional fields if you add them to CSV later:
        "length_km": float(row["length_km"]) if pd.notna(row["length_km"]) else None,
        "turns": int(row["turns"]) if pd.notna(row["turns"]) else None,
        "layout_img_url": row["layout_img_url"] if pd.notna(row["layout_img_url"]) else None,
        # Derive a friendly line like "Monza, Italy"
        "display_location": f"{row['location']}, {row['country']}",
    }

    base_meta["circuit"] = circuit_meta
    base_meta["fastest_laps"] = get_fastest_laps(year, gp_name)
    return base_meta
