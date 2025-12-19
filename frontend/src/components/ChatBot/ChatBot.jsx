import React, { useState, useRef, useEffect } from 'react';
import { LuMessageSquare, LuX, LuSend, LuBot } from "react-icons/lu";
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', text: 'Hi! I am your financial assistant. You can ask me about your "balance", "income", "expenses", or "recent transactions".' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestions = ['Check Balance', 'Total Income', 'Total Expenses', 'Recent Transactions', 'Highest Expense', 'Transaction Count'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.CHAT);
                const history = response.data.map(msg => ({
                    role: msg.role,
                    text: msg.message
                }));
                if (history.length > 0) {
                    setMessages([
                        { role: 'system', text: 'Hi! I am your financial assistant. You can ask me about your "balance", "income", "expenses", or "recent transactions".' },
                        ...history
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };

        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.CHAT, { message: userMessage.text }, { timeout: 30000 });
            const botMessage = { role: 'system', text: response.data.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'system',
                text: error.response?.data?.message || error.message || 'Sorry, I encountered an error. Please try again later.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-10 md:right-10 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-96 sm:max-w-[calc(100vw-5rem)] mb-4 border border-gray-100 overflow-hidden flex flex-col h-[60vh] sm:h-[500px] sm:max-h-[80vh] transition-all duration-300 ease-in-out">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <LuBot className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Financial Assistant</h3>
                                <p className="text-xs text-white/80">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                        >
                            <LuX className="text-xl cursor-pointer" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSend(suggestion)}
                                className="whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm cursor-pointer"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your finances..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <LuSend className="text-lg cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group cursor-pointer"
                >
                    <LuMessageSquare className="text-2xl group-hover:rotate-12 transition-transform" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
