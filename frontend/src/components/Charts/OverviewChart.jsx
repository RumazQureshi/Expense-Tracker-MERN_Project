import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { useUserAuth } from '../../hooks/useUserAuth';
import { getCurrencySymbol } from '../../utils/currencyList';

const COLORS = ['#875cf5', '#ff4d4d', '#ff8c00']; // Balance (Purple), Expense (Red), Income (Orange)

const CustomTooltip = ({ active, payload, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
                <p className="text-sm text-primary font-bold">
                    {currencySymbol} {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const OverviewChart = ({ data, totalBalance }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';

    const processedData = data.map(item => ({
        ...item,
        value: Math.max(0, item.value)
    }));

    const isDataEmpty = processedData.every(item => item.value === 0);

    if (isDataEmpty) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <p>No data available to display</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={processedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} isAnimationActive={false} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-0.5em" fontSize="14" fill="#6b7280">Total Balance</tspan>
                        <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="bold" fill="#333">{currencySymbol} {totalBalance}</tspan>
                    </text>
                </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap justify-center gap-6 mt-6">
                {data.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm text-gray-600 font-medium">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewChart;
