'use client';

import { useState, useEffect } from 'react';
import { Branch } from '@/types';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

interface SalesFiltersProps {
    startDate: string;
    endDate: string;
    branchId: string;
    onFilterChange: (filters: { startDate?: string; endDate?: string; branchId?: string }) => void;
}

export default function SalesFilters({ startDate, endDate, branchId, onFilterChange }: SalesFiltersProps) {
    const { isOwner } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);

    useEffect(() => {
        if (isOwner) {
            fetchBranches();
        }
    }, [isOwner]);

    const fetchBranches = async () => {
        try {
            const res = await apiClient.get('/branches');
            setBranches(res.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleChange = (key: string, value: string) => {
        onFilterChange({
            startDate: key === 'startDate' ? value : startDate,
            endDate: key === 'endDate' ? value : endDate,
            branchId: key === 'branchId' ? value : branchId,
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {isOwner && (
                <div className="w-full md:w-auto min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                    <select
                        value={branchId}
                        onChange={(e) => handleChange('branchId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                        <option value="">Semua Cabang</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
