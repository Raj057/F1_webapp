// src/components/QualifyingResultsViewer.tsx
import React from "react";
type Row = { position: number; driver_name: string; team: string; q1: string | null; q2: string | null; q3: string | null; };
export default function QualifyingResultsViewer({ data }: { data: Row[] }) {
  if (!data?.length) return <p className="text-gray-300">No qualifying results.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-gray-700">
        <thead><tr className="bg-gray-800"><th>Position</th><th>Driver</th><th>Team</th><th>Q1</th><th>Q2</th><th>Q3</th></tr></thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="text-center">
              <td>{r.position}</td><td>{r.driver_name}</td><td>{r.team}</td>
              <td>{r.q1 ?? "-"}</td><td>{r.q2 ?? "-"}</td><td>{r.q3 ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
