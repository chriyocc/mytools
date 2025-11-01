import { useState, useEffect, useRef } from 'react';
import './SearchSelector.css';

interface Option {
  label: string;
  value: string;
  [key: string]: any; // Allow additional properties
}

interface SearchSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fetchOptions: () => Promise<Option[]> | Option[];
  prefix?: string;
  filterBy?: (keyof Option)[]; // Which fields to filter by
  renderOption?: (option: Option) => React.ReactNode; // Custom option renderer
  emptyMessage?: string;
  allowCustomValue?: boolean; // Allow entering custom values not in the list
}

const SearchSelector = ({ 
  value, 
  onChange, 
  placeholder = 'Search or select an option...',
  fetchOptions,
  prefix = '',
  filterBy = ['label', 'value'],
  renderOption,
  emptyMessage = 'No options found'
}: SearchSelectorProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    // Filter options based on input value
    if (value) {
      const filtered = options.filter(option =>
        filterBy.some(key => {
          const fieldValue = option[key];
          return typeof fieldValue === 'string' && 
                 fieldValue.toLowerCase().includes(value.toLowerCase());
        })
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options, filterBy]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadOptions = async () => {
    try {
      const data = await fetchOptions();
      setOptions(data);
      setFilteredOptions(data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const defaultRenderOption = (option: Option) => (
    <>
      <span className="option-label">{option.label}</span>
      {option.value !== option.label && (
        <span className="option-value">{option.value}</span>
      )}
    </>
  );

  return (
    <div className="search-selector-container" ref={wrapperRef}>
      <div className="search-selector-input-wrapper">
        {prefix && (
          <span className="search-selector-prefix">{prefix}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="search-selector-input"
        />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <ul className="search-selector-dropdown">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelectOption(option)}
              className="search-selector-item"
            >
              {renderOption ? renderOption(option) : defaultRenderOption(option)}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && filteredOptions.length === 0 && value && (
        <div className="search-selector-empty">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default SearchSelector;