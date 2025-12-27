import { FiSearch, FiFilter, FiDollarSign, FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export function FilterBar({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy
}: FilterBarProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 sticky top-20 z-40 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="flex-1 w-full relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search perfumes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Filters Group */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {/* Category */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-100"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-100"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {sortBy.includes('desc') ? <FiArrowDown className="w-4 h-4" /> : <FiArrowUp className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
