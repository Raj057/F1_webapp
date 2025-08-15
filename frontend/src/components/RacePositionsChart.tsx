import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { colorForTeam } from "../constants/colors";

type Props = {
  laps: number[];
  positions: Record<string, (number | null)[]>;
  driverNames: Record<string, string>;
  teamByAbbr: Record<string, string>;
};

function CustomTooltip({ active, payload, label, selectedDrivers }: any) {
  if (!active || !payload || !payload.length) return null;

  let filtered = [...payload];
  if (selectedDrivers.length > 0) {
    filtered = filtered.filter((d) => selectedDrivers.includes(d.dataKey));
  }

  const sorted = filtered.sort((a, b) => {
    if (a.value == null) return 1;
    if (b.value == null) return -1;
    return a.value - b.value;
  });

  const showFullNames =
    selectedDrivers.length > 0 && selectedDrivers.length <= 2;

  return (
    <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-[260px]">
      <div className="font-semibold mb-1">Lap {label}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {sorted.map((d) => {
          const clr = colorForTeam(d.payload[`${d.dataKey}_team`]);
          const name = showFullNames
            ? d.payload[`${d.dataKey}_name`]
            : d.dataKey;
          return (
            <div key={d.dataKey} className="flex items-center gap-1">
              <span className="font-bold" style={{ color: clr }}>
                {d.value ?? "–"}
              </span>
              <span style={{ color: clr }}>{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RacePositionsChart({
  laps,
  positions,
  driverNames,
  teamByAbbr,
}: Props) {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  const toggleDriver = (abbr: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(abbr)
        ? prev.filter((d) => d !== abbr)
        : [...prev, abbr]
    );
  };

  // Prepare chart data with extra fields for tooltip
  const chartData = laps.map((lap, i) => {
    const row: any = { lap };
    for (const abbr in positions) {
      row[abbr] = positions[abbr][i];
      row[`${abbr}_team`] = teamByAbbr[abbr];
      row[`${abbr}_name`] = driverNames[abbr];
    }
    return row;
  });

  const firstLapValue = chartData[0].lap;
  const lastLapValue = chartData[chartData.length - 1].lap;

  // Start/end positions + delta
  const startEndData = Object.keys(positions).map((abbr) => {
    const vals = positions[abbr];
    const start = vals.find((v) => v != null) ?? null;
    const end = [...vals].reverse().find((v) => v != null) ?? null;
    const delta =
      start != null && end != null ? start - end : null;
    return { abbr, start, end, delta };
  });

  const endMarkerData = startEndData
  .filter(d => d.end != null)
  .map(d => ({
    x: lastLapValue + 1, // place slightly beyond last lap
    y: d.end,
    abbr: d.abbr,
    delta: d.delta,
    team: teamByAbbr[d.abbr],
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.keys(driverNames).map((abbr) => (
          <button
            key={abbr}
            onClick={() => toggleDriver(abbr)}
            className={`px-2 py-1 rounded ${
              selectedDrivers.includes(abbr)
                ? "bg-red-500"
                : "bg-gray-700"
            }`}
            style={{
              border: `2px solid ${
                colorForTeam(teamByAbbr[abbr]) ?? "#888"
              }`,
            }}
          >
            {driverNames[abbr]}
          </button>
        ))}
      </div>
      <LineChart
        width={900}
        height={500}
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 20, left: 40 }} // extra space
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="lap" />
        <YAxis reversed tick={false} />
        <Tooltip
          content={
            <CustomTooltip selectedDrivers={selectedDrivers} />
          }
          wrapperStyle={{ zIndex: 1000 }}
        />

        {/* Start markers */}
        {startEndData.map(({ abbr, start }) => {
            console.log("RacePositionsChart → Button:", `"${teamByAbbr[abbr]}"`);
          const clr = colorForTeam(teamByAbbr[abbr]) ?? "#888";
          return start != null ? (
            <ReferenceDot
              key={`start-${abbr}`}
              x={firstLapValue}
              y={start}
              r={8}
              fill={clr}
              ifOverflow="extendDomain"
              label={{
                value: abbr,
                fill: "#fff",
                fontSize: 10,
                position: "left",
              }}
            />
          ) : null;
        })}

        {/* End markers */}
        {startEndData.map(({ abbr, end, delta }) => {
          const clr = colorForTeam(teamByAbbr[abbr]) ?? "#888";
          let arrow = "–";
          let arrowColor = "#999";
          if (delta != null && delta > 0) {
            arrow = "▲";
            arrowColor = "#4CAF50";
          } else if (delta != null && delta < 0) {
            arrow = "▼";
            arrowColor = "#F44336";
          }
          return end != null ? (
            <ReferenceDot
              key={`end-${abbr}`}
              x={lastLapValue}
              y={end}
              r={8}
              fill={clr}
              ifOverflow="extendDomain"
              label={({ x, y }) => (
                <g>
                  <text
                    x={x + 12}
                    y={y + 3}
                    fontSize="10"
                    fill="#fff"
                  >
                    {abbr}
                  </text>
                  <text
                    x={x + 35}
                    y={y + 3}
                    fontSize="10"
                    fill={arrowColor}
                  >
                    {arrow}{" "}
                    {delta != null ? Math.abs(delta) : ""}
                  </text>
                </g>
              )}
            />
          ) : null;
        })}

        {/* Driver lines */}
        {Object.keys(positions).map((abbr) => {
          const visible =
            selectedDrivers.length === 0 ||
            selectedDrivers.includes(abbr);
          return (
            <Line
              key={abbr}
              type="monotone"
              dataKey={abbr}
              stroke={colorForTeam(teamByAbbr[abbr]) ?? "#888"}
              strokeWidth={visible ? 2 : 1}
              strokeOpacity={visible ? 1 : 0.2}
              dot={false}
            />
          );
        })}
      </LineChart>
    </div>
  );
}
