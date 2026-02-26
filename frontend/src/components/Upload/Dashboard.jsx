import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import ResultView from '../Review/ResultView';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const resp = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(resp.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow border border-gray-100 mt-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Workspace</h2>
                <button onClick={() => navigate('/history')} className="text-blue-600 hover:underline">
                    View History
                </button>
            </div>

            {!result ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <UploadCloud className="w-16 h-16 text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Upload Document</h3>
                    <p className="text-sm text-gray-500 mb-6 text-center mt-2 max-w-sm">
                        Drag and drop your Invoice, Medical Bill, or Contract here, or click to select a file.
                    </p>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Select File
                    </label>

                    {file && (
                        <div className="mt-6 flex items-center space-x-3 bg-white px-4 py-2 shadow-sm rounded-lg border">
                            <FileText className="text-gray-400" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="ml-4 px-4 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Process'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <ResultView result={result} onReset={() => setResult(null)} />
            )}
        </div>
    );
}
