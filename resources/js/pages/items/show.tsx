import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, ChevronLeft, Package, Check, ShieldCheck, Tag } from 'lucide-react';

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

type Product = {
    id: number;
    name: string;
    description: string | null;
    base_price: string;
    gender: string;
    image_path: string | null;
    category: { name: string; slug: string };
    sizes: Size[];
};

function phpPeso(v: number) {
    return '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function resolveImagePath(path: string | null, name: string) {
    if (path) {
        if (path.startsWith('http') || path.startsWith('/')) {
            return path;
        }
        return `/storage/${path}`;
    }
    const n = name.toLowerCase();
    if (n.includes('men') && n.includes('shirt')) return '/images/products/mens-uniform-shirt.jpg';
    if (n.includes('men') && n.includes('pant')) return '/images/products/mens-uniform-pants.jpg';
    if (n.includes('women') && n.includes('blouse')) return '/images/products/womens-uniform-blouse.jpg';
    if (n.includes('women') && n.includes('skirt')) return '/images/products/womens-uniform-skirt.jpg';
    if (n.includes('women') && (n.includes('trouser') || n.includes('pant'))) return '/images/products/womens-uniform-trousers.jpg';
    if (n.includes('path-fit') && n.includes('shirt')) return '/images/products/path-fit-shirt.jpg';
    if (n.includes('path-fit') && n.includes('pant')) return '/images/products/path-fit-pants.jpg';
    if (n.includes('lace')) return '/images/products/dssc-id-lace.jpg';

    return '/images/school-logo.png';
}

export default function ItemShow({ product }: { product: Product }) {
    const [selectedSize, setSelectedSize] = useState<Size | null>(product.sizes[0] || null);
    const [qty, setQty] = useState(1);

    const price = selectedSize
        ? Number(product.base_price) + Number(selectedSize.price_adjustment)
        : Number(product.base_price);

    const availableStock = selectedSize?.inventory
        ? Math.max(0, (selectedSize.inventory.total_stock ?? 0) - (selectedSize.inventory.reserved_stock ?? 0))
        : 0;

    const maxQty = Math.min(5, availableStock);

    function reserve() {
        if (!selectedSize || availableStock === 0) return;
        router.get('/reservations/create', {
            product_size_id: selectedSize.id,
            quantity: qty,
        });
    }

    const imageSrc = resolveImagePath(product.image_path, product.name);

    return (
        <>
            <Head title={`${product.name} — UniReserve Catalog`} />
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
                <Link
                    href="/items"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Catalog
                </Link>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image Showcase */}
                        <div className="bg-[#f5f8fc] border-b md:border-b-0 md:border-r border-gray-100 p-8 flex items-center justify-center min-h-[320px]">
                            <img
                                src={imageSrc}
                                alt={product.name}
                                className="max-h-[360px] max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/school-logo.png';
                                }}
                            />
                        </div>

                        {/* Product Configuration & Details */}
                        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#0B2356] text-white tracking-wide mb-2">
                                        {product.category?.name || 'Supply Item'}
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                        {product.name}
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                        {product.description || 'Official DSSC campus school uniform item.'}
                                    </p>
                                </div>

                                {/* Price & Stock Availability */}
                                <div className="flex items-baseline gap-3 pt-2">
                                    <span className="text-3xl font-black text-[#0B3A92] font-sans">
                                        {phpPeso(price)}
                                    </span>
                                    {availableStock > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {availableStock} in stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Size Variant Selection */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                        Choose Size / Option:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((s) => {
                                            const avail = s.inventory
                                                ? Math.max(0, (s.inventory.total_stock ?? 0) - (s.inventory.reserved_stock ?? 0))
                                                : 0;
                                            const isSelected = selectedSize?.id === s.id;

                                            return (
                                                <button
                                                    key={s.id}
                                                    disabled={avail === 0}
                                                    onClick={() => {
                                                        setSelectedSize(s);
                                                        setQty(1);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                                                        isSelected
                                                            ? 'border-[#0B2568] bg-[#0B2568] text-white shadow-sm ring-2 ring-blue-200'
                                                            : avail > 0
                                                            ? 'border-gray-200 text-gray-800 bg-white hover:border-blue-400'
                                                            : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                                                    }`}
                                                >
                                                    {s.size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedSize && (
                                        <p className="text-xs text-gray-500 pt-1">
                                            Size <strong>{selectedSize.size}</strong>:{' '}
                                            {availableStock > 0 ? `${availableStock} units available for reservation` : 'Currently out of stock'}
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Counter */}
                                {availableStock > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                            Quantity:
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                                                >
                                                    −
                                                </button>
                                                <span className="w-10 text-center font-bold text-gray-900 text-sm">
                                                    {qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xs text-gray-400">(Max 5 per order)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Reserve Button */}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={reserve}
                                    disabled={!selectedSize || availableStock === 0}
                                    className="w-full py-3.5 px-6 bg-[#0B2568] hover:bg-[#071a4d] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Calendar className="w-5 h-5" />
                                    {!selectedSize
                                        ? 'Select a size'
                                        : availableStock === 0
                                        ? 'Out of Stock'
                                        : `Reserve Now — ${phpPeso(price * qty)}`}
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    First-Come First-Served Queue slot assigned upon approval
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
