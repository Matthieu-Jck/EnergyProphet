import axios from 'axios'
import { Country, PolicyInput, SimulationResult } from './types'


export async function getCountries(): Promise<Country[]> {
    const res = await axios.get('/api/countries')
    return res.data
}


export async function getCountry(id: string): Promise<Country> {
    const res = await axios.get(`/api/countries/${id}`)
    return res.data
}


export async function simulatePolicy(policy: PolicyInput): Promise<SimulationResult> {
    const res = await axios.post('/api/simulation', policy)
    return res.data
}