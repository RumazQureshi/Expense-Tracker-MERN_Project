
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import IncomeChart from '../../components/Charts/IncomeChart';
import TransactionCard from '../../components/Cards/TransactionCard';
import AddTransactionModal from '../../components/Modals/AddTransactionModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import { LuPlus, LuDownload } from "react-icons/lu";
import moment from 'moment';
import toast from 'react-hot-toast';

const Income = () => {
  useUserAuth();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ show: false, data: null });

  const fetchIncomeData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
      if (response.data) {
        setIncomeData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomeData();
  }, []);
  const [selectedIncome, setSelectedIncome] = useState(null);

  const handleAddIncome = async (data) => {
    try {
      if (data.id) {
        await axiosInstance.put(API_PATHS.INCOME.UPDATE_INCOME(data.id), data);
        toast.success("Income updated successfully");
      } else {
        await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, data);
        toast.success("Income added successfully");
      }
      fetchIncomeData();
      setOpenAddModal(false);
      setSelectedIncome(null);
    } catch {
      toast.error(data.id ? "Failed to update income" : "Failed to add income");
    }
  };

  const handleDeleteIncome = async () => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(openDeleteModal.data._id));
      toast.success("Income deleted successfully");
      setOpenDeleteModal({ show: false, data: null });
      fetchIncomeData();
    } catch {
      toast.error("Failed to delete income");
    }
  };

  const handleDownloadIncome = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: 'blob', // Important for file download
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Income_Report.xlsx'); // or .csv based on backend
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download report");
    }
  };

  // Prepare chart data
  const chartData = [...incomeData]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      label: moment(item.date).format('DD MMM'),
      amount: item.amount,
      source: item.source
    }));

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Income Overview</h2>
          <button
            onClick={() => setOpenAddModal(true)}
            className="btn-primary w-auto px-6 flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="text-lg" /> Add Income
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <IncomeChart data={chartData} />

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-lg font-semibold text-gray-900">All Incomes</h5>
              <button
                onClick={handleDownloadIncome}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary border border-gray-200 hover:border-primary px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <LuDownload /> Download
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomeData.map((item) => (
                <TransactionCard
                  key={item._id}
                  title={item.source}
                  date={moment(item.date).format('Do MMM YYYY')}
                  amount={item.amount}
                  type="income"
                  category={item.source}
                  icon={item.icon}
                  onDelete={() => setOpenDeleteModal({ show: true, data: item })}
                  onEdit={() => {
                    setSelectedIncome(item);
                    setOpenAddModal(true);
                  }}
                />
              ))}
              {incomeData.length === 0 && <p className="text-gray-500">No income records found.</p>}
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedIncome(null);
        }}
        type="income"
        onAdd={handleAddIncome}
        initialData={selectedIncome}
      />

      <DeleteConfirmModal
        isOpen={openDeleteModal.show}
        onClose={() => setOpenDeleteModal({ show: false, data: null })}
        onDelete={handleDeleteIncome}
        title="Delete Income"
        message="Are you sure you want to delete this income record? This action cannot be undone."
      />
    </DashboardLayout>
  );
};

export default Income;
