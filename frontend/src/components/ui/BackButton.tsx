'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

interface BackButtonProps {
    label?: string;
    fallbackUrl?: string;
    className?: string;
}

export function BackButton({ label = 'Kembali', fallbackUrl = '/', className = '' }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors ${className}`}
        >
            <FiArrowLeft className="w-4 h-4" />
            {label}
        </button>
    );
}
