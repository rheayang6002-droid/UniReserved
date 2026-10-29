import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileCheck,
    Search,
    Receipt,
    Eye,
    X,
    User,
    Calendar,
    Printer,
} from 'lucide-react';

type ReceiptItem = {
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
    items_count: number;
};

type Props = {
    receipts: {
        data: ReceiptItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: {
        search?: string;
    };
    total_receipts: number;
};

function formatPeso(val: number | string) {
    return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CashierReceiptsIndex({
    receipts,
    filters,
    total_receipts,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [viewItem, setViewItem] = useState<ReceiptItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/cashier/receipts',
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Receipt Records — School Cashier" />

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
                                    Davao del Sur State College • Official Receipt Registry
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Receipt Records
                            </h1>
                            <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
                                Official registry of all serialized receipts issued for school uniform reservations.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-right">
                            <div className="text-[10px] uppercase font-bold text-blue-200">Total Receipts</div>
                            <div className="text-xl font-black text-white">{total_receipts}</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search OR Number, Student, or Reservation..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#173B8F]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#173B8F] hover:bg-[#243F96] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Receipts Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Official Receipt Number</th>
                                    <th className="px-5 py-3.5">Reservation ID</th>
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Payment Date</th>
                                    <th className="px-5 py-3.5">Cashier</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {receipts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                                            <FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                            <p className="font-semibold text-slate-700">No receipts found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    receipts.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 font-mono font-black text-slate-900">
                                                {r.receipt_number}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-blue-700 font-bold">
                                                {r.reference_code}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{r.student_name}</div>
                                                <div className="text-xs font-mono text-slate-400">ID: {r.student_id}</div>
                                            </td>
                                            <td className="px-5 py-4 font-black text-emerald-700 text-sm">
                                                {formatPeso(r.amount)}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {new Date(r.payment_date).toLocaleDateString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-700 font-medium">
                                                {r.cashier_name}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    Issued &amp; Logged
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewItem(r)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Details</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {receipts.links && receipts.links.length > 3 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="text-slate-500">Total: {receipts.total} receipt record(s)</div>
                            <div className="flex items-center gap-1">
                                {receipts.links.map((link, idx) => (
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

            {/* View Receipt Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200">
                                    Official School Receipt
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
                                    <span className="text-slate-500">Receipt Number:</span>
                                    <span className="font-mono font-black text-slate-900">{viewItem.receipt_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reservation Reference:</span>
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
                                    <span className="text-slate-500">Payment Date:</span>
                                    <span className="text-slate-700">{new Date(viewItem.payment_date).toLocaleString('en-PH')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Issued Cashier:</span>
                                    <span className="text-slate-700 font-semibold">{viewItem.cashier_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status:</span>
                                    <span className="font-bold text-emerald-700 uppercase">Paid / Receipt Recorded</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
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
