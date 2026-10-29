import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Receipt,
    Search,
    Calendar,
    Filter,
    CreditCard,
    Eye,
    X,
    FileCheck,
    ArrowLeft,
    TrendingUp,
} from 'lucide-react';

type Transaction = {
    id: number;
    receipt_number: string;
    reservation_id: number;
    reference_code: string;
    student_name: string;
    student_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    cashier_name: string;
    status: string;
    reservation_status: string;
    notes: string | null;
};

type Props = {
    transactions: {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
        date?: string;
        method?: string;
    };
    total_amount: number;
    today_amount: number;
};

function formatPeso(val: number | string) {
    return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CashierTransactionsIndex({
    transactions,
    filters,
    total_amount,
    today_amount,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [method, setMethod] = useState(filters.method || '');
    const [viewItem, setViewItem] = useState<Transaction | null>(null);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/cashier/transactions',
            {
                search: search || undefined,
                date: date || undefined,
                method: method || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setDate('');
        setMethod('');
        router.get('/cashier/transactions');
    };

    return (
        <>
            <Head title="Payment Transactions — School Cashier" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[#173B8F] via-[#243F96] to-[#8B1028] p-6 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 bg-white/15 text-white text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/20">
                                    School Cashier Desk
                                </span>
                                <span className="text-blue-100 text-xs font-medium">
                                    Davao del Sur State College • Uniform Collections
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Payment Transactions
                            </h1>
                            <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
                                Complete ledger of payments collected, Official Receipts issued, and student uniform accounts reconciled.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-right">
                                <div className="text-[10px] uppercase font-bold text-blue-200">Today's Total</div>
                                <div className="text-lg font-black text-white">{formatPeso(today_amount)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="OR#, Ref Code, Student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F]"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F]"
                            />
                        </div>

                        <div>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F] cursor-pointer"
                            >
                                <option value="">All Payment Methods</option>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#173B8F] hover:bg-[#243F96] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Apply Filters
                            </button>
                            {(search || date || method) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Receipt No.</th>
                                    <th className="px-5 py-3.5">Reservation ID</th>
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Payment Date</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                            <p className="font-semibold text-slate-700">No transactions recorded yet</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Payments will appear here immediately after being recorded.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                                {t.receipt_number}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-blue-700 font-semibold">
                                                {t.reference_code}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{t.student_name}</div>
                                                <div className="text-xs font-mono text-slate-400">ID: {t.student_id}</div>
                                            </td>
                                            <td className="px-5 py-4 font-black text-emerald-700 text-sm">
                                                {formatPeso(t.amount)}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {new Date(t.payment_date).toLocaleDateString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    Paid / Recorded
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewItem(t)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="text-slate-500">Total: {transactions.total} transaction(s)</div>
                            <div className="flex items-center gap-1">
                                {transactions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-2.5 py-1 rounded-lg ${
                                            link.active
                                                ? 'bg-[#173B8F] text-white font-bold'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Transaction Details Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200">
                                    Official Transaction Record
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">
                                    {viewItem.receipt_number}
                                </h3>
                            </div>
                            <button
                                onClick={() => setViewItem(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Official Receipt:</span>
                                    <span className="font-mono font-bold text-slate-900">{viewItem.receipt_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reservation Ref:</span>
                                    <span className="font-mono font-bold text-blue-700">{viewItem.reference_code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Student Name:</span>
                                    <span className="font-bold text-slate-900">{viewItem.student_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Student ID:</span>
                                    <span className="font-mono text-slate-700">{viewItem.student_id || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Amount Paid:</span>
                                    <span className="font-black text-emerald-700 text-sm">{formatPeso(viewItem.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Method:</span>
                                    <span className="uppercase font-semibold text-slate-700">{viewItem.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Date:</span>
                                    <span className="text-slate-700">
                                        {new Date(viewItem.payment_date).toLocaleString('en-PH')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Issued By:</span>
                                    <span className="text-slate-700 font-medium">{viewItem.cashier_name}</span>
                                </div>
                                {viewItem.notes && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <span className="text-slate-500 block mb-0.5">Remarks / Notes:</span>
                                        <p className="text-slate-700 italic">{viewItem.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-900 text-xs">
                                <strong>Next Step in Workflow:</strong> The student presents this Official Receipt to the Business Enterprise Office (BEO). BEO Staff verifies payment and proceeds to uniform release.
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setViewItem(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
