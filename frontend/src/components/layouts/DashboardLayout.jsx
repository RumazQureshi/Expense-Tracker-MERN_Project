import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import SideMenu from "./SideMenu";
import ChatBot from "../ChatBot/ChatBot";
import { LuMenu } from "react-icons/lu";
import SecurityAlertModal from "../Modals/SecurityAlertModal";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, showChatBot } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const location = useLocation(); // Get current location

  useEffect(() => {
    // Check if user is loaded and security question is missing
    // AND we are NOT on the settings page
    if (user && !user.securityQuestion && location.pathname !== '/settings') {
      const hasSeenAlert = sessionStorage.getItem('securityAlertSeen');
      if (!hasSeenAlert) {
        const timer = setTimeout(() => {
          setShowSecurityModal(true);
        }, 5000); // 5 seconds delay
        return () => clearTimeout(timer);
      }
    } else {
      // If we go to settings page, maybe we should hide it strictly?
      // Or if user fixes it, it disappears. 
      // For now, just preventing opening it new on settings.
      // If it was already open, should we close it? 
      // User request says "should not show when the user is no settings page"
      // Let's safe close it if we navigate to settings.
      if (location.pathname === '/settings') {
        setShowSecurityModal(false);
      }
    }
  }, [user, location.pathname]); // Add location.pathname to deps

  const handleCloseSecurityModal = () => {
    setShowSecurityModal(false);
    sessionStorage.setItem('securityAlertSeen', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row ">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <LuMenu className="text-2xl" />
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
      {showSecurityModal && <SecurityAlertModal onClose={handleCloseSecurityModal} />}
    </div>
  );
};

export default DashboardLayout;