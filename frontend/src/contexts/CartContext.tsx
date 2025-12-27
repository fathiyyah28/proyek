'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types'; // Import Product type for better type safety if available, or keep using any
import { PurchaseType } from '@/types'; // Need to ensure this exists or define locally

// Define locally if not in types
export enum LocalPurchaseType {
    REFILL = 'REFILL',
    NEW_BOTTLE = 'NEW_BOTTLE',
}

export interface CartItem {
    cartId: string; // Unique ID: {productId}-{volume}-{type}
    id: number;     // Product ID
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
    category?: string;
    stock?: number;
    volume: number;
    purchaseType: LocalPurchaseType | string;
}

interface CartContextType {
    items: CartItem[];
    buyNowItem: CartItem | null; // NEW: Direct checkout item
    addToCart: (product: any, volume: number, type: string) => void;
    buyNow: (product: any, volume: number, type: string) => void; // NEW: Direct checkout action
    clearBuyNowItem: () => void; // NEW: Clear direct item
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hardcoded for now, ideally fetched from backend config
const BOTTLE_FEE = 5000;

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed: CartItem[] = JSON.parse(savedCart);
                // MIGRATION: Ensure all items have a cartId
                const migrated = parsed.map(item => {
                    if (!item.cartId) {
                        // Default values for legacy items
                        const vol = item.volume || 30;
                        const type = item.purchaseType || 'NEW_BOTTLE';
                        return {
                            ...item,
                            volume: vol,
                            purchaseType: type,
                            cartId: `${item.id}-${vol}-${type}`
                        };



                    }
                    return item;
                });
                setItems(migrated);
            }

            // Load BuyNow Item
            const savedBuyNow = localStorage.getItem('buyNowItem');
            if (savedBuyNow) {
                setBuyNowItem(JSON.parse(savedBuyNow));
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage on change
    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items));

            // Sync BuyNow
            if (buyNowItem) {
                localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            } else {
                localStorage.removeItem('buyNowItem');
            }
        }
    }, [items, buyNowItem, isLoaded]);

    const addToCart = (product: any, volume: number = 30, type: string = 'NEW_BOTTLE') => {
        const cartId = `${product.id}-${volume}-${type}`;

        setItems(prev => {
            const existing = prev.find(item => item.cartId === cartId);
            if (existing) {
                // If exists, just increment quantity
                const newQuantity = existing.quantity + 1;
                // Basic stock check (rough, as stock is arguably total ML)
                // For now, let's just let it add. Backend validates strict stock.
                return prev.map(item =>
                    item.cartId === cartId
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }

            // Calculate Price
            let price = 0;
            // Prefer pricePerMl logic
            if (product.pricePerMl && Number(product.pricePerMl) > 0) {
                price = Number(product.pricePerMl) * volume;
            } else {
                // Fallback to product.price if valid (assuming 30ml base)
                const basePrice = Number(product.price) || 0;
                const pricePerMl = basePrice / 30;
                price = pricePerMl * volume;
            }

            // Add Bottle Fee
            if (type === 'NEW_BOTTLE') {
                price += BOTTLE_FEE;
            }

            // Validation: Ensure price is valid
            if (price <= 0) {
                console.warn("Attempted to add item with 0 price", product);
                return prev;
            }

            return [...prev, {
                cartId,
                id: product.id,
                name: product.name,
                price: price,
                imageUrl: product.imageUrl,
                category: product.category,
                quantity: 1,
                // stock: product.stock, // Stock is complex now (ML vs Bottles), skipping client-side strict limit for now
                volume,
                purchaseType: type
            }];
        });
    };

    const buyNow = (product: any, volume: number = 30, type: string = 'NEW_BOTTLE') => {
        const cartId = `buynow-${product.id}-${volume}-${type}`;

        // Calculate Price
        let price = 0;
        if (product.pricePerMl && Number(product.pricePerMl) > 0) {
            price = Number(product.pricePerMl) * volume;
        } else {
            const basePrice = Number(product.price) || 0;
            const pricePerMl = basePrice / 30;
            price = pricePerMl * volume;
        }

        // Add Bottle Fee
        if (type === 'NEW_BOTTLE') {
            price += BOTTLE_FEE;
        }

        if (price <= 0) {
            console.warn("Attempted to buy item with 0 price", product);
            return;
        }

        setBuyNowItem({
            cartId,
            id: product.id,
            name: product.name,
            price: price,
            imageUrl: product.imageUrl,
            category: product.category,
            quantity: 1,
            volume,
            purchaseType: type
        });
    };

    const clearBuyNowItem = () => {
        setBuyNowItem(null);
        localStorage.removeItem('buyNowItem');
    };



    const removeFromCart = (cartId: string) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.cartId === cartId) {
                let newQuantity = item.quantity + delta;
                if (newQuantity < 1) newQuantity = 1;

                // Remove client-side stock limit for now as it's tricky with ML
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            buyNowItem,
            addToCart,
            buyNow,
            clearBuyNowItem,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
