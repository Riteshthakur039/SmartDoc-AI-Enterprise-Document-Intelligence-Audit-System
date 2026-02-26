import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Database,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    User,
    DollarSign,
    Tag
} from 'lucide-react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import LineItemsTable from '../Review/LineItemsTable';
import AnomalyList from '../Review/AnomalyList';

const ExpandableHistoryItem = ({ doc }) => {
    const [expanded, setExpanded] = useState(false);
    const { entities } = doc.extracted_data;

    return (
        <div className={`glass-card overflow-hidden transition-all duration-300 ${expanded ? 'ring-2 ring-blue-400 shadow-2xl' : 'hover:shadow-lg'}`}>
            <div
                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer bg-white"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{doc.filename}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
                            <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(doc.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{doc.document_type}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center mt-4 md:mt-0 space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                        <p className="text-xl font-black premium-gradient-text">
                            {entities.currency || '$'} {entities.total_amount || '0.00'}
                        </p>
                    </div>

                    <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center mb-4 space-x-2">
                                <Database size={18} className="text-gray-400" />
                                <h4 className="font-bold text-gray-700">Quick Summary</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <SummaryBadge icon={User} label="Vendor" value={entities.parties?.find(p => p.type === 'Vendor')?.name} />
                                <SummaryBadge icon={Tag} label="Inv #" value={entities.invoice_number} />
                                <SummaryBadge icon={Calendar} label="Date" value={entities.dates?.invoice_date} />
                                <SummaryBadge icon={DollarSign} label="Tax" value={entities.tax_amount} />
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center mb-4 space-x-2">
                                    <Tag size={18} className="text-gray-400" />
                                    <h4 className="font-bold text-gray-700">Line Items</h4>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <LineItemsTable items={entities.line_items} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center mb-4 space-x-2">
                                <AlertCircle size={18} className="text-red-400" />
                                <h4 className="font-bold text-gray-700">Audit Status</h4>
                            </div>
                            <AnomalyList anomalies={doc.anomalies} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryBadge = ({ icon: Icon, label, value }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
            <Icon size={10} className="mr-1" /> {label}
        </div>
        <p className="text-sm font-semibold text-gray-700 truncate">{value || 'N/A'}</p>
    </div>
);

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const resp = await api.get('/documents/history');
                setHistory(resp.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                }
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [navigate]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 mt-4">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mr-5 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 hover:shadow-md transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Audit History</h2>
                        <p className="text-gray-500 mt-1 font-medium">Review all previously processed and verified documents</p>
                    </div>
                </div>
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Live System
                    </span>
                    <span className="text-2xl font-black text-gray-800 mt-1">{history.length} Files</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Retrieving audit data...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="text-center p-20 glass-card">
                    <Database className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-800">No History Found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">Upload your first document to start building your compliance audit trail.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        Process Document
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {history.map((doc) => (
                        <ExpandableHistoryItem key={doc.id} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
}
