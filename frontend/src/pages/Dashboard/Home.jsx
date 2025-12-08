import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import StatsCard from '../../components/Cards/StatsCard';
import TransactionCard from '../../components/Cards/TransactionCard';
import OverviewChart from '../../components/Charts/OverviewChart';
import { LuHandCoins, LuWalletMinimal, LuArrowRight } from "react-icons/lu";
import { IoMdCard } from 'react-icons/io';
import { addThousandsSeparator } from '../../utils/helper';
import moment from 'moment';

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);
        if (response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.log("Something went wrong. Please try again.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prepare chart data matching the reference image (Balance, Expenses, Income)
  const chartData = [
    { name: 'Total Balance', value: dashboardData?.totalBalance || 0 },
    { name: 'Total Expenses', value: dashboardData?.totalExpenses || 0 },
    { name: 'Total Income', value: dashboardData?.totalIncome || 0 },
  ];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto w-full'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <StatsCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />
          <StatsCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />
          <StatsCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-lg font-semibold text-gray-900">Recent Transactions</h5>
              <button
                onClick={() => navigate('/transactions')}
                className="flex items-center gap-2 text-sm text-primary px-3 py-2 rounded-full hover:bg-gray-300 cursor-pointer"
              >
                See All <LuArrowRight />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {dashboardData?.recentTransactions?.slice(0, 5).map((txn) => (
                <TransactionCard
                  key={txn._id}
                  title={txn.source || txn.category}
                  date={moment(txn.date).format('Do MMM YYYY')}
                  amount={txn.amount}
                  type={txn.type}
                  category={txn.category}
                  icon={txn.icon}
                />
              )) || <p className="text-gray-500 text-sm text-center py-4">No recent transactions</p>}
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
            <h5 className="text-lg font-semibold text-gray-900 mb-6">Financial Overview</h5>
            <OverviewChart data={chartData} totalBalance={addThousandsSeparator(dashboardData?.totalBalance || 0)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-lg font-semibold text-gray-900">Incomes</h5>
              <button
                onClick={() => navigate('/income')}
                className="flex items-center gap-2 text-sm text-primary px-3 py-2 rounded-full hover:bg-gray-300 cursor-pointer"
              >
                See More <LuArrowRight />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {dashboardData?.recentTransactions?.filter(item => item.type === 'income').slice(0, 5).map((txn) => (
                <TransactionCard
                  key={txn._id}
                  title={txn.source || txn.category}
                  date={moment(txn.date).format('Do MMM YYYY')}
                  amount={txn.amount}
                  type={txn.type}
                  category={txn.category}
                  icon={txn.icon}
                />
              )) || <p className="text-gray-500 text-sm text-center py-4">No recent income</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-lg font-semibold text-gray-900">Expenses</h5>
              <button
                onClick={() => navigate('/expense')}
                className="flex items-center gap-2 text-sm text-primary px-3 py-2 rounded-full hover:bg-gray-300 cursor-pointer"
              >
                See More <LuArrowRight />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {dashboardData?.recentTransactions?.filter(item => item.type === 'expense').slice(0, 5).map((txn) => (
                <TransactionCard
                  key={txn._id}
                  title={txn.category}
                  date={moment(txn.date).format('Do MMM YYYY')}
                  amount={txn.amount}
                  type={txn.type}
                  category={txn.category}
                  icon={txn.icon}
                />
              )) || <p className="text-gray-500 text-sm text-center py-4">No recent expenses</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;