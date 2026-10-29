import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ShieldCheck,
    Plus,
    Users,
    Key,
    Lock,
    Edit3,
    Trash2,
    Check,
    AlertCircle,
    X,
} from 'lucide-react';

type RoleItem = {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions: string[];
    is_system: boolean;
    created_at: string | null;
};

type PermissionItem = {
    id: number;
    name: string;
    guard_name: string;
};

type Props = {
    roles: RoleItem[];
    permissions: PermissionItem[];
    system_roles: string[];
};

export default function RolesIndex({
    roles = [],
    permissions = [],
    system_roles = [],
}: Props) {
    const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
    const [isEditingPermissions, setIsEditingPermissions] = useState(false);
    const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group permissions by category for intuitive display
    const groupPermissions = (perms: PermissionItem[]) => {
        const groups: Record<string, PermissionItem[]> = {
            'Student & Uniforms': [],
            'Staff Fulfillment & Queue': [],
            'Governance & Administration': [],
            'System & General': [],
        };

        perms.forEach((p) => {
            if (p.name.includes('reservation') || p.name.includes('queue') || p.name.includes('uniform') || p.name.includes('ai')) {
                if (p.name.includes('own') || p.name.includes('create reservation') || p.name.includes('ai') || p.name === 'view uniforms') {
                    groups['Student & Uniforms'].push(p);
                } else {
                    groups['Staff Fulfillment & Queue'].push(p);
                }
            } else if (p.name.includes('user') || p.name.includes('role') || p.name.includes('permission') || p.name.includes('super admin')) {
                groups['Governance & Administration'].push(p);
            } else {
                groups['System & General'].push(p);
            }
        });

        return groups;
    };

    const permissionGroups = groupPermissions(permissions);

    const openEditPermissions = (role: RoleItem) => {
        setSelectedRole(role);
        setAssignedPermissions([...role.permissions]);
        setIsEditingPermissions(true);
    };

    const togglePermission = (permName: string) => {
        setAssignedPermissions((prev) =>
            prev.includes(permName)
                ? prev.filter((p) => p !== permName)
                : [...prev, permName]
        );
    };

    const savePermissions = () => {
        if (!selectedRole) return;
        setIsSubmitting(true);
        router.post(
            `/admin/roles/${selectedRole.id}/permissions`,
            { permissions: assignedPermissions },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsEditingPermissions(false);
                },
            }
        );
    };

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        setIsSubmitting(true);
        router.post(
            '/admin/roles',
            { name: newRoleName.trim() },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsCreatingRole(false);
                    setNewRoleName('');
                },
            }
        );
    };

    const handleDeleteRole = (role: RoleItem) => {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(`/admin/roles/${role.id}`);
        }
    };

    return (
        <>
            <Head title="Role Management — UNiReserve Admin" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                            <ShieldCheck className="w-7 h-7 text-indigo-600" />
                            Role Management & RBAC
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Configure Spatie RBAC roles, assign granular permissions, and govern module access boundaries.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreatingRole(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Role
                    </button>
                </div>

                {/* Roles List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {roles.map((role) => {
                        const isSystemRole = role.is_system;
                        const isSuperAdminRole = role.name === 'Super Admin';

                        return (
                            <div
                                key={role.id}
                                className={`bg-white rounded-2xl border ${
                                    isSuperAdminRole
                                        ? 'border-amber-300 ring-1 ring-amber-100 shadow-sm'
                                        : 'border-gray-200 shadow-sm'
                                } p-5 flex flex-col justify-between hover:shadow-md transition-shadow`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                    isSuperAdminRole
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : isSystemRole
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">{role.name}</h3>
                                                <span className="text-[11px] font-mono text-gray-400">
                                                    guard: {role.guard_name}
                                                </span>
                                            </div>
                                        </div>

                                        {isSystemRole ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                System Role
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Custom
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 bg-gray-50 rounded-xl text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            <span><strong>{role.users_count}</strong> Assigned Users</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Key className="w-3.5 h-3.5 text-gray-400" />
                                            <span><strong>{role.permissions.length}</strong> Permissions</span>
                                        </div>
                                    </div>

                                    {/* Permission Badges Preview */}
                                    <div className="mt-3">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                            Permissions Overview
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                                            {isSuperAdminRole ? (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-medium">
                                                    ★ Universal Wildcard Access (All Permissions)
                                                </span>
                                            ) : role.permissions.length === 0 ? (
                                                <span className="text-xs text-gray-400 italic">No direct permissions assigned</span>
                                            ) : (
                                                role.permissions.slice(0, 8).map((perm, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-medium"
                                                    >
                                                        {perm}
                                                    </span>
                                                ))
                                            )}
                                            {!isSuperAdminRole && role.permissions.length > 8 && (
                                                <span className="text-[10px] font-semibold text-indigo-600 self-center">
                                                    +{role.permissions.length - 8} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => openEditPermissions(role)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Configure Permissions
                                    </button>

                                    {!isSystemRole && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRole(role)}
                                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-50"
                                            title="Delete role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Configure Permissions Modal */}
            {isEditingPermissions && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-indigo-600" />
                                    Assign Permissions: {selectedRole.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Toggle granular permissions for role {selectedRole.name}.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditingPermissions(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable permissions checklist */}
                        <div className="p-5 overflow-y-auto space-y-5 flex-1">
                            {Object.entries(permissionGroups).map(([groupName, groupPerms]) => (
                                <div key={groupName} className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-1">
                                        {groupName} ({groupPerms.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {groupPerms.map((perm) => {
                                            const isChecked = assignedPermissions.includes(perm.name);
                                            return (
                                                <label
                                                    key={perm.id}
                                                    onClick={() => togglePermission(perm.name)}
                                                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                                                        isChecked
                                                            ? 'bg-indigo-50/60 border-indigo-300 text-indigo-900 font-medium'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 pointer-events-none"
                                                    />
                                                    <span className="truncate">{perm.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/60 rounded-b-2xl">
                            <span className="text-xs text-gray-500">
                                <strong>{assignedPermissions.length}</strong> selected permissions
                            </span>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPermissions(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={savePermissions}
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Role Modal */}
            {isCreatingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <form
                        onSubmit={handleCreateRole}
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Create New Role
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreatingRole(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Role Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Department Head"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreatingRole(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
