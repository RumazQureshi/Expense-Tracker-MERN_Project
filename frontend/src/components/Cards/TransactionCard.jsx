import React from 'react';
import { LuTrendingUp, LuTrendingDown, LuTrash2, LuPencil } from "react-icons/lu";
import { useUserAuth } from '../../hooks/useUserAuth';
import { getCurrencySymbol } from '../../utils/currencyList';

const TransactionCard = ({ title, date, amount, type, className, onDelete, onEdit, icon }) => {
    const { user } = useUserAuth();
    const currencySymbol = user ? getCurrencySymbol(user.currency) : '$';
    const isIncome = type === 'income';

    const AmountDisplay = () => (
        <div className={`flex items-center gap-1 font-semibold px-3 py-1 rounded-full w-fit ${isIncome ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
            <span>{isIncome ? '+' : '-'}{currencySymbol} {Math.abs(amount)}</span>
            {isIncome ? <LuTrendingUp className="text-sm" /> : <LuTrendingDown className="text-sm" />}
        </div>
    );

    const ActionButton = ({ onClick, icon, colorClass }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-all cursor-pointer ${colorClass}`}
        >
            {icon}
        </button>
    );

    return (
        <div className={`group flex items-center justify-between p-4 gap-4 rounded-xl hover:bg-gray-50 transition-colors ${className}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl shrink-0
          ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {icon ? icon : (isIncome ? <LuTrendingUp /> : <LuTrendingDown />)}
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                    <h6 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate block capitalize">{title}</h6>
                    <span className="text-xs text-gray-500">{date}</span>
                    {/* Mobile Amount: Visible only on small screens */}
                    <div className="md:hidden">
                        <AmountDisplay />
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center">
                {/* Mobile Actions: Vertical Stack */}
                <div className="flex flex-col gap-2 md:hidden">
                    {onEdit && <ActionButton onClick={onEdit} icon={<LuPencil className="text-lg" />} colorClass="hover:text-primary" />}
                    {onDelete && <ActionButton onClick={onDelete} icon={<LuTrash2 className="text-lg" />} colorClass="hover:text-red-500" />}
                </div>

                {/* Desktop Actions: Horizontal Row with Hover Effect */}
                <div className="hidden md:flex items-center gap-2">
                    {onEdit && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionButton onClick={onEdit} icon={<LuPencil className="text-lg" />} colorClass="hover:text-primary" />
                        </div>
                    )}
                    {onDelete && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionButton onClick={onDelete} icon={<LuTrash2 className="text-lg" />} colorClass="hover:text-red-500" />
                        </div>
                    )}
                    <AmountDisplay />
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;
