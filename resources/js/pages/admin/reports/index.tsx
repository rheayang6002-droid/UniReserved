import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Download,
    DollarSign,
    ClipboardCheck,
    Users,
    XCircle,
    TrendingUp,
    FileSpreadsheet,
} from 'lucide-react';

type Props = {
    stats: {
        total_reservations: number;
        total_claimed: number;
        total_revenue: number;
        new_students: number;
        cancelled: number;
    };
    period: 'week' | 'month' | 'year';
};

export default function AdminReportsIndex({ stats, period }: Props) {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/admin/reports', { period: newPeriod }, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
        window.location.href = `/admin/reports/export?${params.toString()}`;
    };

    const fulfillmentRate =
        stats.total_reservations > 0
            ? Math.round((stats.total_claimed / stats.total_reservations) * 100)
            : 0;

    const cancellationRate =
        stats.total_reservations > 0
            ? Math.round((stats.cancelled / stats.total_reservations) * 100)
            : 0;

    return (
        <>
            <Head title="Reports & Analytics — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            Reports & Reservation Analytics
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Monitor campus supplies demand, fulfillment efficiency, revenue, and export logs.
                        </p>
                    </div>

                    {/* Period Selector Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {[
                            { label: 'This Week', value: 'week' },
                            { label: 'This Month', value: 'month' },
                            { label: 'This Year', value: 'year' },
                        ].map((p) => (
                            <button
                                key={p.value}
                                onClick={() => handlePeriodChange(p.value)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    period === p.value
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Total Reservations
                            </span>
                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.total_reservations}</div>
                        <div className="text-xs text-gray-500 mt-1">Orders submitted in this period</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Total Revenue
                            </span>
                            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-gray-900 font-mono">
                            ₱{Number(stats.total_revenue).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">From verified cashier payments</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Claimed Orders
                            </span>
                            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.total_claimed}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {fulfillmentRate}% fulfillment rate
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                New Student Signups
                            </span>
                            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{stats.new_students}</div>
                        <div className="text-xs text-gray-500 mt-1">Active student accounts</div>
                    </div>
                </div>

                {/* Efficiency Overview & Export CSV section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Progress */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <h2 className="font-bold text-gray-900 text-base">Fulfillment & Operations Metrics</h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                                    <span className="text-gray-700">Orders Successfully Claimed</span>
                                    <span className="text-emerald-600">{fulfillmentRate}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, fulfillmentRate)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5">
                                    <span className="text-gray-700">Cancelled / Rejected Orders</span>
                                    <span className="text-red-600">{cancellationRate}% ({stats.cancelled} orders)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, cancellationRate)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                            <div className="font-bold">Summary Insights</div>
                            <p className="text-blue-800/80">
                                During this {period}, your office handled {stats.total_reservations} reservations and delivered {stats.total_claimed} complete uniform packages to students.
                            </p>
                        </div>
                    </div>

                    {/* Export Data Panel */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-base">Export Reservation Reports</h2>
                                <p className="text-xs text-gray-400">Download CSV spreadsheet for accounting or school records</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white text-gray-900 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white text-gray-900 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV Spreadsheet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
