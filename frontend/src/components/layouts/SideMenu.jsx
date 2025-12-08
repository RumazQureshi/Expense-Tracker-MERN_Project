import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { SIDE_MENU_DATA } from "../../utils/data";
import CharAvatar from "../Cards/CharAvatar";
import { LuX } from "react-icons/lu";
import { getProfileImageUrl } from "../../utils/helper";

const SideMenu = ({ activeMenu, onClose }) => {
  const { user, clearUser } = useContext(UserContext);
  const [imgError, setImgError] = React.useState(false);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }
    navigate(route);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-xl font-bold text-gray-900">Expense Tracker</h2>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-gray-100">
            <LuX className="text-xl text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 mb-10">
        {!imgError && user?.profileImageUrl ? (
          <img
            src={getProfileImageUrl(user?.profileImageUrl) || ""}
            alt="Profile Picture"
            className="w-20 h-20 rounded-full object-cover border-4 border-purple-50"
            onError={() => setImgError(true)}
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-2xl"
          />
        )}

        <h5 className="text-gray-950 font-semibold text-lg">
          {user?.fullName || "User"}
        </h5>
      </div>

      <div className="flex-1">
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] font-medium ${activeMenu == item.label
              ? "text-white bg-primary shadow-lg shadow-purple-500/20"
              : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              } py-3 px-5 rounded-xl mb-3 transition-all duration-300 cursor-pointer`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideMenu;
