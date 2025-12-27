import React from 'react';

interface StockProgressBarProps {
    stock: number;
    maxStock: number;
}

export function StockProgressBar({ stock, maxStock }: StockProgressBarProps) {
    const percentage = Math.min((stock / maxStock) * 100, 100);
    let colorClass = 'bg-primary-600';

    if (percentage < 20) {
        colorClass = 'bg-red-500';
    } else if (percentage < 50) {
        colorClass = 'bg-yellow-500';
    } else {
        colorClass = 'bg-green-500';
    }

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
}
