import axios from "axios";
import type { Country } from "./types";

const isDev = import.meta.env.DEV;

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || (isDev ? "https://localhost:5001" : "https://energyprophet.fly.dev"),
});

export async function getCountries(): Promise<Country[]> {
  const res = await apiClient.get<Country[]>("/api/countries");
  return res.data;
}

export async function getCountry(id: string): Promise<Country> {
  const res = await apiClient.get<Country>(`/api/countries/${id}`);
  return res.data;
}

// payload shape we send when the user clicks Analyze
export type UserChange = {
  id: string;
  prevShare?: number; // 0..1
  prevTWh?: number;
  newShare: number; // 0..1
  newTWh: number;
};

export async function sendAnalysis(countryId: string, changes: UserChange[]) {
  const res = await apiClient.post(`/api/countries/${countryId}/analysis`, changes);
  return res.data;
}

const api = { getCountries, getCountry, sendAnalysis };
export default api;