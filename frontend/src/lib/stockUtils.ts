import { GlobalStock, BranchStock, StockDistribution, Product, Branch } from '@/types';

/**
 * Count branches with any product having less than 300 units (Critical ML) OR no stock at all
 */
export function getCriticalBranches(branchStock: BranchStock[], branches: Branch[]): number {
    const criticalBranchIds = new Set<number>();
    const branchIdsWithStock = new Set<number>();

    // 1. Check existing stock records
    branchStock.forEach(stock => {
        branchIdsWithStock.add(stock.branchId);
        if (stock.quantity < 300) {
            criticalBranchIds.add(stock.branchId);
        }
    });

    // 2. Check branches with NO stock records at all (implicitly critical)
    branches.forEach(branch => {
        if (!branchIdsWithStock.has(branch.id)) {
            criticalBranchIds.add(branch.id);
        }
    });

    return criticalBranchIds.size;
}

/**
 * Count products in global stock with less than 600 units (Low ML)
 */
export function getLowStockProducts(globalStock: GlobalStock[]): number {
    return globalStock.filter(stock => stock.quantity < 600).length;
}

/**
 * Count distributions created today
 */
export function getTodayDistributions(distributions: StockDistribution[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return distributions.filter(dist => {
        const distDate = new Date(dist.distributedAt);
        distDate.setHours(0, 0, 0, 0);
        return distDate.getTime() === today.getTime();
    }).length;
}

/**
 * Get the name of the most frequently distributed product
 */
export function getMostDistributedProduct(
    distributions: StockDistribution[],
    products: Product[]
): string {
    if (distributions.length === 0) return '-';

    // Count distributions per product
    const productCounts = new Map<number, number>();

    distributions.forEach(dist => {
        const count = productCounts.get(dist.productId) || 0;
        productCounts.set(dist.productId, count + 1);
    });

    // Find product with max count
    let maxProductId = 0;
    let maxCount = 0;

    productCounts.forEach((count, productId) => {
        if (count > maxCount) {
            maxCount = count;
            maxProductId = productId;
        }
    });

    // Find product name
    const product = products.find(p => p.id === maxProductId);
    return product?.name || '-';
}

/**
 * Get the branch with the most low stock items (< 300 units)
 */
export function getMostCriticalBranch(
    branchStock: BranchStock[],
    branches: Branch[]
): { name: string; count: number } {
    if (branchStock.length === 0) {
        return { name: '-', count: 0 };
    }

    // Count low stock items per branch
    const branchLowStockCounts = new Map<number, number>();

    branchStock.forEach(stock => {
        if (stock.quantity < 300) {
            const count = branchLowStockCounts.get(stock.branchId) || 0;
            branchLowStockCounts.set(stock.branchId, count + 1);
        }
    });

    if (branchLowStockCounts.size === 0) {
        return { name: '-', count: 0 };
    }

    // Find branch with max low stock items
    let maxBranchId = 0;
    let maxCount = 0;

    branchLowStockCounts.forEach((count, branchId) => {
        if (count > maxCount) {
            maxCount = count;
            maxBranchId = branchId;
        }
    });

    // Find branch name
    const branch = branches.find(b => b.id === maxBranchId);
    return {
        name: branch?.name || '-',
        count: maxCount
    };
}

/**
 * Sort global stock by quantity (ascending - low stock first)
 */
export function sortByLowStockFirst(globalStock: GlobalStock[]): GlobalStock[] {
    return [...globalStock].sort((a, b) => a.quantity - b.quantity);
}

/**
 * Filter history by product, type, and date range
 */
export function filterHistory(
    history: any[],
    filters: {
        productId?: number;
        type?: 'RESTOCK' | 'DISTRIBUTION' | 'ALL';
        dateRange?: 'week' | 'month' | 'all';
    }
): any[] {
    let filtered = [...history];

    // Filter by product
    if (filters.productId) {
        filtered = filtered.filter(h => h.productId === filters.productId);
    }

    // Filter by type
    if (filters.type && filters.type !== 'ALL') {
        filtered = filtered.filter(h => h.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const daysAgo = filters.dateRange === 'week' ? 7 : 30;
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        filtered = filtered.filter(h => new Date(h.createdAt) >= cutoffDate);
    }

    return filtered;
}

/**
 * Filter branch stock by branch, product, and status
 */
export function filterBranchStock(
    branchStock: BranchStock[],
    filters: {
        branchId?: number;
        productId?: number;
        status?: 'low' | 'instock' | 'all';
    }
): BranchStock[] {
    let filtered = [...branchStock];

    // Filter by branch
    if (filters.branchId) {
        filtered = filtered.filter(s => s.branchId === filters.branchId);
    }

    // Filter by product
    if (filters.productId) {
        filtered = filtered.filter(s => s.productId === filters.productId);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
        if (filters.status === 'low') {
            filtered = filtered.filter(s => s.quantity < 300);
        } else if (filters.status === 'instock') {
            filtered = filtered.filter(s => s.quantity >= 600);
        }
    }

    return filtered;
}

/**
 * Filter distributions by status
 */
export function filterDistributions(
    distributions: StockDistribution[],
    status?: 'PENDING' | 'RECEIVED' | 'ALL'
): StockDistribution[] {
    if (!status || status === 'ALL') {
        return distributions;
    }

    return distributions.filter(d => d.status === status);
}
