import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

const ProductForm = ({ isOpen, onClose, onSubmit, product = null }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    productName: '',
    costPrice: '',
    salesPrice: ''
  });

  const [initialFormData, setInitialFormData] = useState({
    barcode: '',
    productName: '',
    costPrice: '',
    salesPrice: ''
  });

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      const productData = {
        barcode: product.barcode || '',
        productName: product.productName || '',
        costPrice: product.costPrice || '',
        salesPrice: product.salesPrice || ''
      };
      setFormData(productData);
      setInitialFormData(productData);
    } else {
      // Reset form when no product (adding new product)
      const emptyData = {
        barcode: '',
        productName: '',
        costPrice: '',
        salesPrice: ''
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
    }
  }, [product]);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const checkForChanges = () => {
    if (!product) return false; // No changes to check for new products
    
    return (
      formData.productName !== initialFormData.productName ||
      formData.costPrice !== initialFormData.costPrice ||
      formData.salesPrice !== initialFormData.salesPrice
    );
  };

  const handleClose = () => {
    if (product && !checkForChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes Made',
        text: 'No changes were detected in the form',
        timer: 2000,
        showConfirmButton: false
      });
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.productName || !formData.salesPrice || !formData.barcode || !formData.costPrice) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    // Price validation (no negative values)
    if (parseFloat(formData.costPrice) < 0 || parseFloat(formData.salesPrice) < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Prices cannot be negative'
      });
      return;
    }

    // Validate that sales price is greater than cost price
    if (parseFloat(formData.salesPrice) <= parseFloat(formData.costPrice)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Pricing',
        text: 'Sales price must be greater than cost price'
      });
      return;
    }

    // Check for duplicate barcode (only when adding new product)
    // Note: We'll remove this check since backend will handle validation
    
    // If editing, check if any changes were made
    if (product) {
      const hasChanges = 
        formData.productName !== product.productName ||
        formData.costPrice !== product.costPrice ||
        formData.salesPrice !== product.salesPrice;
        // Note: barcode is excluded as it's read-only during editing

      if (!hasChanges) {
        Swal.fire({
          icon: 'info',
          title: 'No Changes Made',
          text: 'No changes were detected in the form'
        });
        return;
      }
    }

    onSubmit(formData);
    
    // Only clear form if adding new product (not editing)
    if (!product) {
      setFormData({
        barcode: '',
        productName: '',
        costPrice: '',
        salesPrice: ''
      });
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Prevent negative values for price fields
    if ((e.target.name === 'costPrice' || e.target.name === 'salesPrice') && parseFloat(value) < 0) {
      value = '';
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" style={{ maxHeight: '90vh', overflow: 'visible' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-3 space-y-3">
            {/* Barcode Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Barcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className={`w-full px-2 py-1.5 border border-gray-300 rounded text-xs ${
                  product ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Enter barcode"
                required
                readOnly={!!product}
                disabled={!!product}
              />
            </div>

            {/* Product Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Cost Price Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cost Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Sales Price Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sales Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salesPrice"
                value={formData.salesPrice}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded text-xs"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-3 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;