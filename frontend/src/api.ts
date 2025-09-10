import axios from "axios";
import type { Country } from "./types";

const isDev = import.meta.env.DEV;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isDev ? "http://localhost:8080" : "https://energyprophet.fly.dev"),
});

export async function getCountries(): Promise<Country[]> {
  const res = await apiClient.get<Country[]>("/api/countries");
  return res.data;
}

export async function getCountry(id: string): Promise<Country> {
  const res = await apiClient.get<Country>(`/api/countries/${id}`);
  return res.data;
}

const api = { getCountries, getCountry };
export default api;