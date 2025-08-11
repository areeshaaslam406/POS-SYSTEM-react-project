import React, { useState, useEffect } from 'react';
import { ShoppingCart, Receipt, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductSearch from '../components/POS/ProductSearch';
import SalesTable from '../components/POS/SalesTable';
import SalesRecord from '../components/POS/SalesRecord';
import SaleInvoiceModal from '../components/POS/SaleInvoiceModal';
import ProductSelectionModal from '../components/POS/ProductSelectionModal';
import { productAPI, salespersonAPI, salesAPI, transformProductFromAPI, transformSalespersonFromAPI, transformSaleFromAPI, transformSaleForAPI } from '../services/api';
import { formatCurrency, getLastSelectedSalesperson, saveLastSelectedSalesperson, getDraftSale, saveDraftSale, clearDraftSale } from '../utils/localStorage';

const PointOfSale = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [products, setProducts] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [sales, setSales] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [comment, setComment] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [initialSaleData, setInitialSaleData] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [productSelectionModalOpen, setProductSelectionModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    loadUserPreferences();
    
    // Set up live time update
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Load user preferences from localStorage
  const loadUserPreferences = () => {
    // Restore last selected salesperson for convenience
    const lastSalesperson = getLastSelectedSalesperson();
    if (lastSalesperson && !editingSale) {
      setSelectedSalesperson(lastSalesperson);
    }

    // Restore draft sale if it exists
    const draftSale = getDraftSale();
    if (draftSale && !editingSale) {
      setCartItems(draftSale.cartItems || []);
      setComment(draftSale.comment || '');
      if (draftSale.selectedSalesperson) {
        setSelectedSalesperson(draftSale.selectedSalesperson);
      }
    }
  };

  // Auto-save draft sale to localStorage whenever cart changes (but not during editing)
  useEffect(() => {
    if (cartItems.length > 0 && !editingSale) {
      saveDraftSale({
        cartItems,
        comment,
        selectedSalesperson
      });
    } else if (cartItems.length === 0 && !editingSale) {
      // Clear draft if cart is empty and not editing
      clearDraftSale();
    }
  }, [cartItems, comment, selectedSalesperson, editingSale]);

  // ESC key handler for edit sale
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && editingSale) {
        handleCancelEdit();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [editingSale, initialSaleData]);

  const handleCancelEdit = () => {
    if (editingSale && !checkForSaleChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes Made',
        text: 'No changes were detected in the sale',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        // Reset form and switch to sales record tab
        resetFormState();
      });
    } else {
      // Reset form and switch to sales record tab
      resetFormState();
    }
  };

  // Helper function to reset form state
  const resetFormState = () => {
    setCartItems([]);
    setSelectedSalesperson('');
    setComment('');
    setEditingSale(null);
    setInitialSaleData(null);
    setActiveTab('record');
    
    // Clear draft sale when resetting (since we're no longer working on anything)
    clearDraftSale();
  };

  // Helper function to handle salesperson selection with localStorage
  const handleSalespersonChange = (salespersonId) => {
    setSelectedSalesperson(salespersonId);
    if (salespersonId && !editingSale) {
      saveLastSelectedSalesperson(salespersonId);
    }
  };

  const loadData = async () => {
    try {
      // Load products
      const apiProducts = await productAPI.getAll();
      const transformedProducts = apiProducts.map(transformProductFromAPI);
      setProducts(transformedProducts);

      // Load salespersons
      const apiSalespersons = await salespersonAPI.getAll();
      const transformedSalespersons = apiSalespersons.map(transformSalespersonFromAPI);
      setSalespersons(transformedSalespersons);

      // Load sales
      const apiSales = await salesAPI.getAll();
      const transformedSales = apiSales.map(transformSaleFromAPI);
      setSales(transformedSales);
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: 'Failed to load data from server. Please refresh the page.'
      });
    }
  };

  const handleProductSelect = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.productName,
        barcode: product.barcode,
        salesPrice: parseFloat(product.salesPrice),
        quantity: 1,
        discountPercentage: 0 // Initialize with 0% discount
      }]);
    }
  };

  const handleAddFromModal = (product) => {
    // Convert the modal product format to the expected cart item format
    const cartProduct = {
      id: product.id,
      productName: product.name,
      barcode: product.barcode,
      salesPrice: product.salesPrice,
      discountPercentage: 0 // Initialize with 0% discount
    };
    
    handleProductSelect(cartProduct);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleUpdateItemDiscount = (itemId, discountPercentage) => {
    // Validate discount percentage (0-100)
    const numValue = parseFloat(discountPercentage);
    let validatedValue = discountPercentage;
    
    if (discountPercentage === '' || (numValue >= 0 && numValue <= 100)) {
      validatedValue = discountPercentage;
    } else if (numValue < 0) {
      validatedValue = '0';
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Discount',
        text: 'Discount cannot be negative',
        timer: 2000,
        showConfirmButton: false
      });
    } else if (numValue > 100) {
      validatedValue = '100';
      Swal.fire({
        icon: 'warning',
        title: 'Maximum Discount',
        text: 'Maximum discount allowed is 100%',
        timer: 2000,
        showConfirmButton: false
      });
    }
    
    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, discountPercentage: parseFloat(validatedValue) || 0 }
        : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.salesPrice * item.quantity;
      const itemDiscountAmount = (item.discountPercentage / 100) * itemTotal;
      return total + (itemTotal - itemDiscountAmount);
    }, 0);
  };

  const calculateItemTotal = (item) => {
    const baseTotal = item.salesPrice * item.quantity;
    const discountAmount = (item.discountPercentage / 100) * baseTotal;
    return baseTotal - discountAmount;
  };

  const calculateItemDiscountAmount = (item) => {
    const baseTotal = item.salesPrice * item.quantity;
    return (item.discountPercentage / 100) * baseTotal;
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Total is now just the subtotal (which already includes item discounts)
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Please add items to cart before completing sale'
      });
      return;
    }

    if (!selectedSalesperson) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Salesperson',
        text: 'Please select a salesperson before completing sale'
      });
      return;
    }

    const finalTotal = calculateTotal();
    
    // Prepare items with their individual discount amounts (no overall discount)
    const itemsWithDiscount = cartItems.map(item => {
      const baseItemTotal = item.salesPrice * item.quantity;
      const itemDiscountAmount = calculateItemDiscountAmount(item);
      
      return {
        id: item.id,
        productName: item.name, // Include the product name
        salesPrice: item.salesPrice,
        quantity: item.quantity,
        discountAmount: itemDiscountAmount // Only individual item discount
      };
    });

    const saleData = {
      items: itemsWithDiscount,
      comment: comment || ''
    };

    try {
      let result = null;
      let actionText = '';

      if (editingSale) {
        // Check for changes before updating
        if (!checkForSaleChanges()) {
          Swal.fire({
            icon: 'info',
            title: 'No Changes Made',
            text: 'No changes were detected in the sale',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            // Reset form and switch to sales record tab
            resetFormState();
          });
          return;
        }
        
        // Transform data for API update
        const apiSaleData = transformSaleForAPI(saleData, selectedSalesperson, finalTotal);
        result = await salesAPI.update(editingSale.id, apiSaleData);
        actionText = 'updated';
      } else {
        // Transform data for API creation
        const apiSaleData = transformSaleForAPI(saleData, selectedSalesperson, finalTotal);
        result = await salesAPI.add(apiSaleData);
        actionText = 'completed';
      }

      // Success notification
      Swal.fire({
        icon: 'success',
        title: `Sale ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`,
        text: `Total: ${formatCurrency(calculateTotal())}`,
        timer: 3000,
        showConfirmButton: false
      });
      
      // Clear draft sale from localStorage since it's now completed
      clearDraftSale();
      
      // Reset form and reload data
      resetFormState();
      
      // Reload sales data
      await loadData();

    } catch (error) {
      console.error('Error completing sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to complete sale: ' + error.message
      });
    }
  };

  const handleLoadSale = async (sale) => {
    try {
      // Validate input
      if (!sale || !sale.id) {
        throw new Error('Invalid sale data provided');
      }

      // Show loading state while fetching detailed sale information
      const loadingSale = { 
        ...sale, 
        loading: true,
        items: sale.items || [] // Ensure items array exists
      };
      setSelectedSale(loadingSale);
      setInvoiceModalOpen(true);
      
      console.log('Fetching detailed sale for ID:', sale.id);
      
      // Fetch detailed sale information when viewing invoice
      const detailedSale = await salesAPI.getById(sale.id);
      console.log('Raw API response:', detailedSale);
      
      if (!detailedSale) {
        throw new Error('No data returned from API');
      }
      
      // Debug: Log the details array specifically
      if (detailedSale.details && Array.isArray(detailedSale.details)) {
        console.log('DEBUG: Sale details from API:');
        detailedSale.details.forEach((item, index) => {
          console.log(`  Item ${index + 1}: ProductId=${item.productId}, ProductName="${item.productName}", Quantity=${item.quantity}, Price=${item.retailPrice}`);
        });
      } else {
        console.log('DEBUG: No details array found in API response');
      }
      
      const transformedDetailedSale = transformSaleFromAPI(detailedSale);
      console.log('Transformed sale data:', transformedDetailedSale);
      
      if (!transformedDetailedSale) {
        throw new Error('Failed to transform sale data');
      }
      
      // Ensure the transformed sale has all required properties
      const safeSale = {
        ...transformedDetailedSale,
        loading: false,
        items: transformedDetailedSale.items || []
      };
      
      // Update with detailed information including product names
      setSelectedSale(safeSale);
    } catch (error) {
      console.error('Error loading sale details:', error);
      console.error('Error stack:', error.stack);
      
      // Show error notification with more details
      Swal.fire({
        icon: 'warning',
        title: 'Partial Data Loaded',
        text: `Could not load detailed product information: ${error.message}. Showing basic sale data.`,
        timer: 5000,
        showConfirmButton: true
      });
      
      // Fallback to existing sale data (summary only)
      const safeFallbackSale = { 
        ...sale, 
        loading: false,
        items: sale.items || []
      };
      setSelectedSale(safeFallbackSale);
    }
  };

  const handleEditSale = async (sale) => {
    try {
      // First, fetch the complete sale details including product information
      console.log('Loading sale for editing:', sale.id);
      const detailedSale = await salesAPI.getById(sale.id);
      
      if (!detailedSale) {
        throw new Error('Failed to load sale details');
      }

      // Transform the detailed sale data
      const transformedSale = transformSaleFromAPI(detailedSale);
      
      if (!transformedSale || !transformedSale.items) {
        throw new Error('Invalid sale data received');
      }

      // Set editing state
      setEditingSale(transformedSale);
      
      // Prepare cart items with all necessary fields for editing
      const itemsWithDiscount = transformedSale.items.map(item => {
        // Calculate discount percentage from discount amount
        const baseTotal = parseFloat(item.salesPrice || item.price || 0) * parseInt(item.quantity || 1);
        const discountAmount = parseFloat(item.discount || 0);
        const discountPercentage = baseTotal > 0 ? (discountAmount / baseTotal) * 100 : 0;
        
        return {
          id: item.id,
          name: item.name || item.productName || 'Unknown Product',
          barcode: item.barcode,
          salesPrice: parseFloat(item.salesPrice || item.price || 0),
          quantity: parseInt(item.quantity || 1),
          discountPercentage: parseFloat(discountPercentage.toFixed(2)) || 0
        };
      });

      // Set form data
      setCartItems(itemsWithDiscount);
      setSelectedSalesperson(transformedSale.salespersonId?.toString() || '');
      setComment(transformedSale.comment || transformedSale.comments || '');
      
      // Store initial sale data for change detection
      setInitialSaleData({
        items: JSON.parse(JSON.stringify(itemsWithDiscount)), // Deep copy of items
        salespersonId: transformedSale.salespersonId,
        comment: transformedSale.comment || transformedSale.comments || ''
      });
      
      // Switch to sales tab
      setActiveTab('sales');
      
      console.log('Sale loaded for editing:', {
        id: transformedSale.id,
        itemsCount: itemsWithDiscount.length,
        salespersonId: transformedSale.salespersonId,
        comment: transformedSale.comment || transformedSale.comments,
        total: transformedSale.total
      });

    } catch (error) {
      console.error('Error loading sale for editing:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Sale',
        text: `Failed to load sale details for editing: ${error.message}`,
        confirmButtonText: 'OK'
      });
    }
  };

  const checkForSaleChanges = () => {
    if (!editingSale || !initialSaleData) return true; // Allow if no editing or no initial data
    
    // Check if salesperson changed
    if (selectedSalesperson !== initialSaleData.salespersonId?.toString()) return true;
    
    // Check if comment changed
    if (comment !== initialSaleData.comment) return true;
    
    // Check if items changed (compare lengths first)
    if (cartItems.length !== initialSaleData.items.length) return true;
    
    // Check if any item quantities or discounts changed
    for (let i = 0; i < cartItems.length; i++) {
      const currentItem = cartItems[i];
      const initialItem = initialSaleData.items.find(item => item.id === currentItem.id);
      
      if (!initialItem || 
          currentItem.quantity !== initialItem.quantity ||
          (currentItem.discountPercentage || 0) !== (initialItem.discountPercentage || 0) ||
          parseFloat(currentItem.salesPrice || 0) !== parseFloat(initialItem.salesPrice || 0)) {
        return true;
      }
    }
    
    return false; // No changes detected
  };

  const handleDeleteSale = (saleId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await salesAPI.delete(saleId);
          Swal.fire(
            'Deleted!',
            'The sale record has been deleted.',
            'success'
          );
          await loadData(); // Reload data
        } catch (error) {
          console.error('Error deleting sale:', error);
          Swal.fire(
            'Error!',
            'Failed to delete the sale record: ' + error.message,
            'error'
          );
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white border-b border-slate-700">
        {/* Top Header */}
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Modern POS System
              </h1>
              <p className="text-slate-300 text-lg">Advanced Point of Sale Management</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'sales' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Point of Sale</span>
            </button>
            <button
              onClick={() => window.location.href = '/products'}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white transition-all duration-300"
            >
              <FileText className="w-5 h-5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => window.location.href = '/salespersons'}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white transition-all duration-300"
            >
              <Receipt className="w-5 h-5" />
              <span>Salespersons</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="bg-slate-800/50 px-8 py-4 border-t border-slate-700/50">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'sales' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sales</span>
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'record' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Side - Point of Sale Card */}
            <div className="xl:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-xl shadow-lg">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Sales</h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Editing Indicator */}
                  {editingSale && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-orange-800 font-medium">
                          Editing Sale #{editingSale.id} - Make your changes and click "Update Sale" or press ESC to cancel
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date and Salesperson Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Current Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={currentDate}
                          onChange={(e) => setCurrentDate(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div className="mt-2 text-lg text-cyan-600 font-bold flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="tabular-nums">
                          {currentTime.toLocaleTimeString('en-US', { 
                            hour12: true, 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Salesperson */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Salesperson</label>
                      <select
                        value={selectedSalesperson}
                        onChange={(e) => handleSalespersonChange(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/80 backdrop-blur-sm"
                      >
                        <option value="">- Select Salesperson</option>
                        {salespersons.map((salesperson) => (
                          <option key={salesperson.id} value={salesperson.id}>
                            {salesperson.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Products */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Product Search</label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <ProductSearch
                            products={products}
                            onSelectProduct={handleProductSelect}
                            placeholder="Search products..."
                          />
                        </div>
                        <button
                          onClick={() => setProductSelectionModalOpen(true)}
                          className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                          title="Browse Products"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200/50">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">No items in cart. Search and add products above.</p>
                      </div>
                    ) : (
                      <SalesTable
                        cartItems={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdateItemDiscount={handleUpdateItemDiscount}
                        onRemoveItem={handleRemoveItem}
                        comment={comment}
                        onCommentChange={setComment}
                        calculateItemTotal={calculateItemTotal}
                        calculateItemDiscountAmount={calculateItemDiscountAmount}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Payment Details Card */}
            <div className="xl:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden h-fit">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Sales Summary</h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Net Total */}
                  <div className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/50">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-700">Total Amount:</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add comments for this sale..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none bg-white/80 backdrop-blur-sm"
                      rows={3}
                    />
                  </div>

                  {/* Complete Sale Button */}
                  {editingSale ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleCompleteSale}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                        disabled={cartItems.length === 0}
                      >
                        <Receipt className="w-6 h-6" />
                        <span>Update Sales</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="w-full bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-600 hover:to-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
                      >
                        <span>Cancel Changes</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteSale}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={cartItems.length === 0}
                    >
                      <Receipt className="w-6 h-6" />
                      <span>Complete Sales</span>
                    </button>
                  )}

                  {/* System Notice */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <div className="text-slate-600 font-medium">Modern POS System</div>
                      <div className="text-sm text-slate-500 mt-1">Advanced Sales Processing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'record' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Record</h2>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <SalesRecord
                sales={sales}
                onLoadSale={handleLoadSale}
                onEditSale={handleEditSale}
                onDeleteSale={handleDeleteSale}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sale Invoice Modal */}
      <SaleInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        sale={selectedSale}
      />

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={productSelectionModalOpen}
        onClose={() => setProductSelectionModalOpen(false)}
        products={products}
        onAddToCart={handleAddFromModal}
      />
    </div>
  );
};

export default PointOfSale;