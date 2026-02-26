import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col items-center">
                <div className="p-3 bg-green-100 rounded-full text-green-600 mb-4">
                    <UserPlus size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 mt-2">Sign up for Smart Auth</p>
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                    Register
                </button>
            </form>
            <p className="text-center text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-green-600 hover:underline">Log in</Link>
            </p>
        </div>
    );
}
