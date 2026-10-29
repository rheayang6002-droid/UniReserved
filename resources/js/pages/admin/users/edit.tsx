import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserCheck, Shield, GraduationCap, Briefcase, Mail, User, Phone, BookOpen, Lock } from 'lucide-react';

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
};

export default function AdminUsersEdit({ user }: { user: UserItem }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || '',
        course_program: user.course_program || '',
        year_level: user.year_level || '1st Year',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <>
            <Head title={`Edit ${user.name} — UniReserve Admin`} />
            <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to User List
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="border-b border-gray-100 pb-5 mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                            Edit User Profile: {user.name}
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            Update account roles, status, academic records, or reset user password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    System Role *
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                >
                                    <option value="student">Student (Uniform Reservation)</option>
                                    <option value="staff">BEO Staff / Admin (Operations & Release)</option>
                                    <option value="cashier">School Cashier (Payments & Receipts)</option>
                                    <option value="super_admin">Super Admin (System Governance)</option>
                                </select>
                                {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Account Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive / Suspended</option>
                                </select>
                                {errors.status && <p className="text-red-600 text-xs mt-1">{errors.status}</p>}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                    />
                                </div>
                                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                    />
                                </div>
                                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {user.student_id && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Student ID
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user.student_id}
                                        className="w-full px-3 py-2 bg-gray-100 text-gray-600 font-mono border border-gray-200 rounded-xl text-sm cursor-not-allowed"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Student academic details */}
                        {data.role === 'student' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Academic Details
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Course / Degree Program
                                        </label>
                                        <div className="relative">
                                            <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={data.course_program}
                                                onChange={(e) => setData('course_program', e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Year Level
                                        </label>
                                        <select
                                            value={data.year_level}
                                            onChange={(e) => setData('year_level', e.target.value)}
                                            className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="Graduate / Senior">Graduate / Senior</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Optional Reset Password */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Change Password (Leave blank to keep current)
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="Leave empty to keep"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="Leave empty to keep"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href="/admin/users"
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
