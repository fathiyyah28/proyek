'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiCheck, FiX, FiPackage, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface DistributionReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: {
        productName: string;
        quantity: number;
        branchName: string;
        currentBranchStock?: number;
    } | null;
    loading: boolean;
}

export function DistributionReceiveModal({ isOpen, onClose, onConfirm, data, loading }: DistributionReceiveModalProps) {
    if (!data) return null;

    const newStock = (data.currentBranchStock || 0) + data.quantity;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2"
                                >
                                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                                        <FiPackage className="w-5 h-5" />
                                    </div>
                                    Konfirmasi Penerimaan
                                </Dialog.Title>

                                <div className="mt-4 space-y-4">
                                    <p className="text-sm text-gray-500">
                                        Anda akan menerima stok berikut ini. Pastikan fisik barang sudah sesuai dengan data.
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Produk</span>
                                            <span className="font-semibold text-gray-900">{data.productName}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Jumlah Diterima</span>
                                            <span className="font-bold text-lg text-green-600">+{data.quantity}</span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Update Stok Cabang</p>
                                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                <div className="text-center">
                                                    <span className="text-xs text-gray-500 block">Sekarang</span>
                                                    <span className="font-semibold text-gray-900">{data.currentBranchStock ?? 0}</span>
                                                </div>
                                                <FiArrowRight className="text-gray-400" />
                                                <div className="text-center">
                                                    <span className="text-xs text-gray-500 block">Setelah Terima</span>
                                                    <span className="font-bold text-green-600">{newStock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Batal
                                    </button>
                                    <Button
                                        onClick={onConfirm}
                                        isLoading={loading}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <FiCheck className="mr-2" />
                                        Konfirmasi Terima
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
