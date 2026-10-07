import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    SlidersHorizontal,
    Edit3,
    Trash2,
    CheckCircle2,
    Layers,
    ArrowUpDown,
    PlusCircle,
    MinusCircle,
    X,
} from 'lucide-react';

type ProductSize = {
    id: number;
    size: string;
    price_adjustment: string | number;
    inventory?: {
        id: number;
        total_stock: number;
        reserved_stock: number;
        reorder_level: number;
    };
};

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    base_price: string | number;
    gender: string;
    is_active: boolean;
    category?: Category;
    sizes: ProductSize[];
};

type PaginatedProducts = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Props = {
    products: PaginatedProducts;
    categories: Category[];
    filters: { search?: string; filter?: string };
};

export default function AdminInventoryIndex({ products, categories, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [adjustingSize, setAdjustingSize] = useState<{
        sizeId: number;
        productName: string;
        sizeName: string;
        currentStock: number;
    } | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState<number>(1);
    const [adjustReason, setAdjustReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/inventory',
            { ...filters, search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const handleFilter = (filterVal?: string) => {
        router.get(
            '/admin/inventory',
            { search: searchTerm || undefined, filter: filterVal },
            { preserveState: true }
        );
    };

    const handleDeactivate = (product: Product) => {
        if (confirm(`Deactivate product "${product.name}"? It will no longer appear to students.`)) {
            router.delete(`/admin/inventory/${product.id}`);
        }
    };

    const submitStockAdjustment = (multiplier: number) => {
        if (!adjustingSize) return;
        setIsSubmitting(true);
        router.post(
            `/admin/inventory/${adjustingSize.sizeId}/adjust`,
            {
                adjustment: adjustmentAmount * multiplier,
                reason: adjustReason,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setAdjustingSize(null);
                    setAdjustmentAmount(1);
                    setAdjustReason('');
                },
            }
        );
    };

    return (
        <>
            <Head title="Inventory Management — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            Inventory Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage school uniforms, PE attires, supplies, sizing stock, and inventory adjustments.
                        </p>
                    </div>

                    <Link
                        href="/admin/inventory/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New Item
                    </Link>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFilter(undefined)}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                !filters.filter
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All Inventory ({products.total})
                        </button>
                        <button
                            onClick={() => handleFilter('low')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                filters.filter === 'low'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-amber-700 hover:bg-amber-50'
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
                        </button>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2 sm:w-72">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search uniform or item..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {products.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-semibold text-gray-700">No inventory products found</p>
                            <p className="text-xs text-gray-400 mt-1">Get started by creating your first supply or uniform item.</p>
                            <Link
                                href="/admin/inventory/create"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="w-4 h-4" /> Add Item Now
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {products.data.map((product) => {
                                const totalAvailable = product.sizes.reduce((acc, s) => {
                                    const t = s.inventory?.total_stock ?? 0;
                                    const r = s.inventory?.reserved_stock ?? 0;
                                    return acc + Math.max(0, t - r);
                                }, 0);

                                return (
                                    <div key={product.id} className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            {/* Product Overview */}
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-base">
                                                        {product.name}
                                                    </span>
                                                    {product.category && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                            {product.category.name}
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                        {product.gender}
                                                    </span>
                                                    {!product.is_active && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500 line-clamp-1 max-w-2xl">
                                                    {product.description || 'No description provided.'}
                                                </p>

                                                <div className="text-xs text-gray-500 flex items-center gap-3 pt-1">
                                                    <span>Base Price: <strong className="text-gray-900">₱{Number(product.base_price).toFixed(2)}</strong></span>
                                                    <span>Total Available Stock: <strong className={totalAvailable <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>{totalAvailable} units</strong></span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    href={`/admin/inventory/${product.id}/edit`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                                </Link>

                                                {product.is_active && (
                                                    <button
                                                        onClick={() => handleDeactivate(product)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                                        title="Deactivate item"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sizing & Stock Matrix */}
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Layers className="w-3.5 h-3.5 text-blue-600" /> Size Variations & Stock
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {product.sizes.map((size) => {
                                                    const total = size.inventory?.total_stock ?? 0;
                                                    const reserved = size.inventory?.reserved_stock ?? 0;
                                                    const available = Math.max(0, total - reserved);
                                                    const isLow = available <= (size.inventory?.reorder_level ?? 5);

                                                    return (
                                                        <div
                                                            key={size.id}
                                                            className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 transition-colors ${
                                                                isLow
                                                                    ? 'bg-amber-50/60 border-amber-200'
                                                                    : 'bg-white border-gray-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-gray-900">{size.size}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {Number(size.price_adjustment) > 0
                                                                        ? `+₱${Number(size.price_adjustment).toFixed(0)}`
                                                                        : 'Base'}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-0.5">
                                                                <div className="flex justify-between text-[11px]">
                                                                    <span className="text-gray-500">Available:</span>
                                                                    <strong className={isLow ? 'text-amber-700' : 'text-emerald-700'}>
                                                                        {available}
                                                                    </strong>
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-gray-400">
                                                                    <span>Total / Res:</span>
                                                                    <span>{total} / {reserved}</span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() =>
                                                                    setAdjustingSize({
                                                                        sizeId: size.id,
                                                                        productName: product.name,
                                                                        sizeName: size.size,
                                                                        currentStock: total,
                                                                    })
                                                                }
                                                                className="mt-1 w-full py-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                                                            >
                                                                Adjust Stock
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stock Adjustment Modal */}
                {adjustingSize && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">Adjust Stock</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {adjustingSize.productName} — Size <strong className="text-gray-800">{adjustingSize.sizeName}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAdjustingSize(null)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Current Total Stock:</span>
                                    <strong className="text-gray-900 font-mono">{adjustingSize.currentStock} units</strong>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Quantity to Add or Deduct
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={adjustmentAmount}
                                    onChange={(e) => setAdjustmentAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Reason / Notes (optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. New delivery arrived, damaged stock..."
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => submitStockAdjustment(-1)}
                                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <MinusCircle className="w-3.5 h-3.5" /> Deduct -{adjustmentAmount}
                                </button>

                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => submitStockAdjustment(1)}
                                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Add +{adjustmentAmount}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
