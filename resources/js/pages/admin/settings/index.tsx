import { Head, useForm } from '@inertiajs/react';
import { Settings, Save, School, Clock, MapPin, Bell, Shield, Phone, Mail } from 'lucide-react';

type Props = {
    settings: Record<string, string>;
};

export default function AdminSettingsIndex({ settings }: Props) {
    const { data, setData, put, processing } = useForm({
        settings: {
            school_name: settings.school_name || 'Davao del Sur State College (DSSC)',
            system_title: settings.system_title || 'UniReserve Supplies Management',
            reservations_enabled: settings.reservations_enabled ?? 'true',
            max_active_reservations: settings.max_active_reservations || '3',
            operating_hours: settings.operating_hours || '8:00 AM – 5:00 PM (Monday to Friday)',
            counter_location: settings.counter_location || 'Supply Office & Cashier Counter, Admin Building',
            contact_email: settings.contact_email || 'supplies@dssc.edu.ph',
            contact_phone: settings.contact_phone || '(082) 553-2433',
            announcement_banner: settings.announcement_banner || 'Welcome to UniReserve! PE uniforms for the 1st Semester are now available for reservation.',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings');
    };

    return (
        <>
            <Head title="System Settings — UniReserve Admin" />
            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-blue-600" />
                            System Configuration & Preferences
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Control campus-wide reservation limits, operating hours, and student announcements.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Campus Info */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <School className="w-4 h-4 text-blue-600" /> Campus & Institution Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    School Name
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.school_name}
                                    onChange={(e) =>
                                        setData('settings', { ...data.settings, school_name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    System Title
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.system_title}
                                    onChange={(e) =>
                                        setData('settings', { ...data.settings, system_title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Official Contact Email
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        value={data.settings.contact_email}
                                        onChange={(e) =>
                                            setData('settings', { ...data.settings, contact_email: e.target.value })
                                        }
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Contact Phone / Landline
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={data.settings.contact_phone}
                                        onChange={(e) =>
                                            setData('settings', { ...data.settings, contact_phone: e.target.value })
                                        }
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Window & Operations */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" /> Operational Rules & Reservation Controls
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Student Reservations Status
                                </label>
                                <select
                                    value={data.settings.reservations_enabled}
                                    onChange={(e) =>
                                        setData('settings', {
                                            ...data.settings,
                                            reservations_enabled: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                >
                                    <option value="true">Open (Students can make new reservations)</option>
                                    <option value="false">Closed / Paused (Catalog browse only)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Max Active Reservations per Student
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={data.settings.max_active_reservations}
                                    onChange={(e) =>
                                        setData('settings', {
                                            ...data.settings,
                                            max_active_reservations: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Cashier & Releasing Operating Hours
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.operating_hours}
                                    onChange={(e) =>
                                        setData('settings', { ...data.settings, operating_hours: e.target.value })
                                    }
                                    className="w-full px-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Physical Releasing Location / Room
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={data.settings.counter_location}
                                        onChange={(e) =>
                                            setData('settings', { ...data.settings, counter_location: e.target.value })
                                        }
                                        className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Announcement Banner */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-600" /> Student Announcement Bulletin
                        </h2>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Banner Broadcast Message (Visible on Student Dashboard)
                            </label>
                            <textarea
                                rows={3}
                                value={data.settings.announcement_banner}
                                onChange={(e) =>
                                    setData('settings', {
                                        ...data.settings,
                                        announcement_banner: e.target.value,
                                    })
                                }
                                className="w-full p-3 bg-white text-gray-900 font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                    </div>

                    {/* Bottom Save Action */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save All Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
