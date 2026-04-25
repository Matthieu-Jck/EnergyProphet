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
    control: { width: 150, fontSize: "0.8rem", minHeight: "2.55rem" },
    option: { fontSize: "0.8rem" },
  },
  compact: {
    control: { width: 146, fontSize: "0.75rem", minHeight: "2.2rem" },
    option: { fontSize: "0.75rem" },
  },
  ultra: {
    control: { width: 142, fontSize: "0.7rem", minHeight: "1.95rem" },
    option: { fontSize: "0.7rem" },
  },
} as const;

export default function CountryPicker({ countries, value, onChange, density = 'normal' }: Props) {
  const selectedCountry = countries.find((c) => c.id === value);
  const selectedDensity = densityStyles[density];

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
            className="mr-2 h-4 w-4"
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
          backgroundColor: 'rgba(255, 250, 242, 0.88)',
          color: '#173228',
          borderColor: isFocused ? '#c88a46' : 'rgba(255, 255, 255, 0.28)',
          padding: '0.15rem 0.35rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(14px)',
          transition: 'all 160ms ease',
          '&:hover': { borderColor: '#c88a46' },
          boxShadow: isFocused
            ? '0 0 0 3px rgba(200, 138, 70, 0.2), 0 14px 30px rgba(11, 29, 23, 0.18)'
            : '0 12px 24px rgba(11, 29, 23, 0.14)',
          outline: 'none',
          width: selectedDensity.control.width,
          fontSize: selectedDensity.control.fontSize,
          minHeight: selectedDensity.control.minHeight,
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          userSelect: 'none',
          cursor: 'pointer',
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 0.2rem',
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected ? 'rgba(47, 125, 98, 0.14)' : isFocused ? 'rgba(47, 125, 98, 0.08)' : 'transparent',
          color: '#173228',
          fontSize: selectedDensity.option.fontSize,
          userSelect: 'none',
          cursor: 'pointer',
          paddingTop: '0.65rem',
          paddingBottom: '0.65rem',
        }),
        indicatorsContainer: (base) => ({
          ...base,
          paddingRight: '0.15rem',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: '#244c3d',
          padding: '0 4px',
          svg: {
            width: '14px',
            height: '14px',
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: '#173228',
          fontSize: selectedDensity.control.fontSize,
          fontWeight: 600,
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
          color: '#173228',
          width: `${selectedDensity.control.width}px`,
          borderRadius: '1rem',
          fontSize: selectedDensity.option.fontSize,
          border: '1px solid rgba(36, 76, 61, 0.12)',
          backgroundColor: 'rgba(255, 250, 242, 0.96)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 20px 38px rgba(11, 29, 23, 0.16)',
          overflow: 'hidden',
        }),
        menuList: (base) => ({
          ...base,
          paddingTop: '0.35rem',
          paddingBottom: '0.35rem',
        }),
      }}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      menuPosition="fixed"
      menuShouldScrollIntoView={false}
    />
  );
}
