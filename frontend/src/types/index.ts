export type PurchaseType = 'REFILL' | 'NEW_BOTTLE';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'OWNER' | 'EMPLOYEE' | 'CUSTOMER';
    branchId?: number;
    branch?: Branch;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    pricePerMl: number;  // NEW: Harga per mililiter
    price?: number;      // DEPRECATED: Untuk backward compatibility
    category: string;
    imageUrl?: string;
}

export interface Branch {
    id: number;
    name: string;
    location: string;
    contact: string;
}

export interface GlobalStock {
    id: number;
    productId: number;
    product?: Product;
    quantity: number;
}

export interface BranchStock {
    id: number;
    branchId: number;
    productId: number;
    branch?: Branch;
    product?: Product;
    quantity: number;
}

export interface StockDistribution {
    id: number;
    branchId: number;
    productId: number;
    branch?: Branch;
    product?: Product;
    quantity: number;
    distributedAt: string;
    status: 'PENDING' | 'RECEIVED';
}

export interface SalesRecord {
    id: number;
    branchId: number;
    productId: number;
    employee?: User;
    branch?: Branch;
    product?: Product;
    purchaseType: PurchaseType;  // NEW: Jenis pembelian
    volumeMl: number;            // NEW: Volume dalam ml
    quantitySold: number;
    totalPrice: number;
    transactionDate: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    product?: Product;
    quantity: number;
    price: number;
    subtotal?: number;
}

export interface Order {
    id: number;
    customerId: number;
    branchId: number;
    customer?: User;
    branch?: Branch;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    createdAt: string;
    items?: OrderItem[];
}

// Stock Enhancements
export interface GlobalStockHistory {
    id: number;
    productId: number;
    product: Product;
    changeAmount: number;
    previousBalance: number;
    newBalance: number;
    type: 'INITIAL' | 'RESTOCK' | 'DISTRIBUTION' | 'ADJUSTMENT';
    reason: string;
    referenceId?: string;
    createdAt: string;
}

export interface StockAnalytics {
    totalGlobal: number;
    totalBranch: number;
}

export interface RestockPayload {
    productId: number;
    quantity: number;
    reason?: string;
}

export interface BranchProductDetail {
    product: Product;
    branch: Branch;
    currentStock: number;
    history: {
        id: string;
        date: string;
        type: 'IN' | 'OUT';
        amount: number;
        note: string;
    }[];
}
