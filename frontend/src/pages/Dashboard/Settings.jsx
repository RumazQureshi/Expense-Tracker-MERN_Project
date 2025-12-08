import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { UserContext } from '../../context/UserContext';

import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import CurrencySelector from '../../components/Inputs/CurrencySelector';
import { LuUpload, LuTrash } from "react-icons/lu";
import { getProfileImageUrl } from "../../utils/helper";
import CharAvatar from '../../components/Cards/CharAvatar';

const Settings = () => {
    const { user, updateUser, showChatBot, updateChatBotSettings } = useContext(UserContext);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        profileImageUrl: '',
        currency: 'USD',
        securityQuestion: '',
        securityAnswer: '',
    });
    const [isChatBotEnabled, setIsChatBotEnabled] = useState(showChatBot);
    const [imgError, setImgError] = useState(false);
    const [isCustomQuestion, setIsCustomQuestion] = useState(false);
    const fileRef = React.useRef(null);

    const PREDEFINED_QUESTIONS = [
        "What is your friend name?",
        "What was the name of your first pet?",
        "What is your favorite city?",
        "Other"
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                profileImageUrl: user.profileImageUrl || '',
                currency: user.currency || 'USD',
                securityQuestion: user.securityQuestion || '',
                securityAnswer: '',
            });
            setIsChatBotEnabled(showChatBot);

            // Check if current question is predefined
            const currentQ = user.securityQuestion;
            if (currentQ && !PREDEFINED_QUESTIONS.includes(currentQ) && currentQ !== "Other") {
                setIsCustomQuestion(true);
            } else if (currentQ === "Other") { // unlikely to save "Other" literally but for safety
                setIsCustomQuestion(true);
            } else {
                setIsCustomQuestion(false);
            }
        }
    }, [user, showChatBot]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setIsCustomQuestion(true);
            setFormData(prev => ({ ...prev, securityQuestion: "" }));
        } else {
            setIsCustomQuestion(false);
            setFormData(prev => ({ ...prev, securityQuestion: value }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("image", file);

        try {
            const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, uploadData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data && response.data.imageUrl) {
                setFormData((prev) => ({ ...prev, profileImageUrl: response.data.imageUrl }));
                toast.success("Image uploaded successfully");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        }
    };

    const handleImageDelete = () => {
        setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
        setImgError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const promise = axiosInstance.put(API_PATHS.AUTH.UPDATE_USER, formData);

        try {
            const response = await toast.promise(promise, {
                loading: "Saving changes...",
                success: "Profile updated successfully",
                error: "Failed to update profile",
            });
            updateUser(response.data.user);
            updateChatBotSettings(isChatBotEnabled);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <DashboardLayout activeMenu="Settings">
            <div className="my-5 mx-auto w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h5>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative mb-3 group flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-50 relative flex items-center justify-center">
                                    {!imgError && formData.profileImageUrl ? (
                                        <img
                                            src={getProfileImageUrl(formData.profileImageUrl)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <CharAvatar
                                            fullName={formData.fullName}
                                            width="w-full"
                                            height="h-full"
                                            style="text-4xl"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                                        <LuUpload className="text-white text-xl" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileRef}
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                </div>
                                {formData.profileImageUrl && !imgError ? (
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 bg-red-500 text-white p-1.5 rounded-full z-30 hover:bg-red-600 transition-colors shadow-md border-2 border-white translate-x-1 translate-y-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleImageDelete();
                                        }}
                                        title="Remove profile picture"
                                    >
                                        <LuTrash className="text-sm" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full z-30 hover:bg-primary/90 transition-colors shadow-md border-2 border-white translate-x-1 translate-y-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            fileRef.current.click();
                                        }}
                                        title="Upload profile picture"
                                    >
                                        <LuUpload className="text-sm" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">Click to upload new picture</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
                            <select
                                value={isCustomQuestion ? "Other" : formData.securityQuestion}
                                onChange={handleQuestionChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary mb-2"
                            >
                                <option value="" disabled>Select a question</option>
                                {PREDEFINED_QUESTIONS.map((q, idx) => (
                                    <option key={idx} value={q}>{q}</option>
                                ))}
                            </select>

                            {isCustomQuestion && (
                                <input
                                    type="text"
                                    name="securityQuestion"
                                    value={formData.securityQuestion}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Type your own question"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Security Answer</label>
                            <input
                                type="text"
                                name="securityAnswer"
                                value={formData.securityAnswer}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Enter your answer"
                            />
                        </div>

                        <div>
                            <CurrencySelector
                                value={formData.currency}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <h6 className="text-sm font-medium text-gray-900">Enable Chatbot</h6>
                                <p className="text-xs text-gray-500">Show the financial assistant on dashboard</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isChatBotEnabled}
                                    onChange={(e) => setIsChatBotEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="btn-primary w-full md:w-auto px-6 py-2.5 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">Made with <span className="text-red-500">❤</span> by Rumaz Qureshi</p>
            </div>


        </DashboardLayout >
    );
};

export default Settings;
