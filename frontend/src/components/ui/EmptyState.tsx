import React from 'react';
import { Button } from './Button';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    actionLink?: string;
    onAction?: () => void;
}

export function EmptyState({ title, description, icon, actionLabel, actionLink, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-3xl">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>

            {actionLabel && (
                actionLink ? (
                    <Link href={actionLink}>
                        <Button variant="secondary">{actionLabel}</Button>
                    </Link>
                ) : (
                    <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>
                )
            )}
        </div>
    );
}
