'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiPackage, FiInfo } from 'react-icons/fi';

interface StockScaleSelectorProps {
    onChange: (quantity: number, volumePerUnit: number) => void;
}

type ScaleType = 'TEST' | 'NORMAL' | 'BEST_SELLER' | 'CUSTOM';

export function StockScaleSelector({ onChange }: StockScaleSelectorProps) {
    const [selectedScale, setSelectedScale] = useState<ScaleType | null>(null);
    const [customQuantity, setCustomQuantity] = useState<string>('');
    const [customVolume, setCustomVolume] = useState<string>('100'); // Default 100ml

    // Presets Configuration
    const PRESETS = {
        TEST: { label: 'Uji Pasar', quantity: 5, volume: 100, desc: '5 botol @ 100ml' },
        NORMAL: { label: 'Normal', quantity: 20, volume: 100, desc: '20 botol @ 100ml' },
        BEST_SELLER: { label: 'Best Seller', quantity: 50, volume: 100, desc: '50 botol @ 100ml' },
    };

    useEffect(() => {
        if (selectedScale && selectedScale !== 'CUSTOM') {
            const preset = PRESETS[selectedScale];
            onChange(preset.quantity, preset.volume);
        } else if (selectedScale === 'CUSTOM') {
            const q = parseInt(customQuantity) || 0;
            const v = parseInt(customVolume) || 0;
            onChange(q, v);
        } else {
            // Default 0
            onChange(0, 0);
        }
    }, [selectedScale, customQuantity, customVolume]);

    // Calculate Preview
    const getPreview = () => {
        let q = 0, v = 0;
        if (selectedScale && selectedScale !== 'CUSTOM') {
            q = PRESETS[selectedScale].quantity;
            v = PRESETS[selectedScale].volume;
        } else {
            q = parseInt(customQuantity) || 0;
            v = parseInt(customVolume) || 0;
        }
        const totalMl = q * v;
        const bottles30ml = Math.floor(totalMl / 30);
        return { totalMl, bottles30ml };
    };

    const preview = getPreview();

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Pilih Skala Restock / Distribusi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.keys(PRESETS) as ScaleType[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedScale(key)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedScale === key
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                }`}
                        >
                            <div className="font-bold text-sm mb-1">{PRESETS[key].label}</div>
                            <div className="text-xs opacity-70">{PRESETS[key].desc}</div>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setSelectedScale('CUSTOM')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedScale === 'CUSTOM'
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                            }`}
                    >
                        <div className="font-bold text-sm mb-1">Custom</div>
                        <div className="text-xs opacity-70">Input Manual</div>
                    </button>
                </div>
            </div>

            {selectedScale === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <Input
                        label="Jumlah Unit (Botol)"
                        type="number"
                        placeholder="0"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(e.target.value)}
                        min="1"
                    />
                    <Input
                        label="Volume per Unit (ml)"
                        type="number"
                        placeholder="100"
                        value={customVolume}
                        onChange={(e) => setCustomVolume(e.target.value)}
                        min="1"
                    />
                </div>
            )}

            {/* Live Preview */}
            <div className={`p-4 rounded-lg flex items-center justify-between transition-colors ${preview.totalMl > 0 ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-gray-50 text-gray-400'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${preview.totalMl > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'}`}>
                        <FiPackage className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase opacity-70 mb-0.5">Total Volume Masuk</div>
                        <div className="text-xl font-extrabold">{preview.totalMl.toLocaleString()} ml</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold uppercase opacity-70 mb-0.5">Estimasi</div>
                    <div className="text-sm font-semibold">~{preview.bottles30ml} Botol (30ml)</div>
                </div>
            </div>

            <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                    Sistem akan menyimpan data dalam satuan <b>Milliliter (ML)</b>.
                    Input di atas akan dikonversi otomatis: <i>Jumlah Unit × Volume = Total ML</i>.
                </p>
            </div>
        </div>
    );
}
