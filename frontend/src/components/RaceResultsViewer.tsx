import React, { useEffect, useState } from "react";

type RaceResult = {
  driver_number: string;
  driver_name: string;
  abbreviation: string;
  team: string;
  laps: number;
  avg_laptime: string;
  status: string;
  position: number;
};

const RaceResultsViewer: React.FC = () => {
  const [year, setYear] = useState<string>("2023");
  const [races, setRaces] = useState<string[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [error, setError] = useState<string>("");

  const [circuitInfo, setCircuitInfo] = useState<{
    circuit: string;
    location: string;
    country: string;
  } | null>(null);

  // Fetch race list based on selected year
  useEffect(() => {
    setSelectedRace("");
    setResults(null);
    fetch(`http://127.0.0.1:8000/race/${year}/races`)
      .then((res) => res.json())
      .then((data) => {
        if (data.races && Array.isArray(data.races)) {
          setRaces(data.races);
          setError("");
        } else {
          setRaces([]);
          setError("No races found for the selected year.");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch race list:", err);
        setError("Failed to fetch race list.");
      });
  }, [year]);

  // Fetch race results manually on button click
  const handleShowResults = () => {
    if (!selectedRace) return;

    fetch(
      `http://127.0.0.1:8000/race/${year}/${encodeURIComponent(selectedRace)}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Race results API response:", data);
        if (data && Array.isArray(data.results)) {
          setResults(data.results);
          setCircuitInfo({
            circuit: data.circuit,
            location: data.location,
            country: data.country,
          });
          setError("");
        } else {
          setResults([]);
          setError("No results found for this race.");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch race results:", err);
        setError("Failed to fetch race results.");
      });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="mb-2 md:mb-0">
          <label className="block text-sm font-medium text-gray-700">
            Select Year:
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full md:w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 6 }, (_, i) => {
              const y = 2020 + i;
              return (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Race:
          </label>
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="mt-1 block w-full md:w-64 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a race --</option>
            {races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show Results Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleShowResults}
          disabled={!selectedRace || !year}
          className={`px-4 py-2 rounded-md text-white ${
            !selectedRace
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Show Results
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      {results && results.length > 0 && (
        <table className="w-full table-auto border-collapse border border-gray-300 mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Position</th>
              <th className="border border-gray-300 px-4 py-2">Driver</th>
              <th className="border border-gray-300 px-4 py-2">Team</th>
              <th className="border border-gray-300 px-4 py-2">Laps</th>
              <th className="border border-gray-300 px-4 py-2">Avg Lap Time</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">
                  {result.position}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {result.driver_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {result.team}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {result.laps}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {result.avg_laptime.replace(/^00:/, "")}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {result.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RaceResultsViewer;
