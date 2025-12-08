import React, { useState, useEffect } from 'react';
import { LuX, LuUpload } from "react-icons/lu";
import EmojiPicker from 'emoji-picker-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const AddTransactionModal = ({ isOpen, onClose, type, onAdd, initialData }) => {
    const [amount, setAmount] = useState("");
    const [source, setSource] = useState("");
    const [date, setDate] = useState("");
    const [icon, setIcon] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setAmount(initialData.amount);
                setSource(initialData.source || initialData.category); // Handle both income (source) and expense (category)
                setDate(moment(initialData.date).format("YYYY-MM-DD"));
                setIcon(initialData.icon);
            } else {
                setAmount("");
                setSource("");
                setDate("");
                setIcon("");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!amount || !source || !date) {
            toast.error("Please fill all required fields");
            return;
        }

        if (Number(amount) <= 0) {
            toast.error("Amount must be a positive number");
            return;
        }

        onAdd({ amount, source, date, icon, type, id: initialData?._id });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h5 className="text-xl font-bold text-gray-900">{initialData ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}</h5>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <LuX className="text-2xl cursor-pointer" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">

                    {/* Icon Picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="flex items-center gap-3 w-full p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-orange-50 text-2xl rounded-full">
                                {icon || <LuUpload className="text-primary text-lg" />}
                            </div>
                            <span className="text-gray-600 font-medium">
                                {icon ? "Change Icon" : "Pick Icon"}
                            </span>
                        </button>

                        {showEmojiPicker && (
                            <div className="absolute top-full left-0 mt-2 z-10">
                                <EmojiPicker onEmojiClick={(e) => {
                                    setIcon(e.emoji);
                                    setShowEmojiPicker(false);
                                }} />
                            </div>
                        )}
                    </div>

                    {/* Source/Category Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            {type === 'income' ? 'Income Source' : 'Expense Category'}
                        </label>
                        <input
                            type="text"
                            placeholder={type === 'income' ? "Freelance, Salary, etc." : "Shopping, Travel, etc."}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="input-box"
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="natural"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-box"
                        />
                    </div>

                    {/* Date Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-box cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="btn-primary mt-4 cursor-pointer"
                    >
                        {initialData ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;
