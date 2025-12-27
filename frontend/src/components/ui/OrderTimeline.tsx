import React from 'react';
import { FiCheck, FiPackage, FiTruck, FiClock } from 'react-icons/fi';

interface OrderTimelineProps {
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
}

const steps = [
    { status: 'PENDING', label: 'Pesanan Dibuat', icon: FiClock },
    { status: 'PROCESSING', label: 'Diproses', icon: FiPackage },
    { status: 'SHIPPED', label: 'Dikirim', icon: FiTruck },
    { status: 'COMPLETED', label: 'Selesai', icon: FiCheck },
];

export function OrderTimeline({ status }: OrderTimelineProps) {
    if (status === 'CANCELLED') {
        return (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center text-red-600 font-medium">
                Pesanan Dibatalkan
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(step => step.status === status);
    // If status is not found (e.g. unknown), default to 0
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 -z-10 transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isCompleted = index < activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.status} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300
                                ${isActive ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-200 text-gray-300'}
                            `}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
