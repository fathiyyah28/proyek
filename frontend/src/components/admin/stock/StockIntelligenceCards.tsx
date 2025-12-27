'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { GlobalStock, BranchStock, StockDistribution, Product, Branch } from '@/types';
import {
    getCriticalBranches,
    getLowStockProducts,
    getTodayDistributions,
    getMostDistributedProduct
} from '@/lib/stockUtils';
import { FiAlertTriangle, FiPackage, FiTrendingUp, FiAward } from 'react-icons/fi';

interface StockIntelligenceCardsProps {
    globalStock: GlobalStock[];
    branchStock: BranchStock[];
    distributions: StockDistribution[];
    products: Product[];
    branches: Branch[];
}

export function StockIntelligenceCards({
    globalStock,
    branchStock,
    distributions,
    products,
    branches
}: StockIntelligenceCardsProps) {
    const criticalBranchesCount = getCriticalBranches(branchStock, branches);
    const lowStockProductsCount = getLowStockProducts(globalStock);
    const todayDistributionsCount = getTodayDistributions(distributions);
    const mostDistributedProduct = getMostDistributedProduct(distributions, products);

    const cards = [
        {
            title: 'Cabang Kritis',
            value: criticalBranchesCount,
            subtitle: 'cabang dengan stok rendah',
            icon: FiAlertTriangle,
            color: criticalBranchesCount > 0 ? 'red' : 'gray',
            bgColor: criticalBranchesCount > 0 ? 'bg-red-50' : 'bg-gray-50',
            iconColor: criticalBranchesCount > 0 ? 'text-red-600' : 'text-gray-600',
            iconBg: criticalBranchesCount > 0 ? 'bg-red-100' : 'bg-gray-100',
            borderColor: criticalBranchesCount > 0 ? 'border-red-100' : 'border-gray-100'
        },
        {
            title: 'Produk Low Stock',
            value: lowStockProductsCount,
            subtitle: 'produk perlu restock',
            icon: FiPackage,
            color: lowStockProductsCount > 0 ? 'yellow' : 'gray',
            bgColor: lowStockProductsCount > 0 ? 'bg-yellow-50' : 'bg-gray-50',
            iconColor: lowStockProductsCount > 0 ? 'text-yellow-600' : 'text-gray-600',
            iconBg: lowStockProductsCount > 0 ? 'bg-yellow-100' : 'bg-gray-100',
            borderColor: lowStockProductsCount > 0 ? 'border-yellow-100' : 'border-gray-100'
        },
        {
            title: 'Distribusi Hari Ini',
            value: todayDistributionsCount,
            subtitle: 'distribusi dibuat',
            icon: FiTrendingUp,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            borderColor: 'border-blue-100'
        },
        {
            title: 'Produk Terlaris',
            value: mostDistributedProduct,
            subtitle: 'paling sering didistribusi',
            icon: FiAward,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-100',
            borderColor: 'border-purple-100',
            isText: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <Card key={index} className={`p-5 ${card.bgColor} ${card.borderColor}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${card.iconBg}`}>
                            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {card.title}
                            </p>
                            {card.isText ? (
                                <p className="text-lg font-bold text-gray-900 mt-1 truncate" title={card.value as string}>
                                    {card.value}
                                </p>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {card.value}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">
                                {card.subtitle}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
