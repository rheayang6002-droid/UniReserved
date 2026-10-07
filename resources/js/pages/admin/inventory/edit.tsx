import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Check, Save } from 'lucide-react';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type ProductSize = {
    id: number;
    size: string;
    price_adjustment: string | number;
    inventory?: {
        total_stock: number;
        reserved_stock: number;
    };
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

type Props = {
    product: Product;
    categories: Category[];
};

export default function AdminInventoryEdit({ product, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        description: product.description || '',
        base_price: product.base_price,
        gender: product.gender,
        is_active: Boolean(product.is_active),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/inventory/${product.id}`);
    };

    return (
        <>
            <Head title={`Edit ${product.name} — UniReserve Admin`} />
            <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/inventory"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Inventory
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="border-b border-gray-100 pb-5 mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            Edit Product Details
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            Modify product name, base pricing, gender specification, and active visibility.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                />
                                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Base Price (₱) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                        ₱
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {errors.base_price && <p className="text-red-600 text-xs mt-1">{errors.base_price}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Gender / Department
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="unisex">Unisex / All</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Status Active toggle */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="is_active" className="text-xs sm:text-sm text-gray-700 font-medium cursor-pointer">
                                Active item in student catalog (Visible for reservations)
                            </label>
                        </div>

                        {/* Current Sizes Reference */}
                        <div className="border-t border-gray-100 pt-5">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Existing Size Variants ({product.sizes.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {product.sizes.map((s) => (
                                    <div key={s.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                        <div className="font-bold text-gray-900">{s.size}</div>
                                        <div className="text-gray-500 text-[11px] mt-1">
                                            Stock: <strong>{s.inventory?.total_stock ?? 0} units</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2">
                                * To adjust actual stock quantities for each size, use the "Adjust Stock" button on the inventory list.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href="/admin/inventory"
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
