import React from 'react';
import { LuX } from "react-icons/lu";

const DeleteConfirmModal = ({ isOpen, onClose, onDelete, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold text-gray-900">{title || "Confirm Delete"}</h5>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                        <LuX className="text-2xl" />
                    </button>
                </div>

                <p className="text-gray-600 mb-8">
                    {message || "Are you sure you want to delete this item? This action cannot be undone."}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors cursor-pointer border border-gray-200 "
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
