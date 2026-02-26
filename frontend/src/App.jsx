import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Upload/Dashboard';
import History from './components/History/History';
import { LogOut, Heart, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // Listen for storage changes to handle login/logout across tabs or state
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);
        };
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
                        </div>
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                            SmartDoc AI
                        </h1>
                    </div>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    )}
                </header>

                <main className="flex-1 flex flex-col items-center p-4">
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/history" element={<History />} />
                    </Routes>
                </main>

                {/* Professional Footer */}
                <footer className="bg-white border-t border-gray-100 py-10 mt-12">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                        <div className="text-center md:text-left">
                            <h2 className="text-lg font-black text-gray-800">SmartDoc AI</h2>
                            <p className="text-sm text-gray-400 mt-1">Advanced Document Intelligence & Compliance Audit</p>
                        </div>

                        <div className="flex items-center space-x-8 text-sm font-bold text-gray-400">
                            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Safety</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">API</a>
                        </div>

                        <div className="flex flex-col items-center md:items-end">
                            <div className="flex space-x-4 mb-2">
                                <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Github size={20} /></a>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center">
                                Made with <Heart size={10} className="mx-1 text-red-400 fill-current" /> by SmartDoc AI
                            </p>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
                            &copy; 2026 SmartDoc Intelligence System. All Rights Reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    )
}

export default App
