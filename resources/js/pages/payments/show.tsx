import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, CheckCircle2, Receipt, Building2, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

type PaymentItem = {
    id: number;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
    product?: {
        name: string;
        gender: string;
    };
};

type Payment = {
    id: number;
    reservation_id: number;
    amount: string | number;
    payment_method: string;
    reference_number: string | null;
    receipt_number: string;
    payment_date: string;
    notes: string | null;
    reservation?: {
        id: number;
        reference_code: string;
        reservation_status: string;
        payment_status: string;
        total_amount: string | number;
        queue_number: number;
        items?: PaymentItem[];
    };
};

const METHOD_LABELS: Record<string, string> = {
    cash: 'Cash Payment at Cashier Counter',
    gcash: 'GCash Online Payment',
    bank_transfer: 'Bank Transfer / Deposit',
};

export default function StudentPaymentShow({ payment }: { payment: Payment }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Receipt #${payment.receipt_number} — UniReserve`} />
            <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
                {/* Actions Top Bar (hidden on print) */}
                <div className="flex items-center justify-between gap-4 print:hidden">
                    <Link
                        href="/payments"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Payments
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                        <Printer className="w-4 h-4" /> Print Official Slip
                    </button>
                </div>

                {/* Printable Official Receipt Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 relative overflow-hidden print:shadow-none print:border-none print:p-0">
                    {/* Top Watermark / Status Header */}
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0 border border-blue-100">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-gray-900 leading-tight">UniReserve</div>
                                    <div className="text-xs text-gray-500">Official School Supplies & Uniform Reservation Slip</div>
                                </div>
                            </div>

                            <div className="text-left sm:text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Official Receipt
                                </span>
                                <div className="text-xs text-gray-400 mt-1 font-mono">
                                    #{payment.receipt_number}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6 text-xs sm:text-sm">
                        <div>
                            <span className="text-gray-400 block text-xs">Payment Date</span>
                            <span className="font-medium text-gray-800">
                                {new Date(payment.payment_date).toLocaleDateString('en-PH', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-xs">Payment Method</span>
                            <span className="font-medium text-gray-800">
                                {METHOD_LABELS[payment.payment_method] || payment.payment_method}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-xs">Reservation Ref</span>
                            <span className="font-bold text-blue-600 font-mono">
                                {payment.reservation?.reference_code || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-xs">Queue Number</span>
                            <span className="font-bold text-gray-800">
                                #{payment.reservation?.queue_number || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Itemized Order Breakdown */}
                    <div className="space-y-3 mb-6">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Order Items Covered
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-100">
                                    <tr>
                                        <th className="py-2.5 px-4 font-semibold">Item Description</th>
                                        <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                                        <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(payment.reservation?.items || []).map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="py-2.5 px-4 font-medium text-gray-800">
                                                {item.product?.name || 'Supply Item'}
                                                {item.product?.gender && item.product.gender !== 'unisex' && (
                                                    <span className="ml-1.5 text-xs text-gray-400 capitalize">
                                                        ({item.product.gender})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-4 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-2.5 px-4 text-right text-gray-600">
                                                ₱{Number(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                                                ₱{Number(item.subtotal).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-blue-50/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-xs text-blue-900/80 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                Verified Payment Transaction
                            </div>
                            {payment.reference_number && (
                                <div>Reference Code: <span className="font-mono">{payment.reference_number}</span></div>
                            )}
                            {payment.notes && <div>Notes: {payment.notes}</div>}
                        </div>

                        <div className="text-right w-full sm:w-auto">
                            <span className="text-xs text-gray-500 uppercase tracking-wide block">Amount Paid</span>
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
                                ₱{Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Footer instructions */}
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200 text-center text-xs text-gray-400">
                        <p>Present this official slip or your reservation QR code at the releasing counter when claiming your items.</p>
                        <p className="mt-1">UniReserve Supply Management · Keep this receipt for your records.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
