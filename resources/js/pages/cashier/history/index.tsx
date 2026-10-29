import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    History,
    Receipt,
    Calendar,
    Eye,
    X,
    User,
    ArrowUpRight,
    CheckCircle2,
} from 'lucide-react';

type HistoryItem = {
    id: number;
    receipt_number: string;
    reservation_id: number;
    reference_code: string;
    student_name: string;
    student_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
    cashier_name: string;
};

type Props = {
    history: {
        data: HistoryItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
};

function formatPeso(val: number | string) {
    return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CashierHistoryIndex({ history }: Props) {
    const [viewItem, setViewItem] = useState<HistoryItem | null>(null);

    return (
        <>
            <Head title="Payment History — School Cashier" />

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
                                    Davao del Sur State College • Uniform Payment Archive
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Payment History
                            </h1>
                            <p className="text-blue-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
                                Chronological audit trail and historical record of all uniform reservation collections.
                            </p>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Date &amp; Time</th>
                                    <th className="px-5 py-3.5">Receipt Number</th>
                                    <th className="px-5 py-3.5">Reservation ID</th>
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                            <p className="font-semibold text-slate-700">No payment history recorded yet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    history.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(item.payment_date).toLocaleString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                                {item.receipt_number}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-blue-700 font-semibold">
                                                {item.reference_code}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{item.student_name}</div>
                                                <div className="text-xs font-mono text-slate-400">ID: {item.student_id}</div>
                                            </td>
                                            <td className="px-5 py-4 font-black text-emerald-700 text-sm">
                                                {formatPeso(item.amount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    Paid / Receipt Recorded
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewItem(item)}
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
                    {history.links && history.links.length > 3 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="text-slate-500">Total: {history.total} recorded entry(ies)</div>
                            <div className="flex items-center gap-1">
                                {history.links.map((link, idx) => (
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

            {/* Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-200">
                                    Historical Payment Record
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
                                    <span className="font-mono font-black text-slate-900">{viewItem.receipt_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reservation Reference:</span>
                                    <span className="font-mono font-bold text-blue-700">{viewItem.reference_code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Student:</span>
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
                                    <span className="text-slate-500">Method:</span>
                                    <span className="uppercase font-semibold text-slate-700">{viewItem.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Recorded By:</span>
                                    <span className="text-slate-700 font-semibold">{viewItem.cashier_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Status:</span>
                                    <span className="font-bold text-emerald-700 uppercase">{viewItem.status}</span>
                                </div>
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
