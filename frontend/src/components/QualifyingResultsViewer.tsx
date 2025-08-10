import { useEffect, useState } from "react";

type QualifyingResult = {
  position: number;
  driver: string;
  team: string;
  q1: string;
  q2: string;
  q3: string;
};

export default function QualifyingResultsViewer() {
  const [year, setYear] = useState<number>(2023);
  const [races, setRaces] = useState<string[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [results, setResults] = useState<QualifyingResult[]>([]);
  const [circuit, setCircuit] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch available races for selected year
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/races/${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRaces(data);
          setSelectedRace(data[0] || "");
        }
      })
      .catch(() => setError("Failed to fetch races for the selected year."));
  }, [year]);

  // Fetch qualifying results for selected race
  useEffect(() => {
    if (!selectedRace) return;

    fetch(`http://127.0.0.1:8000/${year}/${encodeURIComponent(selectedRace)}/qualifying`)

      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.qualifying_results)) {
          setResults(data.qualifying_results);
          setCircuit(data.circuit);
          setLocation(data.location);
          setCountry(data.country);
          setError("");
        } else {
          setResults([]);
          setError("No qualifying results found.");
        }
      })
      .catch(() => {
        setError("Error fetching qualifying results.");
      });
  }, [selectedRace, year]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Qualifying Results</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {Array.from({ length: 5 }, (_, i) => 2023 - i).map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Race:</label>
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {results.length > 0 && (
        <>
          <p className="mb-2 text-gray-700">
            <strong>{circuit}</strong> — {location}, {country}
          </p>

          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Pos</th>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-left">Team</th>
                <th className="px-4 py-2 text-left">Q1</th>
                <th className="px-4 py-2 text-left">Q2</th>
                <th className="px-4 py-2 text-left">Q3</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.driver}>
                  <td className="border px-4 py-2">{result.position}</td>
                  <td className="border px-4 py-2">{result.driver}</td>
                  <td className="border px-4 py-2">{result.team}</td>
                  <td className="border px-4 py-2">{result.q1}</td>
                  <td className="border px-4 py-2">{result.q2}</td>
                  <td className="border px-4 py-2">{result.q3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
