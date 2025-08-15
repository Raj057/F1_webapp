// src/api/raceApi.ts

export type CircuitPayload = {
  requested_gp: { year: number; gp_name: string };
  event: {
    event_name: string;
    event_location: string;
    event_country: string;
    event_official_name?: string;
    event_round?: number | null;
    circuit_name_fastf1?: string | null;
  };
  csv_match_found: boolean;
  circuit: null | {
    circuitId: number;
    circuitRef: string;
    name: string;
    location: string;
    country: string;
    lat?: number | null;
    lng?: number | null;
    alt?: number | null;
    wiki_url?: string | null;
    length_km?: number | null;
    turns?: number | null;
    layout_img_url?: string | null;
    display_location?: string; // "Monza, Italy"
  };
  fastest_laps: {
    fastest_qual: null | { driver?: string; team?: string; time?: string; lap_number?: number | null };
    fastest_race: null | { driver?: string; team?: string; time?: string; lap_number?: number | null };
  };
};

export const getRaceResults = async (year: number, circuit: string) => {
  const res = await fetch(`http://127.0.0.1:8000/race/${year}/${circuit}`);
  if (!res.ok) throw new Error("Failed to fetch race results");
  return await res.json();
};

export const getQualifyingResults = async (year: number, circuit: string) => {
  const res = await fetch(
    `http://127.0.0.1:8000/race/${year}/${circuit}/qualifying`
  );
  if (!res.ok) throw new Error("Failed to fetch qualifying results");
  return await res.json();
};

export const getPitstops = async (year: number, circuit: string) => {
  const res = await fetch(
    `http://127.0.0.1:8000/race/${year}/${circuit}/pitstops`
  );
  if (!res.ok) throw new Error("Failed to fetch pit stop data");
  return await res.json();
};

// NEW — fetch circuit info
export async function getCircuitDetails(year: number, gp: string): Promise<CircuitPayload> {
  const r = await fetch(`http://127.0.0.1:8000/circuit/${year}/${encodeURIComponent(gp)}/details`);
  if (!r.ok) throw new Error("Failed to load circuit details");
  return r.json();
}


export async function getRaceList(year: number): Promise<string[]> {
  const r = await fetch(`http://127.0.0.1:8000/race/${year}/races`);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "Failed to load races");
  return j.races || [];
}

export const getRacePositions = async (year: number, circuit: string) => {
  const res = await fetch(`http://127.0.0.1:8000/race/${year}/${circuit}/positions`);
  if (!res.ok) throw new Error("Failed to fetch race positions");
  return await res.json();
};