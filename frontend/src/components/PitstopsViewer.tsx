import React from "react";
import { colorForTeam } from "../constants/colors";

type Pitstop = {
  driver_name: string;
  lap: number;
  pit_stop_time: number | null;
  tyre_before: string | null;
  tyre_after: string | null;
};
type Props = { data: Pitstop[]; teamByDriver?: Record<string, string> };

function normalize(comp?: string | null) {
  if (!comp) return null;
  const c = comp.trim().toUpperCase();
  if (["S", "SOFT"].includes(c)) return "SOFT";
  if (["M", "MED", "MEDIUM"].includes(c)) return "MEDIUM";
  if (["H", "HARD"].includes(c)) return "HARD";
  if (["I", "INTER", "INTERMEDIATE"].includes(c)) return "INTER";
  if (["W", "WET", "FULL WET"].includes(c)) return "WET";
  if (["C1", "C2", "C3", "C4", "C5"].includes(c)) return c;
  return c;
}

const HARDNESS_ORDER: Record<string, number> = {
  SOFT: 1, MEDIUM: 2, HARD: 3, INTER: 4, WET: 5,
  C5: 1, C4: 2, C3: 3, C2: 4, C1: 5,
};

function tyreClasses(kind: string) {
  switch (kind) {
    case "SOFT": return "bg-red-600 text-white";
    case "MEDIUM": return "bg-yellow-400 text-black";
    case "HARD": return "bg-white text-gray-900 ring-1 ring-gray-300";
    case "INTER": return "bg-green-500 text-white";
    case "WET": return "bg-blue-600 text-white";
    case "C1": return "bg-gray-900 text-white";
    case "C2": return "bg-gray-700 text-white";
    case "C3": return "bg-gray-500 text-white";
    case "C4": return "bg-gray-300 text-gray-900";
    case "C5": return "bg-gray-100 text-gray-900 ring-1 ring-gray-300";
    default: return "bg-slate-200 text-slate-800";
  }
}

function TyreBadge({ compound }: { compound?: string | null }) {
  const norm = normalize(compound);
  if (!norm) return <span className="text-gray-400">-</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tyreClasses(norm)}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {norm}
    </span>
  );
}

function CompoundDelta({ before, after }: { before?: string | null; after?: string | null }) {
  const b = normalize(before); const a = normalize(after);
  if (!b || !a) return null;
  const db = HARDNESS_ORDER[b] ?? 999;
  const da = HARDNESS_ORDER[a] ?? 999;
  if (db === da) return <span className="text-xs text-gray-400 ml-2">→ same</span>;
  const softer = da < db;
  return (
    <span className={`text-xs ml-2 ${softer ? "text-rose-400" : "text-blue-300"}`}>
      {softer ? "↓ softer" : "↑ harder"}
    </span>
  );
}

function Legend() {
  const items = ["SOFT", "MEDIUM", "HARD", "INTER", "WET"];
  return (
    <div className="flex flex-wrap gap-2 text-xs mb-3">
      <span className="text-gray-500 mr-1">Legend:</span>
      {items.map((k) => (
        <span key={k} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${tyreClasses(k)}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {k}
        </span>
      ))}
    </div>
  );
}

export default function PitstopsViewer({ data, teamByDriver = {} }: Props) {
  if (!data?.length) return <p className="text-gray-600">No pit stop data.</p>;
  const rows = [...data].sort((a, b) => (a.lap - b.lap) || a.driver_name.localeCompare(b.driver_name));
  return (
    <div className="overflow-x-auto">
      <Legend />
      <table className="w-full table-auto border-collapse border border-gray-300 mt-6">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-2 px-3">Lap</th>
            <th className="font-semibold">Driver</th>
            <th className="py-2 px-3">Stop Time (s)</th>
            <th className="py-2 px-3">Tyre Before</th>
            <th className="py-2 px-3">Tyre After</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const team = teamByDriver[p.driver_name];
            console.log("PitstopsViewer → Row:", p.driver_name, `"${team}"`);
            const color = colorForTeam(team);
            return (
              <tr key={`${p.driver_name}-${p.lap}-${i}`} className="border-t">
                <td className="py-2 px-3">{p.lap}</td>
                <td className="py-2 px-3">
                  <span className="font-medium" style={color ? { color } : undefined}>
                    {p.driver_name}
                  </span>
                  {team && <span className="ml-2 text-xs text-gray-500">{team}</span>}
                </td>
                <td className="py-2 px-3">{p.pit_stop_time ?? "-"}</td>
                <td className="py-2 px-3">
                  <TyreBadge compound={p.tyre_before} />
                </td>
                <td className="py-2 px-3">
                  <TyreBadge compound={p.tyre_after} />
                  <CompoundDelta before={p.tyre_before} after={p.tyre_after} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
