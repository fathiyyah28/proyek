'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiUpload, FiLink, FiImage, FiX } from 'react-icons/fi';
import { getImageUrl } from '@/lib/utils';
// import apiClient from '@/lib/api'; // Uncomment when backend upload endpoint is ready

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    onFileUpload?: (file: File) => Promise<string>;
    label?: string;
    error?: string;
}

export function ImageUploader({ value, onChange, onFileUpload, label = "Gambar Produk", error }: ImageUploaderProps) {
    const [mode, setMode] = useState<'file' | 'url'>('file');
    const [preview, setPreview] = useState<string>(getImageUrl(value));
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with external value changes
    useEffect(() => {
        if (value) {
            setPreview(getImageUrl(value));
        }
    }, [value]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        // Validation
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Format file harus JPG, PNG, atau WebP');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        if (onFileUpload) {
            setUploading(true);
            try {
                const url = await onFileUpload(file);
                onChange(url);
            } catch (err) {
                console.error('Upload failed', err);
                alert('Gagal mengupload gambar');
            } finally {
                setUploading(false);
            }
        } else {
            // Fallback for demo/no-backend: Use Base64/Blob URL
            // In real app, we MUST upload to get a public URL
            console.warn('No upload handler provided. Using standard file object behavior.');
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        onChange(url);
        setPreview(url);
    };

    const clearImage = () => {
        onChange('');
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {/* Toggle Mode */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'file' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FiUpload className="w-4 h-4" /> Upload File
                </button>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'url' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FiLink className="w-4 h-4" /> Gunakan URL
                </button>
            </div>

            {/* Input Area */}
            <div className="flex gap-6 items-start">
                <div className="flex-1">
                    {mode === 'file' ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                            />
                            <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400 mb-3">
                                <FiUpload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Klik untuk upload atau drag & drop</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max. 5MB)</p>
                        </div>
                    ) : (
                        <Input
                            placeholder="https://example.com/image.jpg"
                            value={value}
                            onChange={handleUrlChange}
                            icon={<FiLink className="w-5 h-5" />}
                        />
                    )}
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                </div>

                {/* Preview */}
                {preview && (
                    <div className="relative w-32 h-32 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')} />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                            <FiX className="w-3 h-3" />
                        </button>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                                Uploading...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
