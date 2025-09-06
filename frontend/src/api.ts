import axios from 'axios'
import { Country} from './types'


export async function getCountries(): Promise<Country[]> {
    const res = await axios.get('/api/countries')
    return res.data
}


export async function getCountry(id: string): Promise<Country> {
    const res = await axios.get(`/api/countries/${id}`)
    return res.data
}