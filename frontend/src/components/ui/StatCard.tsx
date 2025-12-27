import React from 'react';
import { Card } from './Card';

interface StatCardProps {
    value: string | number;
    label: string;
    period?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    onClick?: () => void;
}

export function StatCard({ value, label, period, trend, icon, onClick }: StatCardProps) {
    return (
        <Card
            className={`p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                    {period && (
                        <p className="text-xs text-gray-400 mb-2">{period}</p>
                    )}
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-3xl opacity-50">{icon}</div>
                )}
            </div>
        </Card>
    );
}
