import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const ExpenseGraph = ({ data }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';

    return (
        <div className="w-full h-96 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900">Expense Overview</h5>
                <p className="text-xs text-gray-400 mt-1">Track your spending over time and analyze your expense trends.</p>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#875cf5" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#875cf5" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
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
                    <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} cursor={{ stroke: '#875cf5', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#875cf5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        dot={{ stroke: '#875cf5', strokeWidth: 2, r: 4, fill: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={3000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseGraph;