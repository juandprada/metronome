
import React, { useState, useEffect } from 'react';

interface InputControlProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
}

export const InputControl: React.FC<InputControlProps> = ({ label, value, onChange, min = 1, max = 300, step = 1, disabled = false }) => {
    const [inputValue, setInputValue] = useState(String(value));

    // When the external value prop changes, update the internal string state.
    // This keeps the component in sync with the parent's state.
    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow the user to type freely by updating local string state.
        setInputValue(e.target.value);
    };

    const processValue = () => {
        let numValue = parseInt(inputValue, 10);
        
        // If the input is empty or not a number, default to the minimum value.
        if (isNaN(numValue)) {
            numValue = min;
        }

        // Clamp the value to ensure it's within the allowed range.
        const clampedValue = Math.max(min, Math.min(max, numValue));
        
        // Propagate the validated and clamped number back to the parent.
        onChange(clampedValue);

        // Update the local state to reflect the clamped value, ensuring UI consistency.
        setInputValue(String(clampedValue));
    };

    const handleBlur = () => {
        processValue();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            processValue();
            // Blurring the input after Enter is a common UX pattern.
            e.currentTarget.blur();
        }
    };
    
    return (
        <div className="flex flex-col w-full">
            <label htmlFor={label} className="mb-2 text-sm font-medium text-slate-400">{label}</label>
            <input
                type="number"
                id={label}
                name={label}
                value={inputValue}
                onChange={handleValueChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="w-full px-4 py-2 text-lg text-white bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                // Prevent mouse wheel from changing the value, as it can be annoying
                onWheel={(e) => (e.target as HTMLElement).blur()}
            />
        </div>
    );
};
