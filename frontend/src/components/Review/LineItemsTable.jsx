import React from 'react';

export default function LineItemsTable({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity || '-'}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 font-mono">{item.unit_price || '-'}</td>
                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold font-mono">{item.amount || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
