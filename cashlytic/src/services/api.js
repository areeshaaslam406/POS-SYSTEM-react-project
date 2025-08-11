// API Configuration and Service Functions
const API_BASE_URL = 'http://localhost:5192/api'; // Updated to use HTTP port from launchSettings.json

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    if (response.status === 204) {
      return null; // No content
    }
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        
        // Handle ModelState validation errors
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          errorDetails = `Validation errors: ${validationErrors}`;
        } else if (errorData.message) {
          errorDetails = errorData.message;
        } else if (typeof errorData === 'string') {
          errorDetails = errorData;
        } else {
          errorDetails = JSON.stringify(errorData);
        }
      } catch {
        errorDetails = `HTTP error! status: ${response.status}`;
      }
      
      throw new Error(errorDetails);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Product API functions
export const productAPI = {
  // Get all products
  getAll: () => apiRequest('/products'),
  
  // Get product by ID
  getById: (id) => apiRequest(`/products/${id}`),
  
  // Add new product
  add: (product) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  }),
  
  // Update product
  update: (id, product) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  }),
  
  // Delete product
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE'
  })
};

// Salesperson API functions
export const salespersonAPI = {
  // Get all salespersons
  getAll: () => apiRequest('/salesperson'),
  
  // Get salesperson by ID
  getById: (id) => apiRequest(`/salesperson/${id}`),
  
  // Add new salesperson
  add: (salesperson) => apiRequest('/salesperson', {
    method: 'POST',
    body: JSON.stringify(salesperson)
  }),
  
  // Update salesperson
  update: (id, salesperson) => apiRequest(`/salesperson/${id}`, {
    method: 'PUT',
    body: JSON.stringify(salesperson)
  }),
  
  // Delete salesperson
  delete: (id) => apiRequest(`/salesperson/${id}`, {
    method: 'DELETE'
  })
};

// Sales API functions
export const salesAPI = {
  // Get all sales
  getAll: () => apiRequest('/sales'),
  
  // Get sale by ID
  getById: (id) => apiRequest(`/sales/${id}`),
  
  // Add new sale
  add: (sale) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(sale)
  }),
  
  // Update sale
  update: (id, sale) => apiRequest(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sale)
  }),
  
  // Delete sale
  delete: (id) => apiRequest(`/sales/${id}`, {
    method: 'DELETE'
  }),
  
  // Get sales by salesperson
  getBySalesperson: (salespersonId) => apiRequest(`/sales/salesperson/${salespersonId}`)
};

// Helper functions for data transformation
export const transformProductForAPI = (frontendProduct) => {
  return {
    code: frontendProduct.barcode || `PRD${Date.now()}`, // Use barcode as code, or generate
    name: frontendProduct.productName,
    costPrice: parseFloat(frontendProduct.costPrice) || 0,
    retailPrice: parseFloat(frontendProduct.salesPrice)
  };
};

export const transformProductFromAPI = (apiProduct) => {
  return {
    id: apiProduct.productId,
    productName: apiProduct.name,
    barcode: apiProduct.code,
    salesPrice: apiProduct.retailPrice,
    costPrice: apiProduct.costPrice,
    createdAt: apiProduct.creationDate,
    updatedAt: apiProduct.updatedTime
  };
};

export const transformSalespersonForAPI = (frontendSalesperson) => {
  return {
    name: frontendSalesperson.name,
    code: frontendSalesperson.code
  };
};

export const transformSalespersonFromAPI = (apiSalesperson) => {
  return {
    id: apiSalesperson.salespersonID,
    name: apiSalesperson.name,
    code: apiSalesperson.code,
    createdAt: apiSalesperson.enteredDate,
    updatedAt: apiSalesperson.updatedTime
  };
};

export const transformSaleForAPI = (frontendSale, salespersonId, calculatedTotal) => {
  // Debug: Log what we're about to transform
  console.log('DEBUG TRANSFORM: Input frontendSale:', frontendSale);
  console.log('DEBUG TRANSFORM: salespersonId:', salespersonId);
  console.log('DEBUG TRANSFORM: calculatedTotal:', calculatedTotal);
  
  const transformedData = {
    SalespersonId: parseInt(salespersonId), // Pascal case to match C# model
    Total: parseFloat(calculatedTotal), // Pascal case to match C# model
    Comments: frontendSale.comment || '', // Pascal case to match C# model
    Items: frontendSale.items.map(item => ({ // Pascal case to match C# model
      ProductId: parseInt(item.id), // Pascal case to match C# model
      ProductName: item.productName || item.name || null, // Include product name if available
      RetailPrice: parseFloat(item.salesPrice), // Pascal case to match C# model
      Quantity: parseInt(item.quantity), // Pascal case to match C# model
      Discount: parseFloat(item.discountAmount) || 0 // Pascal case to match C# model (renamed from discountAmount)
    }))
  };
  
  // Debug: Log the transformed data
  console.log('DEBUG TRANSFORM: Transformed data:', transformedData);
  console.log('DEBUG TRANSFORM: Items being sent:');
  transformedData.Items.forEach((item, index) => {
    console.log(`  Item ${index + 1}: ProductId=${item.ProductId}, ProductName="${item.ProductName}", Quantity=${item.Quantity}, Price=${item.RetailPrice}`);
  });
  
  return transformedData;
};

export const transformSaleFromAPI = (apiSale) => {
  // Handle case where apiSale might be null or undefined
  if (!apiSale) {
    console.error('transformSaleFromAPI: apiSale is null or undefined');
    return null;
  }
  
  // Transform SalesDetail objects to cart item format
  // With camelCase configuration, API should return 'details'
  const detailsArray = apiSale.details || [];
  
  const transformedItems = detailsArray.map(detail => {
    // Calculate discount percentage from discount amount
    const baseTotal = parseFloat(detail.retailPrice || 0) * parseInt(detail.quantity || 1);
    const discountAmount = parseFloat(detail.discount || 0);
    const discountPercentage = baseTotal > 0 ? (discountAmount / baseTotal) * 100 : 0;
    
    return {
      id: detail.productId,
      productId: detail.productId,
      name: detail.productName || `Product ${detail.productId}`,
      barcode: detail.productBarcode || 'N/A',
      quantity: detail.quantity,
      salesPrice: detail.retailPrice,
      discount: detail.discount || 0,
      discountPercentage: parseFloat(discountPercentage.toFixed(2)) || 0 // Calculate from discount amount
    };
  });

  // Calculate discount information from items
  const subtotalBeforeDiscounts = transformedItems.reduce((sum, item) => sum + (item.salesPrice * item.quantity), 0);
  const totalDiscountAmount = transformedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const discountPercentage = subtotalBeforeDiscounts > 0 ? (totalDiscountAmount / subtotalBeforeDiscounts) * 100 : 0;

  const result = {
    id: apiSale.saleId,
    salespersonId: apiSale.salespersonId,
    salespersonName: apiSale.salespersonName,
    salesperson: apiSale.salespersonName, // Map to old field name for compatibility
    comment: apiSale.comments,
    total: apiSale.total,
    subtotal: subtotalBeforeDiscounts,
    discountAmount: totalDiscountAmount,
    discountPercentage: discountPercentage,
    createdAt: apiSale.saleDate,
    updatedAt: apiSale.updatedTime,
    items: transformedItems, // Properly transformed items
    itemCount: apiSale.items || transformedItems.length // Use backend count or calculate
  };

  return result;
};
