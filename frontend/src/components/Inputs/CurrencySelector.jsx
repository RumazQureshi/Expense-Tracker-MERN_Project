import React, { useState, useEffect, useRef } from 'react';
import { CURRENCIES } from '../../utils/currencyList';
import { LuChevronDown, LuSearch, LuCheck } from "react-icons/lu";

const CurrencySelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCurrency = CURRENCIES.find(c => c.code === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (currencyCode) => {
        onChange({ target: { name: 'currency', value: currencyCode } });
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1 ">Currency</label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-between bg-white focus:outline-none focus:border-primary cursor-pointer"
            >
                <span className="flex items-center gap-2 ">
                    {selectedCurrency ? (
                        <>
                            <span className="font-medium text-gray-900">{selectedCurrency.code}</span>
                            <span className="text-gray-500">({selectedCurrency.symbol})</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Select Currency</span>
                    )}
                </span>
                <LuChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
                                placeholder="Search currency..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map((currency) => (
                                <button
                                    key={currency.code}
                                    type="button"
                                    onClick={() => handleSelect(currency.code)}
                                    className={`w-full px-4 py-2 text-left flex items-center cursor-pointer justify-between hover:bg-gray-50 ${value === currency.code ? 'bg-purple-50 text-primary' : 'text-gray-700'}`}
                                >
                                    <div className="flex flex-col w-full hover:text-primary">
                                        <span className="font-medium text-sm">{currency.name}</span>
                                        <span className="text-xs text-gray-500">{currency.code} - {currency.symbol}</span>
                                    </div>
                                    {value === currency.code && <LuCheck className="text-primary" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No currency found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
