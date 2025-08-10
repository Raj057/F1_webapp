import { useEffect, useState } from "react";

interface RaceResult {
  driver: string;
  team: string;
  laps: number;
  avg_laptime: string;
  status: string;
  position: number;
}

export default function RaceResults() {
  const [year, setYear] = useState("2023");
  const [races, setRaces] = useState<string[]>([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [error, setError] = useState("");

  // Fetch races whenever the year changes
  useEffect(() => {
    setSelectedRace("");
    setResults(null);
    fetch(`http://127.0.0.1:8000/race/${year}/races`)
      .then((res) => res.json())
      .then((data) => {
        if (data.races) {
          setRaces(data.races);
          setError("");
        } else {
          setRaces([]);
          setError("No races found for the selected year.");
        }
      })
      .catch(() => setError("Failed to fetch race list."));
  }, [year]);

  const fetchRaceResults = () => {
    if (!selectedRace) return;
    setResults(null);
    setError("");

    fetch(`http://127.0.0.1:8000/race/${year}/${encodeURIComponent(selectedRace)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setError("No results found for this race.");
        }
      })
      .catch(() => setError("Unable to fetch race results."));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">F1 Race Results Viewer</h1>

      {/* Year Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {Array.from({ length: 2025 - 2018 + 1 }, (_, i) => 2018 + i).map((yr) => (
            <option key={yr} value={yr.toString()}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Race Selector */}
      {races.length > 0 && (
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select Race:</label>
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          >
            <option value="">-- Choose Race --</option>
            {races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={fetchRaceResults}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        disabled={!selectedRace}
      >
        Load Race Results
      </button>

      {/* Error */}
      {error && <div className="text-red-600 mt-4">{error}</div>}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Results for {selectedRace}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Laps</th>
                  <th className="px-4 py-2 text-left">Avg Lap Time</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.driver} className="border-t">
                    <td className="px-4 py-2">{res.position}</td>
                    <td className="px-4 py-2">{res.driver}</td>
                    <td className="px-4 py-2">{res.team}</td>
                    <td className="px-4 py-2">{res.laps}</td>
                    <td className="px-4 py-2">{res.avg_laptime}</td>
                    <td className="px-4 py-2">{res.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
