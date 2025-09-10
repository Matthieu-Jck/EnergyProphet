import { Country } from '../types';
import Select, { Props as SelectProps, SingleValue } from 'react-select';

interface Props {
  countries: Country[];
  value: string;
  onChange: (id: string) => void;
  density?: "normal" | "compact" | "ultra";
}

const TypedSelect = Select as unknown as <Option, IsMulti extends boolean = false>(
  props: SelectProps<Option, IsMulti>
) => JSX.Element;

const densityStyles = {
  normal: {
    control: { width: 140, fontSize: "0.8rem", minHeight: "2.1rem" },
    option: { fontSize: "0.8rem" },
  },
  compact: {
    control: { width: 120, fontSize: "0.75rem", minHeight: "1.9rem" },
    option: { fontSize: "0.75rem" },
  },
  ultra: {
    control: { width: 110, fontSize: "0.7rem", minHeight: "1.7rem" },
    option: { fontSize: "0.7rem" },
  },
} as const;


export default function CountryPicker({ countries, value, onChange }: Props) {
  const selectedCountry = countries.find((c) => c.id === value);

  return (
    <TypedSelect<Country, false>
      options={countries}
      value={selectedCountry || null}
      onChange={(option: SingleValue<Country>) =>
        onChange(option ? option.id : '')
      }
      isSearchable={false}
      getOptionLabel={(option: Country) => option.name}
      getOptionValue={(option: Country) => option.id}
      formatOptionLabel={(option: Country) => (
        <div className="flex items-center" style={{ userSelect: 'none' }}>
          <img
            src={`./icons/${option.id.toLowerCase()}.png`}
            alt={`${option.name} flag`}
            className="w-4 h-4 mr-2"
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
          padding: '0.1rem 0.25rem',
          borderRadius: '0.5rem',
          '&:hover': {
            borderColor: '#0eae00ff',
          },
          boxShadow: isFocused ? '0 0 0 1px #0eae00ff' : 'none',
          outline: 'none',
          width: '140px',
          fontSize: '0.8rem',
          minHeight: '2.1rem',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          userSelect: 'none',
          cursor: 'pointer',
          input: {
            position: 'absolute',
            width: '0',
            height: '0',
            opacity: 0,
            cursor: 'pointer',
          },
        }),
        indicatorsContainer: (base) => ({
          ...base,
          padding: 0,
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: '0 4px',
          svg: {
            width: '14px',
            height: '14px',
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: 'black',
          fontSize: '0.8rem',
          lineHeight: '1.2',
          margin: 0,
          padding: 0,
          userSelect: 'none',
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menu: (base) => ({
          ...base,
          color: '#1F2937',
          width: '140px',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
        }),
        option: (base, { isFocused }) => ({
          ...base,
          backgroundColor: isFocused ? '#F3F4F6' : 'white',
          color: '#1F2937',
          fontSize: '0.8rem',
          userSelect: 'none',
          cursor: 'pointer',
        }),
      }}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      menuPosition="fixed"
      menuShouldScrollIntoView={false}
    />
  );
}