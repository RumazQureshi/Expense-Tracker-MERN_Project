import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuShieldAlert } from "react-icons/lu";

const SecurityAlertModal = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in-up">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <LuShieldAlert className="text-3xl text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Your Account</h3>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                        To ensure you can recover your account if you forget your password, please set up a security key in Settings.
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="btn-primary w-full py-2.5 rounded-lg cursor-pointer"
                        >
                            Go to Settings
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-transparent text-gray-500 text-sm hover:text-gray-700 font-medium py-2 cursor-pointer"
                        >
                            Remind Me Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityAlertModal;
