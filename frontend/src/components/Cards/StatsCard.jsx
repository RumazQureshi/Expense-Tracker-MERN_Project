import React from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { getCurrencySymbol } from '../../utils/currencyList';

const StatsCard = ({ icon, label, value, color, className }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';
    return (
        <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 ${className}`}>
            <div className={`w-14 h-14 flex items-center justify-center rounded-full text-2xl text-white ${color}`}>
                {icon}
            </div>
            <div>
                <h6 className="text-gray-500 text-sm font-medium mb-1">{label}</h6>
                <span className="text-2xl font-bold text-gray-900">{currencySymbol} {value}</span>
            </div>
        </div>
    );
};

export default StatsCard;
