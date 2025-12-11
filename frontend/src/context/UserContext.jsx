import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Default true to check token first
  const [showChatBot, setShowChatBot] = useState(() => {
    const saved = localStorage.getItem("showChatBot");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token && !user) {
        try {
          const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      } else {
        // If no token, or user already loaded, stop loading
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  const toggleChatBot = () => {
    setShowChatBot(prev => {
      const newState = !prev;
      localStorage.setItem("showChatBot", JSON.stringify(newState));
      return newState;
    });
  };

  const updateChatBotSettings = (isVisible) => {
    setShowChatBot(isVisible);
    localStorage.setItem("showChatBot", JSON.stringify(isVisible));
  };

  // Function to update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider
      value={{
        user, updateUser, clearUser, showChatBot, toggleChatBot, updateChatBotSettings, loading
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
