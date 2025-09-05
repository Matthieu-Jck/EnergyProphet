import { Country } from '../types'
import Select, { components } from 'react-select'

interface Props {
    countries: Country[]
    value: string
    onChange: (id: string) => void
}

export default function CountryPicker({ countries, value, onChange }: Props) {
    const selectedCountry = countries.find((c) => c.id === value)

    return (
        <Select
            options={countries}
            value={selectedCountry}
            onChange={(option) => onChange(option ? option.id : '')}
            getOptionLabel={(option: Country) => option.name}
            getOptionValue={(option: Country) => option.id}
            formatOptionLabel={(option: Country) => (
                <div className="flex items-center" style={{ userSelect: 'none' }}>
                    <img
                        src={`/icons/${option.id.toLowerCase()}.png`}
                        alt={`${option.name} flag`}
                        className="w-5 h-5 mr-2"
                        style={{
                            userSelect: 'none',
                            pointerEvents: 'none',
                            cursor: 'default',
                        }}
                    />
                    <span>{option.name}</span>
                </div>
            )}
            className="text-black"
            styles={{
                control: (base, { isFocused }) => ({
                    ...base,
                    backgroundColor: '#ffffffff',
                    color: 'black',
                    borderColor: isFocused ? '#0eae00ff' : '#000000ff',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    '&:hover': {
                        borderColor: '#0eae00ff',
                    },
                    boxShadow: isFocused ? 'none' : 'none',
                    outline: 'none',
                    width: '160px',
                    fontSize: '0.875rem',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    userSelect: 'none',
                    cursor: 'pointer',
                }),
                singleValue: (base) => ({
                    ...base,
                    color: 'black',
                    fontSize: '0.875rem',
                    lineHeight: '1.25',
                    margin: 0,
                    padding: 0,
                    userSelect: 'none',
                }),
                menu: (base) => ({
                    ...base,
                    color: '#1F2937',
                    width: '160px',
                }),
                option: (base, { isFocused }) => ({
                    ...base,
                    backgroundColor: isFocused ? '#F3F4F6' : 'white',
                    color: '#1F2937',
                    fontSize: '0.875rem',
                    userSelect: 'none',
                    cursor: 'pointer',
                }),
            }}
        />
    )
}