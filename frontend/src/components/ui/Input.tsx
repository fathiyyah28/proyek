import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, description, disabled, icon, suffix, ...props }, ref) => {
        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        disabled={disabled}
                        className={`
                            w-full rounded-lg border bg-white text-gray-900 shadow-sm transition-all duration-200
                            focus:outline-none focus:ring-4 focus:ring-opacity-20
                            disabled:bg-gray-50 disabled:text-gray-500
                            ${icon ? 'pl-10' : 'px-3'} 
                            ${suffix ? 'pr-10' : 'px-3'} 
                            py-2.5
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100 placeholder-red-300'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 placeholder-gray-400 hover:border-gray-400'
                            }
                        `}
                        {...props}
                    />
                    {suffix && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                            {suffix}
                        </div>
                    )}
                </div>
                {description && !error && (
                    <p className="mt-1.5 text-xs text-gray-500">{description}</p>
                )}
                {error && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium animate-fadeIn flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
