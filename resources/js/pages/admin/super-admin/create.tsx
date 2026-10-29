import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    UserCheck,
    Search,
    AlertCircle,
    CheckCircle2,
    Crown,
    GraduationCap,
    Briefcase,
    ShieldAlert,
    ChevronRight,
    UserMinus,
} from 'lucide-react';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    student_id?: string | null;
    roles: { id: number; name: string }[];
    created_at: string;
};

type PaginatedUsers = {
    data: UserItem[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
};

type Props = {
    super_admins: UserItem[];
    eligible_users: PaginatedUsers;
    filters: { search?: string; role?: string };
    available_roles: string[];
};

export default function CreateSuperAdmin({
    super_admins = [],
    eligible_users,
    filters = {},
    available_roles = [],
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [confirmUser, setConfirmUser] = useState<UserItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const [demoteUser, setDemoteUser] = useState<UserItem | null>(null);
    const [demoteRole, setDemoteRole] = useState<'Staff/Admin' | 'School Cashier' | 'Student'>('Staff/Admin');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/super-admin/create',
            { search: search || undefined, role: selectedRole || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        router.get(
            '/admin/super-admin/create',
            { search: search || undefined, role: role || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handlePromote = (user: UserItem) => {
        setConfirmUser(user);
    };

    const confirmPromotion = () => {
        if (!confirmUser) return;
        setIsSubmitting(true);
        router.post(
            `/admin/super-admin/promote/${confirmUser.id}`,
            {},
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setConfirmUser(null);
                },
            }
        );
    };

    const confirmDemotion = () => {
        if (!demoteUser) return;
        setIsSubmitting(true);
        router.post(
            `/admin/super-admin/demote/${demoteUser.id}`,
            { new_role: demoteRole },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setDemoteUser(null);
                },
            }
        );
    };

    return (
        <>
            <Head title="Create Super Admin — UNiReserve" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                            <Crown className="w-3.5 h-3.5 text-amber-200" />
                            Administrative Governance Module
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Create & Promote Super Admin
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-amber-100">
                            Promote verified student or staff accounts to the highest administrative privilege level. Super Admins possess full system governance, role & permission assignments, user management, and configuration capabilities.
                        </p>
                    </div>
                    <div className="absolute right-4 -bottom-6 opacity-15 hidden md:block">
                        <ShieldCheck className="w-56 h-56 text-white" />
                    </div>
                </div>

                {/* Current Super Admins Grid */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                <Crown className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Current Super Administrators</h2>
                                <p className="text-xs text-gray-500">Authorized personnel holding full system authority ({super_admins.length})</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {super_admins.map((admin) => (
                            <div
                                key={admin.id}
                                className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                        {admin.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <h3 className="font-semibold text-sm text-gray-900 truncate">{admin.name}</h3>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                <Crown className="w-2.5 h-2.5" /> Super Admin
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{admin.email}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                                            <span>Status: <strong className="text-emerald-700 font-medium">Active</strong></span>
                                            <span>ID #{admin.id}</span>
                                        </div>
                                    </div>
                                </div>
                                {admin.id !== currentUserId && super_admins.length > 1 && (
                                    <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setDemoteUser(admin)}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <UserMinus className="w-3 h-3" />
                                            Reassign / Demote
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Eligible Users Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-blue-600" />
                                    Select User to Promote
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Search registered students or staff accounts and promote them to Super Admin.
                                </p>
                            </div>

                            {/* Search & Filter Form */}
                            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 w-52 sm:w-64"
                                    />
                                </div>

                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="py-1.5 px-3 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="Student">Student</option>
                                    <option value="Staff/Admin">Staff/Admin</option>
                                </select>

                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                >
                                    Filter
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                                <tr>
                                    <th className="py-3 px-4">User Details</th>
                                    <th className="py-3 px-4">Student ID / Dept</th>
                                    <th className="py-3 px-4">Current Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {eligible_users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            No eligible users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    eligible_users.data.map((user) => {
                                        const primaryRole = user.roles?.[0]?.name || user.role || 'Student';
                                        const isStudent = primaryRole.toLowerCase().includes('student');

                                        return (
                                            <tr key={user.id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 text-xs font-mono text-gray-500">
                                                    {user.student_id || '—'}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                        isStudent
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    }`}>
                                                        {isStudent ? (
                                                            <GraduationCap className="w-3 h-3" />
                                                        ) : (
                                                            <Briefcase className="w-3 h-3" />
                                                        )}
                                                        {primaryRole}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                        user.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePromote(user)}
                                                        disabled={user.status !== 'active'}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        <Crown className="w-3.5 h-3.5" />
                                                        Promote to Super Admin
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {eligible_users.links && eligible_users.links.length > 3 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">
                                Showing {eligible_users.data.length} of {eligible_users.total} eligible users
                            </span>
                            <div className="flex gap-1">
                                {eligible_users.links.map((link, idx) => (
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

            {/* Confirmation Modal */}
            {confirmUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Confirm Super Admin Promotion
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                                Are you sure you want to promote <strong className="text-gray-900">{confirmUser.name}</strong> ({confirmUser.email}) to <strong className="text-amber-700">Super Admin</strong>?
                            </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-800 space-y-1">
                            <div className="font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                Granted Privileges:
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 text-amber-700 text-[11px]">
                                <li>Full system administration and module governance</li>
                                <li>User creation, role and permission management</li>
                                <li>Authority to promote other eligible accounts</li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmUser(null)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmPromotion}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Promoting...' : 'Confirm Promotion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Demote / Reassign Modal */}
            {demoteUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                            <UserMinus className="w-6 h-6" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Reassign Super Admin Role
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                                Select a new role to reassign <strong className="text-gray-900">{demoteUser.name}</strong> ({demoteUser.email}).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-700 block">Select Target Role:</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDemoteRole('Staff/Admin')}
                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                                        demoteRole === 'Staff/Admin'
                                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <div className="font-bold">BEO Staff / Admin</div>
                                    <div className="text-[11px] text-gray-500 font-normal mt-0.5">BEO operations, inventory & release</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDemoteRole('School Cashier')}
                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                                        demoteRole === 'School Cashier'
                                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <div className="font-bold">School Cashier</div>
                                    <div className="text-[11px] text-gray-500 font-normal mt-0.5">Payment collections & receipts</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDemoteRole('Student')}
                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                                        demoteRole === 'Student'
                                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    <div className="font-bold">Student</div>
                                    <div className="text-[11px] text-gray-500 font-normal mt-0.5">Standard uniform reservation account</div>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDemoteUser(null)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDemotion}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : `Reassign to ${demoteRole}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
