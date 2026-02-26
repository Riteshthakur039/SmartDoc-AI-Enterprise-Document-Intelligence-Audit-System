import React from 'react';
import {
    FileText,
    Calendar,
    Users,
    CreditCard,
    ShoppingBag,
    Activity,
    ClipboardList,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import LineItemsTable from './LineItemsTable';
import AnomalyList from './AnomalyList';

export default function ResultView({ result, onReset }) {
    const { document_type, extracted_data, anomalies } = result;
    const { entities } = extracted_data;

    const DataCard = ({ title, icon: Icon, children, accent = "blue" }) => {
        const accents = {
            blue: "bg-blue-50 text-blue-600",
            indigo: "bg-indigo-50 text-indigo-600",
            purple: "bg-purple-50 text-purple-600",
            emerald: "bg-emerald-50 text-emerald-600",
            red: "bg-red-50 text-red-600",
            gray: "bg-gray-50 text-gray-600"
        };

        return (
            <div className="glass-card p-6 bg-white overflow-hidden group">
                <div className="flex items-center mb-5">
                    <div className={`p-2 rounded-lg ${accents[accent] || accents.blue} mr-3 group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{title}</h4>
                </div>
                {children}
            </div>
        );
    };

    const InfoRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center text-sm text-gray-500">
                {Icon && <Icon size={14} className="mr-2" />}
                {label}
            </div>
            <div className="text-sm font-semibold text-gray-800">{value || 'N/A'}</div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={onReset}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-2"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back to Upload
                    </button>
                    <h2 className="text-3xl font-black premium-gradient-text tracking-tight">Processing Result</h2>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                    <Activity size={16} className="text-blue-600 pulse-soft" />
                    <span className="text-sm font-bold text-blue-700 uppercase">{document_type}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns - Extracted Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DataCard title="Details" icon={FileText}>
                            <InfoRow label="Invoice #" value={entities.invoice_number} />
                            <InfoRow label="Currency" value={entities.currency} />
                            <InfoRow label="Payment Terms" value={entities.payment_terms} />
                        </DataCard>

                        <DataCard title="Dates" icon={Calendar} accent="indigo">
                            <InfoRow label="Invoice Date" value={entities.dates?.invoice_date} />
                            <InfoRow label="Due Date" value={entities.dates?.due_date} />
                            <InfoRow label="Service Date" value={entities.dates?.service_date} />
                        </DataCard>
                    </div>

                    {/* Parties */}
                    <DataCard title="Parties Involved" icon={Users} accent="purple">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {entities.parties?.map((party, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">{party.type}</p>
                                    <p className="text-sm font-bold text-gray-700">{party.name}</p>
                                </div>
                            ))}
                            {(!entities.parties || entities.parties.length === 0) && (
                                <p className="text-sm text-gray-400 italic">No parties identified</p>
                            )}
                        </div>
                    </DataCard>

                    {/* Line Items */}
                    <DataCard title="Line Items" icon={ShoppingBag} accent="emerald">
                        <LineItemsTable items={entities.line_items} />
                        <div className="mt-6 flex flex-col items-end pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-8">
                                <span className="text-sm text-gray-500 font-medium">Tax Amount</span>
                                <span className="text-lg font-bold text-gray-700 font-mono">{entities.tax_amount || '0.00'}</span>
                            </div>
                            <div className="flex items-center space-x-8 mt-2">
                                <span className="text-base text-gray-800 font-black">Total Amount</span>
                                <span className="text-2xl font-black premium-gradient-text font-mono underline decoration-blue-200 decoration-4">
                                    {entities.currency} {entities.total_amount}
                                </span>
                            </div>
                        </div>
                    </DataCard>
                </div>

                {/* Right Column - Anomalies & RAG */}
                <div className="space-y-8">
                    <DataCard title="Anomalies" icon={AlertCircle} accent="red">
                        <AnomalyList anomalies={anomalies} />
                    </DataCard>

                    <DataCard title="Rules Context" icon={ClipboardList} accent="gray">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 max-h-64 overflow-y-auto">
                            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap italic">
                                "{extracted_data._rag_context || 'No specific rules matched this context.'}"
                            </p>
                        </div>
                        <p className="mt-3 text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center">
                            Powered by SmartDoc AI
                        </p>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
