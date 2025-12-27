'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface SalesChartProps {
    refreshKey?: number;
    filters: {
        startDate: string;
        endDate: string;
        branchId: string;
    };
}

export default function SalesChart({ filters, refreshKey }: SalesChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filters, groupBy, refreshKey]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                groupBy,
                ...filters
            });
            // Remove empty params
            if (!filters.branchId) params.delete('branchId');
            if (!filters.startDate) params.delete('startDate');
            if (!filters.endDate) params.delete('endDate');

            const res = await apiClient.get(`/sales/chart?${params.toString()}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex justify-between items-baseline mb-8">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase tracking-widest text-[10px]">Tren Penjualan</h3>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setGroupBy('day')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${groupBy === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                        Harian
                    </button>
                    <button
                        onClick={() => setGroupBy('month')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${groupBy === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                        Bulanan
                    </button>
                </div>
            </div>

            <div className="h-[350px] w-full">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis
                                tickFormatter={(value) => `Rp${value / 1000}k`}
                                tick={{ fontSize: 12 }}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value), 'Total Penjualan']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <LineChart width={24} height={24} data={[{ x: 0, y: 0 }]}>
                                <Line type="monotone" dataKey="y" stroke="#e5e7eb" strokeWidth={2} dot={false} />
                            </LineChart>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Tidak ada data penjualan</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
