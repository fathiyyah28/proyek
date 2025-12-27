import React from 'react';

interface CardProps {
    className?: string;
    children: React.ReactNode;
    title?: string;
    action?: React.ReactNode;
    noPadding?: boolean;
}

export function Card({ className = '', children, title, action, noPadding = false }: CardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#E6C36A]/30 hover:shadow-[0_8px_30px_-4px_rgba(230,195,106,0.15)] transition-all duration-300 ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-50">
                    {title && (
                        <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                            {title}
                        </h2>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
