import React, { createContext, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showChatBot, setShowChatBot] = useState(() => {
    const saved = localStorage.getItem("showChatBot");
    return saved !== null ? JSON.parse(saved) : true;
  });

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
  };

  return (
    <UserContext.Provider
      value={{
        user, updateUser, clearUser, showChatBot, toggleChatBot, updateChatBotSettings
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
