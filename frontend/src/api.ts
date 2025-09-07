import axios from "axios";
import type { Country } from "./types";

export async function getCountries(): Promise<Country[]> {
  const res = await axios.get<Country[]>("/api/countries");
  return res.data;
}

export async function getCountry(id: string): Promise<Country> {
  const res = await axios.get<Country>(`/api/countries/${id}`);
  return res.data;
}

const api = { getCountries, getCountry };
export default api;