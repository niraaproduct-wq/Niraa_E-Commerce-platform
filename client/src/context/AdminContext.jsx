import React, { createContext, useContext } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  // In the client application, admin mode is always off.
  // The actual admin controls live in the separate /admin application.
  return {
    isAdminMode: false,
    isEditing: false,
    editingItem: null,
    startEditing: () => {},
    stopEditing: () => {},
    toggleAdminMode: () => {}
  };
};

export const AdminProvider = ({ children }) => {
  return (
    <AdminContext.Provider value={{}}>
      {children}
    </AdminContext.Provider>
  );
};
