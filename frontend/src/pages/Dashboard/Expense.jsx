import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import ExpenseGraph from '../../components/Charts/ExpenseGraph';
import TransactionCard from '../../components/Cards/TransactionCard';
import AddTransactionModal from '../../components/Modals/AddTransactionModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import { LuPlus, LuDownload } from "react-icons/lu";
import moment from 'moment';
import toast from 'react-hot-toast';

const Expense = () => {
  useUserAuth();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ show: false, data: null });
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenseData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`);
      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const handleAddExpense = async (data) => {
    try {
      const { source, ...rest } = data;
      if (data.id) {
        await axiosInstance.put(API_PATHS.EXPENSE.UPDATE_EXPENSE(data.id), { ...rest, category: source });
        toast.success("Expense updated successfully");
      } else {
        await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, { ...rest, category: source });
        toast.success("Expense added successfully");
      }
      fetchExpenseData();
      setOpenAddModal(false);
      setSelectedExpense(null);
    } catch {
      toast.error(data.id ? "Failed to update expense" : "Failed to add expense");
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(openDeleteModal.data._id));
      toast.success("Expense deleted successfully");
      setOpenDeleteModal({ show: false, data: null });
      fetchExpenseData();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const handleDownloadExpense = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Expense_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download report");
    }
  };

  // Prepare chart data
  const chartData = expenseData.map(item => ({
    label: moment(item.date).format('DD MMM'),
    amount: item.amount,
    date: item.date,
    category: item.category
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Expense Overview</h2>
          <button
            onClick={() => setOpenAddModal(true)}
            className="btn-primary w-auto px-6 flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="text-lg" /> Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ExpenseGraph data={chartData} />

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-lg font-semibold text-gray-900">All Expenses</h5>
              <button
                onClick={handleDownloadExpense}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary border border-gray-200 hover:border-primary px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <LuDownload className="text-lg" /> Download
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseData.map((item) => (
                <TransactionCard
                  key={item._id}
                  title={item.category}
                  date={moment(item.date).format('Do MMM YYYY')}
                  amount={item.amount}
                  type="expense"
                  category={item.category}
                  icon={item.icon}
                  onDelete={() => setOpenDeleteModal({ show: true, data: item })}
                  onEdit={() => {
                    setSelectedExpense(item);
                    setOpenAddModal(true);
                  }}
                />
              ))}
              {expenseData.length === 0 && <p className="text-gray-500">No expense records found.</p>}
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedExpense(null);
        }}
        type="expense"
        onAdd={handleAddExpense}
        initialData={selectedExpense}
      />

      <DeleteConfirmModal
        isOpen={openDeleteModal.show}
        onClose={() => setOpenDeleteModal({ show: false, data: null })}
        onDelete={handleDeleteExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
      />
    </DashboardLayout>
  );
};

export default Expense;