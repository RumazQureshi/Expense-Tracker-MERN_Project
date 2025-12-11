import React, { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import SideMenu from "./SideMenu";
import ChatBot from "../ChatBot/ChatBot";
import { LuMenu } from "react-icons/lu";

import TourGuide from "../TourGuide";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, showChatBot } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row ">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button
            id="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 relative"
          >
            <LuMenu className="text-2xl" />
            {user && !user.securityQuestion && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white z-50"></span>
            )}
          </button>
          <h2 className="text-lg font-bold text-gray-900">Expense Tracker</h2>
        </div>
      </div>

      {user && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <SideMenu activeMenu={activeMenu} />
          </div>

          {/* Mobile Sidebar Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Mobile Sidebar */}
          <div
            className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <SideMenu activeMenu={activeMenu} onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 h-[calc(100vh-60px)] md:h-screen overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
        {children}
      </div>

      {showChatBot && <ChatBot />}

      <TourGuide />
    </div>
  );
};

export default DashboardLayout;