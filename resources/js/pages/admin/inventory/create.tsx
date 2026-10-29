import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Plus, Trash2, Layers, Upload, X, ImageIcon, AlertCircle, Check } from 'lucide-react';

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

type BundleComponentInput = {
    component_product_id: number | '';
    quantity: number;
};

type ExistingProduct = {
    id: number;
    name: string;
    category_id: number;
    base_price: string | number;
    gender: string;
    product_type?: string;
    image_path?: string | null;
    sizes: {
        id: number;
        size: string;
        inventory?: {
            total_stock: number;
            reserved_stock: number;
        };
    }[];
};

type Props = {
    categories: Category[];
    existingProducts?: ExistingProduct[];
};

const PRODUCT_TYPES = [
    'Individual Item',
    'Uniform Set',
    'PE Set',
    'Uniform Set + ID Lace',
    'PE Set + ID Lace',
    'Uniform Set + PE Set',
    'Uniform Set + PE Set + ID Lace',
    'Custom Bundle',
] as const;

export default function AdminInventoryCreate({ categories, existingProducts = [] }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageClientError, setImageClientError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        base_price: '',
        gender: 'unisex',
        product_type: 'Individual Item',
        image: null as File | null,
        bundle_components: [] as BundleComponentInput[],
        sizes: [
            { size: 'Small', price_adjustment: 0, stock: 10 },
            { size: 'Medium', price_adjustment: 0, stock: 10 },
            { size: 'Large', price_adjustment: 0, stock: 10 },
        ] as SizeInput[],
    });

    const isBundle = data.product_type !== 'Individual Item';

    const handleProductTypeChange = (newType: string) => {
        setData((prev) => {
            const willBeBundle = newType !== 'Individual Item';
            let newBundleComponents = prev.bundle_components;

            if (willBeBundle && prev.bundle_components.length === 0) {
                // Initialize with one empty component slot
                newBundleComponents = [{ component_product_id: existingProducts[0]?.id || '', quantity: 1 }];
            }

            return {
                ...prev,
                product_type: newType,
                bundle_components: willBeBundle ? newBundleComponents : [],
            };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageClientError(null);

        if (!file) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setImageClientError('Please select a valid image format (JPEG, PNG, WebP, or GIF).');
            return;
        }

        // Validate size (max 5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            setImageClientError('Image size must be 5MB or less.');
            return;
        }

        setData('image', file);
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        setImageClientError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addBundleComponent = () => {
        const defaultProdId = existingProducts[0]?.id || '';
        setData('bundle_components', [
            ...data.bundle_components,
            { component_product_id: defaultProdId, quantity: 1 },
        ]);
    };

    const removeBundleComponent = (index: number) => {
        if (data.bundle_components.length <= 1) return;
        setData('bundle_components', data.bundle_components.filter((_, i) => i !== index));
    };

    const updateBundleComponent = (index: number, field: keyof BundleComponentInput, value: any) => {
        const updated = [...data.bundle_components];
        updated[index] = { ...updated[index], [field]: value };
        setData('bundle_components', updated);
    };

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
        post('/admin/inventory', {
            forceFormData: true,
        });
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
                            Specify product type, picture, item details, base pricing, categories, and size variants with initial stocks.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Type Selection */}
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <label className="block text-xs font-bold text-[#0B2568] uppercase tracking-wider mb-1.5">
                                Product Type *
                            </label>
                            <select
                                value={data.product_type}
                                onChange={(e) => handleProductTypeChange(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                {PRODUCT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1.5">
                                {isBundle
                                    ? 'Bundle products combine multiple individual inventory items into a single set package.'
                                    : 'A standard single product with its own individual inventory stock.'}
                            </p>
                            {errors.product_type && <p className="text-red-600 text-xs mt-1">{errors.product_type}</p>}
                        </div>

                        {/* Product Picture Upload */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Product Picture
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                                id="product-image-upload"
                            />

                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/60 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            Click to select a product picture
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                             PNG, JPG, WebP, or GIF up to 5MB. Preview will show before saving.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div className="w-28 h-28 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1 shadow-2xs">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left space-y-1">
                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                            <Check className="w-3 h-3" /> Image selected
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 truncate max-w-xs">
                                            {data.image?.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {data.image ? `${(data.image.size / 1024).toFixed(1)} KB` : ''}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Change Picture
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {imageClientError && (
                                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{imageClientError}</span>
                                </div>
                            )}
                            {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                        </div>

                        {/* Basic Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={isBundle ? 'e.g. Complete Uniform Set (Female)' : 'e.g. College Polo Uniform (Female)'}
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
                                Description & Bundle Notes
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Describe cloth material, bundle package contents, sizing tips, or department usage..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Bundle Components Selector (Shown only when product is a bundle) */}
                        {isBundle && (
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            <Package className="w-4 h-4 text-blue-600" /> Bundle Included Components
                                        </h2>
                                        <p className="text-xs text-gray-400">
                                            Select the existing inventory products included in this bundle and configure quantities.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addBundleComponent}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Component
                                    </button>
                                </div>

                                {data.bundle_components.length === 0 ? (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                        Please add at least one component to this bundle set.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {data.bundle_components.map((comp, idx) => {
                                            const selectedProd = existingProducts.find(
                                                (p) => p.id === Number(comp.component_product_id)
                                            );

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                                >
                                                    <div className="flex-1">
                                                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                            Component Product
                                                        </label>
                                                        <select
                                                            required
                                                            value={comp.component_product_id}
                                                            onChange={(e) =>
                                                                updateBundleComponent(
                                                                    idx,
                                                                    'component_product_id',
                                                                    Number(e.target.value) || ''
                                                                )
                                                            }
                                                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                                                        >
                                                            <option value="">-- Choose inventory item --</option>
                                                            {existingProducts.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} (₱{Number(p.base_price).toFixed(2)})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="w-full sm:w-28">
                                                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            required
                                                            value={comp.quantity}
                                                            onChange={(e) =>
                                                                updateBundleComponent(
                                                                    idx,
                                                                    'quantity',
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div className="flex items-end justify-end sm:pt-4">
                                                        <button
                                                            type="button"
                                                            disabled={data.bundle_components.length <= 1}
                                                            onClick={() => removeBundleComponent(idx)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                                                            title="Remove component"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Stock Compatibility:</strong> Bundle availability is automatically calculated from the physical stock of these required components. Stock will not be double-counted.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Size Variations & Stock */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-blue-600" /> Size Variations
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        {isBundle
                                            ? 'Define sizes (e.g. S, M, L, XL or Standard) applicable for this bundle package.'
                                            : 'Define sizes with specific initial physical stock and optional price adjustments.'}
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

                                        {!isBundle ? (
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
                                        ) : (
                                            <div className="w-full sm:w-36">
                                                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                                                    Stock Handling
                                                </label>
                                                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] font-semibold text-blue-700 text-center">
                                                    Auto / Component
                                                </div>
                                            </div>
                                        )}

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
