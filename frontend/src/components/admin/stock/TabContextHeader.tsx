'use client';

import React from 'react';

interface TabContextHeaderProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export function TabContextHeader({ title, description, icon }: TabContextHeaderProps) {
    return (
        <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="text-purple-600 mt-1">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}
