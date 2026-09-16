import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
    showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, showPasswordToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';
        const isDateType = type === 'date' || type === 'time' || type === 'datetime-local';

        if (isPassword && showPasswordToggle) {
            return (
                <div className="relative w-full">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className={cn(
                            'flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-10 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={props.disabled}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                </div>
            );
        }

        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    isDateType && 'cursor-pointer',
                    className
                )}
                onClick={(e) => {
                    props.onClick?.(e);
                    if (isDateType && !props.disabled && !props.readOnly) {
                        try {
                            e.currentTarget.showPicker?.();
                        } catch {
                            // Ignore if showPicker is unsupported or already open
                        }
                    }
                }}
                onKeyDown={(e) => {
                    props.onKeyDown?.(e);
                    if (
                        isDateType &&
                        !props.disabled &&
                        !props.readOnly &&
                        (e.key === 'Enter' || e.key === ' ')
                    ) {
                        try {
                            e.currentTarget.showPicker?.();
                        } catch {
                            // Ignore if unsupported
                        }
                    }
                }}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export { Input };

