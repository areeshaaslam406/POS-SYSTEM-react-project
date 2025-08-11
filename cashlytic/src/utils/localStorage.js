// Local Storage utility functions - Used for UI state and temporary data only
// All business data (products, sales, salespersons) should use the database
export const STORAGE_KEYS = {
  // UI Preferences
  USER_PREFERENCES: 'pos_user_preferences',
  THEME: 'pos_theme',
  LANGUAGE: 'pos_language',
  
  // Temporary/Draft data
  DRAFT_SALE: 'pos_draft_sale',
  CART_STATE: 'pos_cart_state',
  
  // UI State
  LAST_SELECTED_SALESPERSON: 'pos_last_salesperson',
  TABLE_FILTERS: 'pos_table_filters',
  
  // Offline cache (fallback only)
  CACHED_PRODUCTS: 'pos_cached_products',
  CACHED_SALESPERSONS: 'pos_cached_salespersons'
};

// Format currency helper
export const formatCurrency = (amount) => {
  return `Rs ${parseFloat(amount).toFixed(2)}`;
};

// Format date helper
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Generic storage functions
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// User Preferences
export const getUserPreferences = () => {
  return getFromStorage(STORAGE_KEYS.USER_PREFERENCES) || {
    theme: 'light',
    language: 'en',
    currency: 'Rs',
    dateFormat: 'MM/dd/yyyy'
  };
};

export const saveUserPreferences = (preferences) => {
  return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

// Draft Sale (temporary cart state before completion)
export const getDraftSale = () => {
  return getFromStorage(STORAGE_KEYS.DRAFT_SALE);
};

export const saveDraftSale = (saleData) => {
  return saveToStorage(STORAGE_KEYS.DRAFT_SALE, {
    ...saleData,
    savedAt: new Date().toISOString()
  });
};

export const clearDraftSale = () => {
  return removeFromStorage(STORAGE_KEYS.DRAFT_SALE);
};

// Last selected salesperson (for convenience)
export const getLastSelectedSalesperson = () => {
  return getFromStorage(STORAGE_KEYS.LAST_SELECTED_SALESPERSON);
};

export const saveLastSelectedSalesperson = (salespersonId) => {
  return saveToStorage(STORAGE_KEYS.LAST_SELECTED_SALESPERSON, salespersonId);
};

// Offline cache (fallback when database is unavailable)
export const getCachedProducts = () => {
  return getFromStorage(STORAGE_KEYS.CACHED_PRODUCTS) || [];
};

export const cacheProducts = (products) => {
  return saveToStorage(STORAGE_KEYS.CACHED_PRODUCTS, {
    data: products,
    cachedAt: new Date().toISOString()
  });
};

export const getCachedSalespersons = () => {
  return getFromStorage(STORAGE_KEYS.CACHED_SALESPERSONS) || [];
};

export const cacheSalespersons = (salespersons) => {
  return saveToStorage(STORAGE_KEYS.CACHED_SALESPERSONS, {
    data: salespersons,
    cachedAt: new Date().toISOString()
  });
};

// Clear all localStorage data (useful for logout or reset)
export const clearAllStoredData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};