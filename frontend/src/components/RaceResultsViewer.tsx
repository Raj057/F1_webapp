type RaceResult = {
  position: number;
  driver_name: string;
  team: string;
  laps: number;
  total_time: string;
  fastest_lap_time: string;
  status: string;
  abbreviation: string;
  grid?: number; // new
};

type Props = {
  data: RaceResult[];
  highlightAbbr?: string; // fastest lap driver abbreviation
};

export default function RaceResultsViewer({ data, highlightAbbr }: Props) {
  if (!data?.length) return null;

  return (
    <table className="w-full table-auto border-collapse border border-gray-700">
      <thead>
        <tr className="bg-gray-800">
          <th>Pos</th>
          <th>Driver</th>
          <th>Team</th>
          <th>Laps</th>
          <th>Total Time / Gap</th>
          <th>Fastest Lap</th>
          <th>Status</th>
          
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => {
          const isFL = r.abbreviation === highlightAbbr;

          // Arrow logic
          let arrow = null;
          if (r.grid != null && r.position != null) {
            const delta = r.grid - r.position;
            if (delta > 0) {
              arrow = (
                <span className="text-green-500 font-bold">▲ {delta}</span>
              );
            } else if (delta < 0) {
              arrow = (
                <span className="text-red-500 font-bold">▼ {Math.abs(delta)}</span>
              );
            } else {
              arrow = <span className="text-gray-400">–</span>;
            }
          }

          return (
            <tr
              key={i}
              className={`text-center ${isFL ? "bg-[#800080] text-white" : ""}`}
            >
              <td>
                {isFL && <span className="font-bold">FL </span>}
                {r.position}
              </td>
              <td>{r.driver_name}</td>
              <td>{r.team}</td>
              <td>{r.laps}</td>
              <td>{r.total_time}</td>
              <td>{r.fastest_lap_time?.replace(/^0 days 00:/, "")}</td>
              <td>{r.status}</td>
              <td>{arrow}</td> {/* arrow here */}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
