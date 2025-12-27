import React from 'react';
import { Card } from '@/components/ui/Card';
import { IconType } from 'react-icons';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'info';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
    const colorStyles = {
        primary: 'from-primary-50 to-primary-100/50 text-primary-600 border-primary-100/50',
        success: 'from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100/50',
        warning: 'from-amber-50 to-amber-100/50 text-amber-600 border-amber-100/50',
        info: 'from-blue-50 to-blue-100/50 text-blue-600 border-blue-100/50',
    };

    return (
        <Card className="min-h-[140px] flex items-center p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 cursor-default border-none shadow-lg shadow-gray-100/50 rounded-[2rem] overflow-hidden group">
            <div className="flex items-center justify-between w-full">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</h3>
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-3 transition-all group-hover:translate-x-0.5">
                            <span className={`flex items-center font-bold text-[10px] ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {trend.positive ? '▲' : '▼'} {trend.value}%
                            </span>
                            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br border transition-transform duration-500 group-hover:rotate-6 shrink-0 ${colorStyles[color]}`}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>
        </Card>
    );
}
