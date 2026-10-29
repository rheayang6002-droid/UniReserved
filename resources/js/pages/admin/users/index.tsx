import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Shield,
    GraduationCap,
    Briefcase,
    Edit3,
    Trash2,
    UserCheck,
    UserX,
    CreditCard,
    Crown,
} from 'lucide-react';

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    student_id: string | null;
    phone: string | null;
    course_program: string | null;
    year_level: string | null;
    roles?: { id: number; name: string }[];
    created_at: string;
};

type PaginatedUsers = {
    data: UserItem[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Props = {
    users: PaginatedUsers;
    filters: { search?: string; role?: string };
};

const ROLE_BADGES: Record<string, { label: string; badgeCls: string; icon: any }> = {
    'Super Admin': { label: 'Super Admin', badgeCls: 'bg-amber-50 text-amber-800 border-amber-300', icon: Crown },
    super_admin: { label: 'Super Admin', badgeCls: 'bg-amber-50 text-amber-800 border-amber-300', icon: Crown },
    'Staff/Admin': { label: 'BEO Staff / Admin', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
    admin: { label: 'BEO Staff / Admin', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
    staff: { label: 'BEO Staff / Admin', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
    'School Cashier': { label: 'School Cashier', badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CreditCard },
    Cashier: { label: 'School Cashier', badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CreditCard },
    cashier: { label: 'School Cashier', badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CreditCard },
    Student: { label: 'Student', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200', icon: GraduationCap },
    student: { label: 'Student', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200', icon: GraduationCap },
};

export default function AdminUsersIndex({ users, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { ...filters, search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleFilter = (role?: string) => {
        router.get(
            '/admin/users',
            { search: searchTerm || undefined, role: role || undefined },
            { preserveState: true }
        );
    };

    const handleDeactivate = (user: UserItem) => {
        if (confirm(`Deactivate user ${user.name}? They will not be able to log in.`)) {
            router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="User Management — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            User Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage student accounts, staff members, and system administrators.
                        </p>
                    </div>

                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New User
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { label: 'All Users', value: '' },
                            { label: 'Students', value: 'student' },
                            { label: 'BEO Staff', value: 'staff' },
                            { label: 'School Cashiers', value: 'cashier' },
                            { label: 'Super Admins', value: 'admin' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleRoleFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                                    (filters.role || '') === tab.value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 sm:w-72">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {users.data.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 px-4">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
                            <p className="font-semibold text-gray-700">No users found</p>
                            <p className="text-xs text-gray-400 mt-1">Try refining your search keyword or role filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">User Details</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Program / Level</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.data.map((u) => {
                                        const primaryRole = (u.roles && u.roles[0]?.name) || u.role;
                                        const role = ROLE_BADGES[primaryRole] || ROLE_BADGES[u.role] || {
                                            label: primaryRole,
                                            badgeCls: 'bg-gray-100 text-gray-700 border-gray-200',
                                            icon: Users,
                                        };

                                        return (
                                            <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                    {u.student_id && (
                                                        <div className="text-[11px] text-blue-600 font-mono mt-0.5">
                                                            ID: {u.student_id}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${role.badgeCls}`}>
                                                        <role.icon className="w-3 h-3" />
                                                        {role.label}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-xs text-gray-600">
                                                    <div>{u.course_program || '—'}</div>
                                                    <div className="text-gray-400">{u.year_level}</div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        u.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                        {u.status}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={`/admin/users/${u.id}/edit`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                                        </Link>

                                                        {u.status === 'active' && (
                                                            <button
                                                                onClick={() => handleDeactivate(u)}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                                                title="Deactivate account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 pt-2 flex-wrap">
                        {users.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
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
