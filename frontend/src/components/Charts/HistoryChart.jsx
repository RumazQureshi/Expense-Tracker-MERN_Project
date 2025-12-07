import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { useUserAuth } from '../../hooks/useUserAuth';
import { getCurrencySymbol } from '../../utils/currencyList';

const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-primary font-bold">
                    {currencySymbol} {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const HistoryChart = ({ data, type = 'income' }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';
    const color = type === 'income' ? '#875cf5' : '#cfcfcf';

    return (
        <div className="w-full h-72 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h5 className="text-lg font-semibold text-gray-900 mb-6">
                {type === 'income' ? 'Income Overview' : 'Expense Overview'}
            </h5>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} cursor={{ fill: 'transparent' }} isAnimationActive={false} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1000}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HistoryChart;
