// src/components/CircuitInfoCard.tsx
import React from "react";
import type { CircuitPayload } from "../api/raceApi";

type Props = {
  data: CircuitPayload | null;
};

function Line({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function CircuitInfoCard({ data }: Props) {
  if (!data) return null;

  const { circuit, event, fastest_laps } = data;
  const title = circuit?.name ?? event?.event_name;
  const sub =
    circuit?.display_location ??
    `${event?.event_location}, ${event?.event_country}`;
  const length = circuit?.length_km
    ? `${circuit.length_km.toFixed(3)} km`
    : undefined;
  const turns = circuit?.turns ?? undefined;
  const layoutUrl = circuit?.layout_img_url || null;

  const fq = fastest_laps?.fastest_qual;
  const fr = fastest_laps?.fastest_race;

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr,180px] gap-4 items-start">
      <div className="p-4 rounded-lg border bg-white shadow text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-700">{sub}</p>
          </div>
          {event?.event_round && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
              Round {event.event_round}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <Line label="Track length" value={length} />
          <Line label="Turns" value={turns} />
          <Line
            label="Fastest Qualifying"
            value={
              fq
                ? `${fq.driver ?? "—"} — ${fq.time?.replace(/^.*(\d{2}:\d{2}\.\d{3}).*$/, "$1") ?? "—"}`
                : undefined
            }
          />

          <Line
            label="Fastest Race Lap"
            value={
              fr
                ? `${fr.driver ?? "—"} — ${fr.time?.replace(/^.*(\d{2}:\d{2}\.\d{3}).*$/, "$1") ?? "—"}${fr.lap_number ? ` (Lap ${fr.lap_number})` : ""}`
                : undefined
            }
          />
        </div>

        {circuit?.wiki_url && (
          <a
            className="inline-block mt-4 text-sm underline text-blue-600"
            href={circuit.wiki_url}
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
        )}
      </div>

      {layoutUrl && (
        <div className="rounded-lg border bg-white shadow overflow-hidden">
          <img
            src={layoutUrl}
            alt={`${title} layout`}
            className="w-full h-[180px] object-contain bg-gray-50"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
