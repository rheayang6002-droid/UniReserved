import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Plus, Trash2, Layers, DollarSign } from 'lucide-react';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type SizeInput = {
    size: string;
    price_adjustment: number;
    stock: number;
};

export default function AdminInventoryCreate({ categories }: { categories: Category[] }) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        base_price: '',
        gender: 'unisex',
        sizes: [
            { size: 'Small', price_adjustment: 0, stock: 10 },
            { size: 'Medium', price_adjustment: 0, stock: 10 },
            { size: 'Large', price_adjustment: 0, stock: 10 },
        ] as SizeInput[],
    });

    const addSizeRow = () => {
        setData('sizes', [...data.sizes, { size: '', price_adjustment: 0, stock: 0 }]);
    };

    const removeSizeRow = (index: number) => {
        if (data.sizes.length <= 1) return;
        setData('sizes', data.sizes.filter((_, i) => i !== index));
    };

    const updateSizeRow = (index: number, field: keyof SizeInput, value: any) => {
        const updated = [...data.sizes];
        updated[index] = { ...updated[index], [field]: value };
        setData('sizes', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/inventory');
    };

    return (
        <>
            <Head title="Add New Item — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
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
                            Add New School Supply or Uniform Item
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            Specify item details, base pricing, categories, and size variants with initial stocks.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. College Polo Uniform (Female)"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-600 text-xs mt-1">{errors.category_id}</p>}
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
                                        placeholder="350.00"
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                {errors.base_price && <p className="text-red-600 text-xs mt-1">{errors.base_price}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Target Gender / Department *
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                                Description & Material Notes
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Describe cloth material, sizing tips, or department usage..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Size Variations & Stock */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-blue-600" /> Size Variations & Initial Stock
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        Define sizes (e.g. S, M, L, XL or Standard) with specific stock and optional price adjustments.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSizeRow}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Size
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.sizes.map((row, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                    >
                                        <div className="flex-1">
                                            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                Size Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Medium or Standard"
                                                value={row.size}
                                                onChange={(e) => updateSizeRow(index, 'size', e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="w-full sm:w-36">
                                            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                Price Adj. (₱)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                value={row.price_adjustment}
                                                onChange={(e) =>
                                                    updateSizeRow(index, 'price_adjustment', parseFloat(e.target.value) || 0)
                                                }
                                                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="w-full sm:w-36">
                                            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                Initial Stock
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                placeholder="10"
                                                value={row.stock}
                                                onChange={(e) =>
                                                    updateSizeRow(index, 'stock', parseInt(e.target.value) || 0)
                                                }
                                                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-end justify-end sm:pt-4">
                                            <button
                                                type="button"
                                                disabled={data.sizes.length <= 1}
                                                onClick={() => removeSizeRow(index)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                                                title="Remove variant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Actions */}
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
                                className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Creating...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
