import React from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
}

export function PhoneInput({
    value,
    onChange,
    placeholder = '912 345 6789',
    disabled = false,
    error,
    id = 'phone-input',
}: PhoneInputProps) {
    // Clean initial value to display local 10-digit number
    const localDigits = value.replace(/^\+?63/, '').replace(/^0/, '').trim();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        // Keep only digits and spaces
        const cleaned = inputVal.replace(/[^\d]/g, '').slice(0, 10);
        if (!cleaned) {
            onChange('');
        } else {
            onChange(`+63${cleaned}`);
        }
    };

    return (
        <div
            className={`flex h-9 w-full rounded-md border bg-background shadow-2xs transition-colors overflow-hidden ${
                error
                    ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive'
                    : 'border-input focus-within:ring-2 focus-within:ring-ring focus-within:border-primary'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/40' : ''}`}
        >
            <div className="flex select-none items-center justify-center bg-muted/60 px-3 border-r border-input text-xs font-semibold text-muted-foreground">
                +63
            </div>
            <input
                id={id}
                type="tel"
                value={localDigits}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={12}
                className="flex-1 bg-transparent px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed"
            />
        </div>
    );
}

