import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import TransactionCard from '../../components/Cards/TransactionCard';
import moment from 'moment';
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
    useUserAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_ALL_TRANSACTIONS);
            if (response.data) {
                setTransactions(response.data);
            }
        } catch (error) {
            console.log("Something went wrong", error);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="my-5 mx-auto w-full">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <LuArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">All Transactions</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col gap-4">
                        {transactions.length > 0 ? (
                            transactions.map((txn) => (
                                <TransactionCard
                                    key={txn._id}
                                    title={txn.source || txn.category}
                                    date={moment(txn.date).format('Do MMM YYYY')}
                                    amount={txn.amount}
                                    type={txn.type}
                                    category={txn.category}
                                    icon={txn.icon}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No transactions found</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
