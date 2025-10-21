import React, { useState, useEffect, useRef } from 'react';
import iconMap from './iconMap';
import './IconSelector.css';

interface IconSelectorProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  label: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({ name, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const icons = Object.entries(iconMap).map(([name, svg]) => ({ name, svg }));
  const selectedIcon = icons.find(icon => icon.name === value);

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
      document.addEventListener('iconSelectorOpen', handleOpenSelector as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('iconSelectorOpen', handleOpenSelector as EventListener);
    };
  }, [isOpen, name]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Dispatch custom event to close other selectors
    if (newState) {
      const event = new CustomEvent('iconSelectorOpen', { detail: { name } });
      document.dispatchEvent(event);
    }
  };

  return (
    <div ref={containerRef} className="icon-selector-container">
      <label className="icon-selector-label">
        {label}
      </label>
      <div onClick={handleToggle} className="icon-selector-button">
        {selectedIcon ? (
          <div className="icon-selector-selected">
            <div 
              className="icon-selector-icon"
              dangerouslySetInnerHTML={{ __html: selectedIcon.svg }} 
            />
            <span className="icon-selector-text">{selectedIcon.name}</span>
          </div>
        ) : (
          <span className="icon-selector-placeholder">Select an icon</span>
        )}
      </div>
      
      {isOpen && (
        <div className="icon-selector-dropdown">
          {icons.map((icon) => (
            <div
              key={icon.name}
              onClick={() => {
                const newValue = value === icon.name ? '' : icon.name;
                const syntheticEvent = {
                  target: { name, value: newValue }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(syntheticEvent);
                setIsOpen(false);
              }}
              className={`icon-selector-option ${value === icon.name ? 'selected' : ''}`}
            >
              <div 
                className="icon-selector-icon"
                dangerouslySetInnerHTML={{ __html: icon.svg }} 
              />
              <span className="icon-selector-text">{icon.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconSelector;