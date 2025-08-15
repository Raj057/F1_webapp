// Official-style primary hues (tweak anytime):
export const TEAM_COLOURS: Record<string, string> = {
  "Red Bull Racing": "#4781D7",
  "Ferrari": "#ED1131",
  "Mercedes": "#00D7B6",
  "McLaren": "#F47600",
  "Aston Martin": "#229971",
  "Alpine": "#00A1E8",
  "Williams": "#1868DB",
  "RB  ": "#6C98FF",
  "Haas F1 Team": "#9C9FA2",
  "Stake F1 Team": "#01C00E",
  "AlphaTauri": "#6C98FF",
  "Alfa Romeo": "#01C00E", 
};

// exact match first, then loose contains
export function colorForTeam(team?: string): string | undefined {
  if (!team) return undefined;
  if (TEAM_COLOURS[team]) return TEAM_COLOURS[team];
  const k = Object.keys(TEAM_COLOURS).find(t => team.toLowerCase().includes(t.toLowerCase()));
  return k ? TEAM_COLOURS[k] : hashToColor(team); // fallback
}

// deterministic readable fallback from team string
function hashToColor(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  // medium saturation & lightness for contrast on dark bg
  return `hsl(${hue} 65% 55%)`;
}
