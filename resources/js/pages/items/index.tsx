import { Head, Link, router } from '@inertiajs/react';
import { ShoppingBag, Search, Calendar, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

type InventoryData = {
    total_stock: number;
    reserved_stock: number;
    available_stock: number;
    status: string;
};

type Size = {
    id: number;
    size: string;
    price_adjustment: string;
    inventory: InventoryData | null;
};

type Category = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    base_price: string;
    gender: string;
    product_type?: string;
    image_path: string | null;
    category: Category;
    sizes: Size[];
};

type PaginatedProducts = {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Props = {
    products: PaginatedProducts;
    categories: Category[];
    filters: { category?: string; search?: string };
};

function resolveImagePath(path: string | null, name: string) {
    if (path) {
        if (path.startsWith('http') || path.startsWith('/')) {
            return path;
        }
        return `/storage/${path}`;
    }
    // Fallback based on name for seeded demo items
    const n = name.toLowerCase();
    if (n.includes('men') && n.includes('shirt')) return '/images/products/mens-uniform-shirt.jpg';
    if (n.includes('men') && n.includes('pant')) return '/images/products/mens-uniform-pants.jpg';
    if (n.includes('women') && n.includes('blouse')) return '/images/products/womens-uniform-blouse.jpg';
    if (n.includes('women') && n.includes('skirt')) return '/images/products/womens-uniform-skirt.jpg';
    if (n.includes('women') && (n.includes('trouser') || n.includes('pant'))) return '/images/products/womens-uniform-trousers.jpg';
    if (n.includes('path-fit') && n.includes('shirt')) return '/images/products/path-fit-shirt.jpg';
    if (n.includes('path-fit') && n.includes('pant')) return '/images/products/path-fit-pants.jpg';
    if (n.includes('lace')) return '/images/products/dssc-id-lace.jpg';

    // Do not use the college logo as default for every product; use clean product placeholder
    return '/images/placeholder-product.svg';
}

export default function ItemsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/items', { ...filters, search }, { preserveScroll: true });
    }

    function setCategory(slug: string | null) {
        router.get(
            '/items',
            { ...filters, category: slug ?? undefined, search: search || undefined },
            { preserveScroll: true }
        );
    }

    return (
        <>
            <Head title="Browse Catalog — UniReserve" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Title Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                            School Supplies & Uniform Catalog
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Browse official DSSC uniforms, PATH-Fit attire, and student campus accessories.
                        </p>
                    </div>

                    <Link
                        href="/reservations/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0"
                    >
                        + Create Custom Reservation
                    </Link>
                </div>

                {/* Search & Category Filter Pills */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategory(null)}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                                !filters.category
                                    ? 'bg-[#0B2568] text-white border-[#0B2568] shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            All Items
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.slug)}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                                    filters.category === cat.slug
                                        ? 'bg-[#0B2568] text-white border-[#0B2568] shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={applySearch} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search catalog items..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Catalog Cards Grid (Matches User Reference Image) */}
                {products.data.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 shadow-sm">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                        <p className="font-bold text-gray-700 text-base">No catalog items found</p>
                        <p className="text-xs text-gray-400 mt-1">Try selecting another category or clear your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.data.map((product) => {
                            // Compute total available stock
                            const totalAvailable = product.sizes.reduce((sum, s) => {
                                const total = s.inventory?.total_stock ?? 0;
                                const reserved = s.inventory?.reserved_stock ?? 0;
                                return sum + Math.max(0, total - reserved);
                            }, 0);

                            const isSingleType =
                                product.sizes.length === 1 &&
                                (product.sizes[0].size.toLowerCase() === 'standard' ||
                                    product.sizes[0].size.toLowerCase() === 'regular');

                            const imageSrc = resolveImagePath(product.image_path, product.name);

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-3.5 flex flex-col justify-between group overflow-hidden"
                                >
                                    <div>
                                        {/* Top Image Container */}
                                        <div className="aspect-[4/3] w-full rounded-xl bg-[#f5f8fc] border border-gray-100 flex items-center justify-center p-3 relative mb-3.5 overflow-hidden">
                                            <img
                                                src={imageSrc}
                                                alt={product.name}
                                                className="object-contain max-h-full max-w-full drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Fallback to placeholder instead of college logo
                                                    e.currentTarget.src = '/images/placeholder-product.svg';
                                                }}
                                            />
                                        </div>

                                        {/* Category & Product Type Badges */}
                                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0B2356] text-white tracking-wide">
                                                {product.category?.name || 'Supply Item'}
                                            </span>
                                            {product.product_type && product.product_type !== 'Individual Item' && (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 tracking-wide">
                                                    {product.product_type}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Title */}
                                        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                                            {product.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
                                            {product.description || 'Official campus supplies item.'}
                                        </p>

                                        {/* Price & Stock Row */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xl font-black text-[#0B3A92] font-sans tracking-tight">
                                                ₱{Number(product.base_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>

                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {totalAvailable} avail.
                                            </span>
                                        </div>

                                        {/* Sizes / Variations Row */}
                                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {isSingleType ? 'Type:' : 'Size:'}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {product.sizes.map((s) => (
                                                    <span
                                                        key={s.id}
                                                        className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-2xs"
                                                    >
                                                        {s.size}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button: Reserve Now */}
                                    <Link
                                        href={`/items/${product.id}`}
                                        className="mt-4 w-full py-2.5 px-4 bg-[#0B2568] hover:bg-[#071a4d] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Reserve Now
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 pt-4 flex-wrap">
                        {products.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                                    link.active
                                        ? 'bg-[#0B2568] text-white'
                                        : link.url
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        : 'text-gray-400 opacity-50 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
