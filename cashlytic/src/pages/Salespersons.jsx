import React, { useState, useEffect } from 'react';
import { Plus, Users, ShoppingCart, Package, Receipt } from 'lucide-react';
import Swal from 'sweetalert2';
import SalespersonForm from '../components/Salespersons/SalespersonForm';
import SalespersonTable from '../components/Salespersons/SalespersonTable';
import { salespersonAPI, transformSalespersonForAPI, transformSalespersonFromAPI } from '../services/api';

const Salespersons = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalespersons();
  }, []);

  const loadSalespersons = async () => {
    try {
      setLoading(true);
      const apiSalespersons = await salespersonAPI.getAll();
      // Transform API data to frontend format
      const transformedSalespersons = apiSalespersons.map(transformSalespersonFromAPI);
      setSalespersons(transformedSalespersons);
    } catch (error) {
      console.error('Error loading salespersons:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load salespersons: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSalesperson = async (salespersonData) => {
    try {
      // Transform frontend data to API format
      const apiSalespersonData = transformSalespersonForAPI(salespersonData);
      await salespersonAPI.add(apiSalespersonData);
      
      await loadSalespersons(); // Reload salespersons
      setIsFormOpen(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Salesperson added successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding salesperson:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to add salesperson: ' + error.message
      });
    }
  };

  const handleEditSalesperson = (salesperson) => {
    setEditingSalesperson(salesperson);
    setIsFormOpen(true);
  };

  const handleUpdateSalesperson = async (salespersonData) => {
    try {
      // Transform frontend data to API format
      const apiSalespersonData = transformSalespersonForAPI(salespersonData);
      await salespersonAPI.update(editingSalesperson.id, apiSalespersonData);
      
      await loadSalespersons(); // Reload salespersons
      setIsFormOpen(false);
      setEditingSalesperson(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Salesperson updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating salesperson:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update salesperson: ' + error.message
      });
    }
  };

  const handleDeleteSalesperson = async (salespersonId) => {
    try {
      const salesperson = salespersons.find(s => s.id === salespersonId);
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete "${salesperson?.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await salespersonAPI.delete(salespersonId);
        await loadSalespersons(); // Reload salespersons
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Salesperson has been deleted successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Failed to delete salesperson';
      if (error.message.includes('has made sales')) {
        errorMessage = 'Cannot delete this salesperson because they have made sales and are referenced in sales records.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete Salesperson',
        text: errorMessage
      });
    }
  };

  const handleFormSubmit = (salespersonData) => {
    if (editingSalesperson) {
      handleUpdateSalesperson(salespersonData);
    } else {
      handleAddSalesperson(salespersonData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSalesperson(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-800 text-white border-b border-slate-700">
        {/* Top Header */}
        <div className="px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-3 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Salesperson Management
              </h1>
              <p className="text-slate-300 text-lg">Manage Your Sales Team</p>
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
              onClick={() => window.location.href = '/products'}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white transition-all duration-300"
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </button>
            <button
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105 transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              <span>Salespersons</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
            {/* Main Content */}
      <div className="px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          {/* Content Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-6 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                    Salesperson Directory
                  </h2>
                  <p className="text-slate-600">Manage and monitor your sales team</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Salesperson</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-700">Show</span>
                  <select className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm font-medium text-slate-700">entries</span>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-6 border border-slate-200/50 shadow-inner">
              {/* Table Body */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-lg text-slate-600">Loading salespersons...</div>
                </div>
              ) : salespersons.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-lg">No salespersons found</p>
                </div>
              ) : (
                <SalespersonTable
                  salespersons={salespersons}
                  onEdit={handleEditSalesperson}
                  onDelete={handleDeleteSalesperson}
                />
              )}
            </div>

            <SalespersonForm
              isOpen={isFormOpen}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
              salesperson={editingSalesperson}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salespersons;