import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Shield, GraduationCap, Briefcase, Lock, Mail, User, Phone, BookOpen, Crown, CreditCard } from 'lucide-react';

export default function AdminUsersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        student_id: '',
        phone: '',
        course_program: '',
        year_level: '1st Year',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users');
    };

    return (
        <>
            <Head title="Add New User — UniReserve Admin" />
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
                            <UserPlus className="w-6 h-6 text-blue-600" />
                            Create User Account
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            Register a new student, staff cashier, or administrator account into UniReserve.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selector Card */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Account Role *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Uniform reservations' },
                                    { value: 'staff', label: 'BEO Staff / Admin', icon: Briefcase, desc: 'BEO operations & release' },
                                    { value: 'cashier', label: 'School Cashier', icon: CreditCard, desc: 'Payment & official receipts' },
                                    { value: 'super_admin', label: 'Super Admin', icon: Crown, desc: 'System governance & RBAC' },
                                ].map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setData('role', r.value)}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            data.role === r.value
                                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <r.icon className={`w-5 h-5 mb-1.5 ${data.role === r.value ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div className="font-bold text-xs sm:text-sm text-gray-900">{r.label}</div>
                                        <div className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
                        </div>

                        {/* Basic Profile Info */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Basic Information
                            </h2>

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
                                            placeholder="e.g. Juan Dela Cruz"
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
                                            placeholder="e.g. juan@student.edu.ph"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Contact Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="09123456789"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Student ID Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2024-00101"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-white text-gray-900 font-medium font-mono border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                    />
                                    {errors.student_id && <p className="text-red-600 text-xs mt-1">{errors.student_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Student Specific Fields */}
                        {data.role === 'student' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Academic Information
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
                                                placeholder="e.g. BS Information Technology"
                                                value={data.course_program}
                                                onChange={(e) => setData('course_program', e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                            />
                                        </div>
                                        {errors.course_program && <p className="text-red-600 text-xs mt-1">{errors.course_program}</p>}
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

                        {/* Security Password */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Account Security
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Password (min 8 characters) *
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
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
                                {processing ? 'Creating User...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
