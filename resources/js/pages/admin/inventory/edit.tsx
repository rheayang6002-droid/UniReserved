import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Check, Save, Upload, Trash2, AlertCircle, Layers, Plus } from 'lucide-react';

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

type BundleItem = {
    id: number;
    bundle_product_id: number;
    component_product_id: number;
    quantity: number;
    component_product?: {
        id: number;
        name: string;
        base_price: string | number;
    };
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    base_price: string | number;
    gender: string;
    product_type?: string;
    image_path?: string | null;
    is_active: boolean;
    category?: Category;
    sizes: ProductSize[];
    bundle_items?: BundleItem[];
};

type ExistingProduct = {
    id: number;
    name: string;
    category_id: number;
    base_price: string | number;
    gender: string;
    product_type?: string;
    image_path?: string | null;
};

type Props = {
    product: Product;
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

function resolveProductImage(path: string | null | undefined) {
    if (!path) return '/images/placeholder-product.svg';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
}

export default function AdminInventoryEdit({ product, categories, existingProducts = [] }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageClientError, setImageClientError] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [productType, setProductType] = useState(product.product_type || 'Individual Item');
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description || '');
    const [basePrice, setBasePrice] = useState(product.base_price);
    const [gender, setGender] = useState(product.gender);
    const [isActive, setIsActive] = useState(Boolean(product.is_active));
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    const initialComponents = (product.bundle_items && product.bundle_items.length > 0)
        ? product.bundle_items.map((b) => ({ component_product_id: b.component_product_id, quantity: b.quantity }))
        : (existingProducts.length > 0 ? [{ component_product_id: existingProducts[0].id, quantity: 1 }] : []);

    const [bundleComponents, setBundleComponents] = useState<{ component_product_id: number | ''; quantity: number }[]>(initialComponents);

    const isBundle = productType !== 'Individual Item';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageClientError(null);
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setImageClientError('Please select a valid image format (JPEG, PNG, WebP, or GIF).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageClientError('Image size must be 5MB or less.');
            return;
        }

        setSelectedImageFile(file);
        setRemoveExistingImage(false);

        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
        setRemoveExistingImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addBundleComponent = () => {
        const defaultId = existingProducts[0]?.id || '';
        setBundleComponents([...bundleComponents, { component_product_id: defaultId, quantity: 1 }]);
    };

    const removeBundleComponent = (index: number) => {
        if (bundleComponents.length <= 1) return;
        setBundleComponents(bundleComponents.filter((_, i) => i !== index));
    };

    const updateBundleComponent = (index: number, field: 'component_product_id' | 'quantity', value: any) => {
        const updated = [...bundleComponents];
        updated[index] = { ...updated[index], [field]: value };
        setBundleComponents(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData: Record<string, any> = {
            _method: 'put',
            name,
            description,
            base_price: basePrice,
            gender,
            product_type: productType,
            is_active: isActive ? 1 : 0,
            remove_image: removeExistingImage ? 1 : 0,
        };

        if (selectedImageFile) {
            formData.image = selectedImageFile;
        }

        if (isBundle) {
            formData.bundle_components = bundleComponents;
        }

        router.post(`/admin/inventory/${product.id}`, formData, {
            forceFormData: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const currentDisplayImage = imagePreview
        ? imagePreview
        : (!removeExistingImage && product.image_path)
        ? resolveProductImage(product.image_path)
        : null;

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
                            Modify product name, picture, pricing, bundle configuration, and active visibility.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Product Type */}
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <label className="block text-xs font-bold text-[#0B2568] uppercase tracking-wider mb-1.5">
                                Product Type
                            </label>
                            <select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                {PRODUCT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Image Field */}
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
                                id="product-edit-image"
                            />

                            {currentDisplayImage ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div className="w-28 h-28 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1 shadow-2xs">
                                        <img
                                            src={currentDisplayImage}
                                            alt={product.name}
                                            className="max-h-full max-w-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/placeholder-product.svg';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left space-y-1">
                                        <p className="text-xs font-semibold text-gray-800">
                                            {selectedImageFile ? selectedImageFile.name : 'Current Saved Picture'}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {selectedImageFile
                                                ? `${(selectedImageFile.size / 1024).toFixed(1)} KB (pending save)`
                                                : 'Active product image'}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-2.5 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Replace Picture
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove Picture
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/60 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-gray-800">
                                            Click to upload a product picture
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            PNG, JPG, WebP, or GIF up to 2MB.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {imageClientError && (
                                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{imageClientError}</span>
                                </div>
                            )}
                        </div>

                        {/* Basic Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                />
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
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Gender / Department
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="unisex">Unisex / All</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Bundle Components (if bundle) */}
                        {isBundle && (
                            <div className="border-t border-gray-100 pt-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-blue-600" /> Bundle Components ({bundleComponents.length})
                                        </h2>
                                        <p className="text-[11px] text-gray-400">
                                            Items included in this set. Stock is derived from component availability.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addBundleComponent}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {bundleComponents.map((comp, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                                        >
                                            <div className="flex-1">
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
                                                    className="w-full px-2.5 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                                                >
                                                    <option value="">-- Choose item --</option>
                                                    {existingProducts.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-full sm:w-24">
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
                                                    className="w-full px-2.5 py-1.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                                    placeholder="Qty"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                disabled={bundleComponents.length <= 1}
                                                onClick={() => removeBundleComponent(idx)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer self-end sm:self-center"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Active toggle */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
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
                                {isBundle
                                    ? '* Bundle availability is automatically synced with component item stock.'
                                    : '* To adjust physical stock quantities, use the "Adjust Stock" action on the inventory list.'}
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
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Saving...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
