import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { useUserAuth } from '../../hooks/useUserAuth';
import { getCurrencySymbol } from '../../utils/currencyList';

const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg min-w-[150px]">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-primary font-bold">
                    {currencySymbol} {payload[0].value}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                    {payload[0].payload.source}
                </p>
            </div>
        );
    }
    return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="middle"
                fill="#6b7280"
                className="text-[10px] sm:text-xs font-medium"
            >
                {payload.value}
            </text>
        </g>
    );
};

const IncomeChart = ({ data }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';
    const [activeIndex, setActiveIndex] = useState(null);

    const onBarClick = (data, index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="w-full h-[400px] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900">Income Overview</h5>
                <p className="text-xs text-gray-400 mt-1">Click on a bar to see details.</p>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={<CustomXAxisTick />}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} cursor={{ fill: 'transparent' }} isAnimationActive={false} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} onClick={onBarClick} animationDuration={1000}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={activeIndex === null ? (index % 2 === 0 ? '#875cf5' : '#cfcfcf') : (activeIndex === index ? '#875cf5' : '#e5e7eb')}
                                className="cursor-pointer"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default IncomeChart;
