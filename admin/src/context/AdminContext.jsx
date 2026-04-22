import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [contentSections, setContentSections] = useState([]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Toggle admin mode
  const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdminMode(!isAdminMode);
      if (isAdminMode) {
        // Exiting admin mode, cancel any edits
        setIsEditing(false);
        setEditingItem(null);
      }
    }
  };

  // Start editing an item
  const startEditing = (item, type) => {
    if (isAdminMode) {
      setIsEditing(true);
      setEditingItem({ ...item, type });
    }
  };

  // Stop editing
  const stopEditing = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  // Save changes
  const saveChanges = async (updatedItem) => {
    try {
      // API call to save changes would go here
      console.log('Saving changes:', updatedItem);
      stopEditing();
      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      return false;
    }
  };

  // Delete item
  const deleteItem = async (itemId, itemType) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // API call to delete item would go here
        console.log('Deleting item:', itemId, itemType);
        return true;
      } catch (error) {
        console.error('Error deleting item:', error);
        return false;
      }
    }
    return false;
  };

  // Add new item
  const addItem = async (item, type) => {
    try {
      // API call to add item would go here
      console.log('Adding new item:', item, type);
      return true;
    } catch (error) {
      console.error('Error adding item:', error);
      return false;
    }
  };

  // Reorder items (for drag and drop)
  const reorderItems = async (items) => {
    try {
      // API call to reorder items would go here
      console.log('Reordering items:', items);
      return true;
    } catch (error) {
      console.error('Error reordering items:', error);
      return false;
    }
  };

  const value = {
    isAdminMode,
    isEditing,
    editingItem,
    isAdmin,
    toggleAdminMode,
    startEditing,
    stopEditing,
    saveChanges,
    deleteItem,
    addItem,
    reorderItems,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;