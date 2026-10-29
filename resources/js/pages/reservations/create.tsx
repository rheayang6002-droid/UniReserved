import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ChevronLeft, Check, ShieldCheck } from 'lucide-react';

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
    base_price: string;
    gender: string;
    product_type?: string;
    image_path: string | null;
    category: { name: string; icon: string | null };
    sizes: Size[];
};

type CartItem = {
    product: Product;
    size: Size;
    quantity: number;
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

    // Do not use the college logo as default; use placeholder
    return '/images/placeholder-product.svg';
}

export default function ReservationCreate({ products }: { products: Product[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [qty, setQty] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Pre-populate cart if redirected from product details with query params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sizeId = urlParams.get('product_size_id');
        const quantity = parseInt(urlParams.get('quantity') || '1', 10);

        if (sizeId) {
            for (const prod of products) {
                const foundSize = prod.sizes.find((s) => s.id === Number(sizeId));
                if (foundSize) {
                    setCart([{ product: prod, size: foundSize, quantity }]);
                    setSelectedProduct(prod);
                    break;
                }
            }
        }
    }, [products]);

    const totalAmount = cart.reduce((sum, item) => {
        return (
            sum +
            (Number(item.product.base_price) + Number(item.size.price_adjustment)) * item.quantity
        );
    }, 0);

    function addToCart() {
        if (!selectedProduct || !selectedSize) return;

        const maxAvail = selectedSize.inventory
            ? Math.max(0, (selectedSize.inventory.total_stock ?? 0) - (selectedSize.inventory.reserved_stock ?? 0))
            : 0;

        const existing = cart.findIndex((c) => c.size.id === selectedSize.id);
        if (existing >= 0) {
            const newQty = cart[existing].quantity + qty;
            const maxQty = Math.min(maxAvail, 5);
            if (newQty > maxQty) {
                setError(`Maximum ${maxQty} units allowed for size ${selectedSize.size}.`);
                return;
            }
            setCart((c) => c.map((item, i) => (i === existing ? { ...item, quantity: newQty } : item)));
        } else {
            setCart((c) => [...c, { product: selectedProduct, size: selectedSize, quantity: qty }]);
        }

        setSelectedSize(null);
        setQty(1);
        setError('');
    }

    function removeFromCart(index: number) {
        setCart((c) => c.filter((_, i) => i !== index));
    }

    function submit() {
        if (cart.length === 0) {
            setError('Please add at least one item to your reservation.');
            return;
        }
        setSubmitting(true);
        router.post(
            '/reservations',
            {
                items: cart.map((item) => ({
                    product_size_id: item.size.id,
                    quantity: item.quantity,
                })),
            },
            {
                onError: (errors) => {
                    setError(Object.values(errors).join(', '));
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            }
        );
    }

    return (
        <>
            <Head title="Create Reservation — UniReserve" />
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                <Link
                    href="/reservations"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Reservations
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Make a Reservation</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Select uniform or supply items to book your First-Come First-Served releasing queue slot.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Catalog Selection List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
                            <h2 className="font-bold text-gray-900 text-base mb-4">
                                1. Choose Items & Size
                            </h2>

                            <div className="space-y-3">
                                {products.map((product) => {
                                    const isSelected = selectedProduct?.id === product.id;
                                    const imageSrc = resolveImagePath(product.image_path, product.name);

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setSelectedSize(null);
                                                setQty(1);
                                            }}
                                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-[#0B2568] bg-blue-50/40 ring-1 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-14 h-14 rounded-lg bg-[#f5f8fc] border border-gray-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                                    <img
                                                        src={imageSrc}
                                                        alt={product.name}
                                                        className="max-h-full max-w-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/images/placeholder-product.svg';
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                                            {product.category?.name}
                                                        </span>
                                                        {product.product_type && product.product_type !== 'Individual Item' && (
                                                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                                                                {product.product_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                                                        {product.name}
                                                    </div>
                                                </div>

                                                <div className="font-black text-[#0B3A92] text-sm sm:text-base font-mono shrink-0">
                                                    ₱{Number(product.base_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            {/* Size Picker for Selected Item */}
                                            {isSelected && (
                                                <div className="mt-3.5 pt-3 border-t border-gray-200/80 space-y-3">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-700 block mb-1.5">
                                                            Select Size:
                                                        </span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.sizes.map((size) => {
                                                                const avail = size.inventory
                                                                    ? Math.max(0, (size.inventory.total_stock ?? 0) - (size.inventory.reserved_stock ?? 0))
                                                                    : 0;
                                                                const isSizeActive = selectedSize?.id === size.id;

                                                                return (
                                                                    <button
                                                                        key={size.id}
                                                                        type="button"
                                                                        disabled={avail === 0}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedSize(size);
                                                                            setQty(1);
                                                                        }}
                                                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                                            isSizeActive
                                                                                ? 'border-[#0B2568] bg-[#0B2568] text-white shadow-xs'
                                                                                : avail > 0
                                                                                ? 'border-gray-200 text-gray-700 bg-white hover:border-blue-300'
                                                                                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                                                                        }`}
                                                                    >
                                                                        {size.size} ({avail} avail)
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {selectedSize && (
                                                        <div className="flex items-center gap-4 pt-1">
                                                            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setQty((q) => Math.max(1, q - 1));
                                                                    }}
                                                                    className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="w-8 text-center text-xs font-bold text-gray-900">
                                                                    {qty}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setQty((q) => Math.min(5, q + 1));
                                                                    }}
                                                                    className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addToCart();
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B2568] hover:bg-[#071a4d] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" /> Add to Reservation
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Reservation Summary / Cart */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 sticky top-6 space-y-4">
                            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-blue-600" />
                                2. Reservation Basket ({cart.length})
                            </h2>

                            {cart.length === 0 ? (
                                <div className="py-10 text-center text-gray-400">
                                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-600" />
                                    <p className="text-xs font-medium text-gray-600">Basket is empty</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Click on any item on the left to add it here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 space-y-2">
                                    {cart.map((item, idx) => {
                                        const unitPrice =
                                            Number(item.product.base_price) + Number(item.size.price_adjustment);
                                        const subtotal = unitPrice * item.quantity;

                                        return (
                                            <div key={idx} className="pt-2 flex items-start justify-between gap-2">
                                                <div className="space-y-0.5">
                                                    <div className="text-xs font-bold text-gray-900">
                                                        {item.product.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500">
                                                        Size: <strong className="text-gray-800">{item.size.size}</strong> × {item.quantity}
                                                    </div>
                                                    <div className="text-[11px] text-blue-600 font-mono">
                                                        ₱{unitPrice.toFixed(2)} each
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-gray-900 font-mono">
                                                        ₱{subtotal.toFixed(2)}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(idx)}
                                                        className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer mt-1"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Total & Submit */}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                        Total Amount:
                                    </span>
                                    <span className="text-2xl font-black text-[#0B3A92] font-mono">
                                        ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={cart.length === 0 || submitting}
                                    onClick={submit}
                                    className="w-full py-3 bg-[#0B2568] hover:bg-[#071a4d] text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {submitting ? 'Confirming...' : 'Submit Reservation'}
                                </button>

                                <div className="text-center">
                                    <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                        Pay at Cashier upon admin approval
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
