import React, { useState, useEffect, useRef } from 'react';
import './actionSelector.css';
import actionMap from './actionMap'

interface ActionSelectorProps {
  name: string
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  label: string;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ name, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const actions = Object.entries(actionMap).map(([name, action]) => ({ name, action }));
  const selectedAction = actions.find(action => action.name === value);

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
      document.addEventListener('actionSelectorOpen', handleOpenSelector as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('actionSelectorOpen', handleOpenSelector as EventListener);
    };
  }, [isOpen, name]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Dispatch custom event to close other selectors
    if (newState) {
      const event = new CustomEvent('actionSelectorOpen', { detail: { name } });
      document.dispatchEvent(event);
    }
  };

  return (
    <div ref={containerRef} className="action-selector-container">
      <label className="action-selector-label">
        {label}
      </label>
      <div onClick={handleToggle} className="action-selector-button">
        {selectedAction ? (
          <div className="action-selector-selected">
            <span className="action-selector-text">{selectedAction.name}</span>
          </div>
        ) : (
          <span className="action-selector-placeholder">Select an action</span>
        )}
      </div>
      
      {isOpen && (
        <div className="action-selector-dropdown">
          {actions.map((action) => (
            <div
              key={action.name}
              onClick={() => {
                const newValue = value === action.name ? '' : action.name;
                const syntheticEvent = {
                  target: { name, value: newValue }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(syntheticEvent);
                setIsOpen(false);
              }}
              className={`action-selector-option ${value === action.name ? 'selected' : ''}`}
            >
              <div 
                className="action-selector-action"
              />
              <span className="action-selector-text">{action.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionSelector;