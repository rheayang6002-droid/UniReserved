import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Key,
    Plus,
    Search,
    Shield,
    Trash2,
    Lock,
    X,
} from 'lucide-react';

type PermissionItem = {
    id: number;
    name: string;
    guard_name: string;
    roles?: { id: number; name: string }[];
    created_at: string;
};

type PaginatedPermissions = {
    data: PermissionItem[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Props = {
    permissions: PaginatedPermissions;
    protected_permissions: string[];
    filters: { search?: string };
    roles: { id: number; name: string }[];
};

export default function PermissionsIndex({
    permissions,
    protected_permissions = [],
    filters = {},
    roles = [],
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreating, setIsCreating] = useState(false);
    const [newPermissionName, setNewPermissionName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/permissions',
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleCreatePermission = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPermissionName.trim()) return;
        setIsSubmitting(true);
        router.post(
            '/admin/permissions',
            { name: newPermissionName.trim(), roles: selectedRoles },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsCreating(false);
                    setNewPermissionName('');
                    setSelectedRoles([]);
                },
            }
        );
    };

    const handleDelete = (perm: PermissionItem) => {
        if (confirm(`Are you sure you want to delete permission "${perm.name}"?`)) {
            router.delete(`/admin/permissions/${perm.id}`);
        }
    };

    const toggleRole = (roleName: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName)
                ? prev.filter((r) => r !== roleName)
                : [...prev, roleName]
        );
    };

    return (
        <>
            <Head title="Permission Management — UNiReserve Admin" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                            <Key className="w-7 h-7 text-amber-600" />
                            Permission Management
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Granular access control rights for UNiReserve modules and system operations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create Permission
                    </button>
                </div>

                {/* Filter and Search */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search permissions..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 w-56 sm:w-72"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                            >
                                Search
                            </button>
                        </form>

                        <div className="text-xs text-gray-500">
                            Total registered permissions: <strong>{permissions.total}</strong>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                                <tr>
                                    <th className="py-3 px-4">Permission Name</th>
                                    <th className="py-3 px-4">Guard</th>
                                    <th className="py-3 px-4">Assigned Roles</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {permissions.data.map((perm) => {
                                    const isProtected = protected_permissions.includes(perm.name);

                                    return (
                                        <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-900 font-semibold">
                                                {perm.name}
                                            </td>

                                            <td className="py-3 px-4 text-xs font-mono text-gray-400">
                                                {perm.guard_name}
                                            </td>

                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {perm.roles && perm.roles.length > 0 ? (
                                                        perm.roles.map((r) => (
                                                            <span
                                                                key={r.id}
                                                                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                            >
                                                                {r.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">None</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                {isProtected ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Lock className="w-2.5 h-2.5" /> Core System
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                                        Custom
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right">
                                                {!isProtected ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(perm)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                                        title="Delete custom permission"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 cursor-not-allowed" title="System core permission cannot be deleted">
                                                        <Lock className="w-4 h-4 inline" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {permissions.links && permissions.links.length > 3 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">
                                Showing {permissions.data.length} of {permissions.total} permissions
                            </span>
                            <div className="flex gap-1">
                                {permissions.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url || link.active}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                            link.active
                                                ? 'bg-amber-600 text-white'
                                                : link.url
                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Permission Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <form
                        onSubmit={handleCreatePermission}
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-amber-600" />
                                Create Permission
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Permission Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. export inventory records"
                                value={newPermissionName}
                                onChange={(e) => setNewPermissionName(e.target.value)}
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Use lower-case format (e.g. "view audit logs")</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Assign To Roles (Optional)
                            </label>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2.5">
                                {roles.map((r) => (
                                    <label
                                        key={r.id}
                                        onClick={() => toggleRole(r.name)}
                                        className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(r.name)}
                                            onChange={() => {}}
                                            className="w-3.5 h-3.5 rounded text-amber-600 pointer-events-none"
                                        />
                                        <span>{r.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Permission'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
