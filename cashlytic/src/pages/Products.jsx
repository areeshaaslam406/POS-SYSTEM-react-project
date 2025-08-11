import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, Package, ShoppingCart, Receipt, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductForm from '../components/Products/ProductForm';
import ProductTable from '../components/Products/ProductTable';
import { productAPI, transformProductForAPI, transformProductFromAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiProducts = await productAPI.getAll();
      // Transform API data to frontend format
      const transformedProducts = apiProducts.map(transformProductFromAPI);
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load products: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      // Transform frontend data to API format
      const apiProductData = transformProductForAPI(productData);
      await productAPI.add(apiProductData);
      
      await loadProducts(); // Reload products
      setIsFormOpen(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product added successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to add product: ' + error.message
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleUpdateProduct = async (productData) => {
    try {
      // Transform frontend data to API format
      const apiProductData = transformProductForAPI(productData);
      await productAPI.update(editingProduct.id, apiProductData);
      
      await loadProducts(); // Reload products
      setIsFormOpen(false);
      setEditingProduct(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update product: ' + error.message
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete "${product?.productName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await productAPI.delete(productId);
        await loadProducts(); // Reload products
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Failed to delete product';
      if (error.message.includes('has been sold')) {
        errorMessage = 'Cannot delete this product because it has been sold and is referenced in sales records.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete Product',
        text: errorMessage
      });
    }
  };

  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleAddProduct(productData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-purple-800 text-white border-b border-slate-700">
        {/* Top Header */}
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Product Management
              </h1>
              <p className="text-slate-300 text-lg">Advanced Product Management Control</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Point of Sale</span>
            </button>
            <button
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105 transition-all duration-300"
            >
              <Package className="w-5 h-5" />
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
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden max-w-6xl mx-auto">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Product Management</h2>
                  <p className="text-purple-600">Manage your product catalog efficiently</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Products Table Container - Smaller and Scrollable */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              {/* Table Body */}
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No products found</p>
                </div>
              ) : (
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              )}
            </div>

            <ProductForm
              isOpen={isFormOpen}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
              product={editingProduct}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;