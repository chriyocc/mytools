import React, { useState, useEffect, useRef } from 'react';
import './optionSelector.css';


interface OptionSelectorProps {
  name: string
  value: string;
  options_map: { [key: string]: string } | string[];
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  label: string;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ name, value, options_map, placeholder, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = Array.isArray(options_map)
    ? options_map.map(item => ({ name: item, option: item }))
    : Object.entries(options_map).map(([name, option]) => ({ name, option }));
  
  const selectedOption = options.find(option => option.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Handle closing other selectors when this one opens
    const handleOpenSelector = (event: CustomEvent) => {
      if (event.detail.name !== name && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('optionSelectorOpen', handleOpenSelector as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('optionSelectorOpen', handleOpenSelector as EventListener);
    };
  }, [isOpen, name]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Dispatch custom event to close other selectors
    if (newState) {
      const event = new CustomEvent('optionSelectorOpen', { detail: { name } });
      document.dispatchEvent(event);
    }
  };

  return (
    <>
      <div ref={containerRef} className="option-selector-container">
        <label className="option-selector-label">
          {label}
        </label>
        <div onClick={handleToggle} className="option-selector-button">
          {selectedOption ? (
            <div className="option-selector-selected">
              <span className="option-selector-text">{selectedOption.name}</span>
            </div>
          ) : (
            <span className="option-selector-placeholder">{placeholder}</span>
          )}
        </div>
        
        {isOpen && (
          <div className="option-selector-dropdown">
            {options.map((option) => (
              <div
                key={option.name}
                onClick={() => {
                  const newValue = value === option.name ? '' : option.name;
                  const syntheticEvent = {
                    target: { name, value: newValue }
                  } as React.ChangeEvent<HTMLSelectElement>;
                  onChange(syntheticEvent);
                  setIsOpen(false);
                }}
                className={`option-selector-option ${value === option.name ? 'selected' : ''}`}
              >
                <span className="option-selector-text">{option.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </>
  );
};

export default OptionSelector;