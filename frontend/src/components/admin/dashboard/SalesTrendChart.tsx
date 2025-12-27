'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { FiPackage, FiBarChart2 } from 'react-icons/fi';

interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
}

interface SalesTrendChartProps {
    data: TopProduct[];
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Process Data: Sort by sold desc and take top 5
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Ensure numbers are Numbers
        const safeData = data.map(d => ({
            ...d,
            sold: Number(d.sold),
            revenue: Number(d.revenue)
        }));

        console.log('[SalesTrendChart] Processed Data:', safeData);

        // Sort DESC by sold count and take top 5
        return safeData.sort((a, b) => b.sold - a.sold).slice(0, 5);
    }, [data]);

    // Empty State
    if (!mounted) return <div className="w-full h-[300px] bg-gray-50/50 animate-pulse rounded-lg" />;

    if (processedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                    <FiPackage className="text-primary-600 text-xl" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">Belum ada data penjualan produk</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Grafik akan muncul setelah ada produk yang terjual.
                </p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl shadow-primary-500/10 z-50">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <FiPackage className="text-primary-600" />
                        <span className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[200px]">
                            {item.name}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500">Terjual</span>
                            <span className="text-sm font-bold text-gray-900">
                                {item.sold} Unit
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500">Pendapatan</span>
                            <span className="text-sm font-bold text-primary-600">
                                {formatCurrency(item.revenue)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full flex flex-col h-full">
            {/* Chart Container - Fixed Height explicitly */}
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={processedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            dy={10}
                            interval={0} // Force show all labels
                            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}..` : value}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                        <Bar
                            dataKey="sold"
                            fill="#E6C36A"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        >
                            {processedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#E6C36A' : '#EBD48D'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Insight Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-primary-50 p-3 rounded-lg">
                    <FiBarChart2 className="text-primary-600 text-lg shrink-0" />
                    <span>
                        Produk <strong>{processedData[0]?.name}</strong> paling diminati dengan penjualan <strong>{processedData[0]?.sold} unit</strong>.
                    </span>
                </div>
            </div>
        </div>
    );
}
