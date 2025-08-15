// src/pages/RaceWeekend/RaceWeekend.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import CircuitInfoCard from "../../components/CircuitInfoCard";
import RaceResultsViewer from "../../components/RaceResultsViewer";
import QualifyingResultsViewer from "../../components/QualifyingResultsViewer";
import PitstopsViewer from "../../components/PitstopsViewer";
import RacePositionsChart from "../../components/RacePositionsChart";

import {
  getRaceResults,
  getQualifyingResults,
  getPitstops,
  getCircuitDetails,
  getRaceList,
  getRacePositions,
  type CircuitPayload,
} from "../../api/raceApi";

type Tab = "race" | "qualifying" | "pitstops" | "positions";
type WeekendData = {
  circuit: CircuitPayload;
  raceRows: any[];
  qualiRows: any[];
  pitRows: any[];
  teamByDriver: Record<string, string>;
  fastest_laps?: {
    fastest_qual?: {
      driver?: string;
      team?: string;
      time?: string;
      lap_number?: number | null;
    } | null;
    fastest_race?: {
      driver?: string;
      team?: string;
      time?: string;
      lap_number?: number | null;
    } | null;
  };
};

export default function RaceWeekend() {
  const [year, setYear] = useState<number>(2023);
  const [races, setRaces] = useState<string[]>([]);
  const [gpName, setGpName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("race");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positionsData, setPositionsData] = useState<any>(null);

  // keyed cache per weekend
  const cache = useRef<Map<string, WeekendData>>(new Map());
  const key = useMemo(() => (gpName ? `${year}|${gpName}` : ""), [year, gpName]);
  const data = key ? cache.current.get(key) : undefined;

  // load races when year changes
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setError(null);
        const list = await getRaceList(year);
        if (!cancel) {
          setRaces(list);
          if (!gpName || !list.includes(gpName)) setGpName(list[0] ?? "");
        }
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to fetch races");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [year]);

  const handleFetchAll = async () => {
    if (!gpName) {
      setError("Please select a Grand Prix");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [raceRes, qualRes, pitsRes, circ, posData] = await Promise.all([
        getRaceResults(year, gpName),
        getQualifyingResults(year, gpName),
        getPitstops(year, gpName),
        getCircuitDetails(year, gpName),
        getRacePositions(year, gpName),
      ]);

      const raceRows = raceRes?.results ?? [];
      const qualiRows =
        qualRes?.qualifying_results ?? qualRes?.results ?? [];
      const pitRows = pitsRes?.pitstops ?? [];
      

      // team map
      const teamByDriver = pitsRes?.teamByDriver ?? {};

      const packed: WeekendData = {
        circuit: circ,
        raceRows,
        qualiRows,
        pitRows,
        teamByDriver,
        fastest_laps: circ?.fastest_laps,
      };
      cache.current.set(key, packed);

      setPositionsData(posData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">F1 Race Weekend</h1>

      {/* Controls + single circuit card */}
      <div className="flex flex-wrap gap-4 items-start mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm text-gray-300">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="p-2 text-black rounded w-24"
            min={1950}
          />
          <label className="text-sm text-gray-300">Grand Prix</label>
          <select
            value={gpName}
            onChange={(e) => setGpName(e.target.value)}
            className="p-2 text-black rounded min-w-[260px]"
          >
            {races.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            onClick={handleFetchAll}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Show Results
          </button>
        </div>

        {data?.circuit && (
          <div className="flex-1 min-w-[320px] max-w-[650px]">
            <CircuitInfoCard data={data.circuit} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-700">
        {(["race", "qualifying", "pitstops", "positions"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`pb-2 ${
              activeTab === t
                ? "border-b-2 border-red-500 text-red-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab(t)}
          >
            {t === "race"
              ? "Race Results"
              : t === "qualifying"
              ? "Qualifying"
              : t === "pitstops"
              ? "Pitstops"
              : "Positions Chart"}
          </button>
        ))}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && data && (
        <>
          {activeTab === "race" && (
            <RaceResultsViewer
              data={data.raceRows}
              highlightAbbr={data?.fastest_laps?.fastest_race?.driver}
            />
          )}
          {activeTab === "qualifying" && (
            <QualifyingResultsViewer data={data.qualiRows} />
          )}
          {activeTab === "pitstops" && (
            <PitstopsViewer
              data={data.pitRows}
              teamByDriver={data.teamByDriver}
            />
          )}
          {activeTab === "positions" && positionsData && (
            <RacePositionsChart
              laps={positionsData.laps}
              positions={positionsData.positions}
              driverNames={positionsData.driverNames}
              teamByAbbr={positionsData.teamByAbbr}
            />
          )}
        </>
      )}
    </div>
  );
}
