// src/api/raceApi.ts
export const getRaceResults = async (year: number, circuit: string) => {
  const response = await fetch(`http://127.0.0.1:8000/race/results/${year}/${circuit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch race results");
  }
  return await response.json();
};
