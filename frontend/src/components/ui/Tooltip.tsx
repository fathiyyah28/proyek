import React, { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative group inline-block">
            {children}
            <div className={`
                absolute ${positionClasses[position]} z-50 
                hidden group-hover:block 
                px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-200 pointer-events-none
            `}>
                {content}
                {/* Arrow */}
                <div className={`
                    absolute w-2 h-2 bg-gray-900 transform rotate-45
                    ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                    ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                `}></div>
            </div>
        </div>
    );
}
