import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonAPI } from '../../services/api';

const SalespersonForm = ({ isOpen, onClose, onSubmit, salesperson = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const [initialFormData, setInitialFormData] = useState({
    name: '',
    code: ''
  });

  // Update form data when salesperson prop changes
  useEffect(() => {
    if (salesperson) {
      const salespersonData = {
        name: salesperson.name || '',
        code: salesperson.code || ''
      };
      setFormData(salespersonData);
      setInitialFormData(salespersonData);
    } else {
      // Reset form when no salesperson (adding new salesperson)
      const emptyData = {
        name: '',
        code: ''
      };
      setFormData(emptyData);
      setInitialFormData(emptyData);
    }
  }, [salesperson]);

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
    if (!salesperson) return false; // No changes to check for new salespersons
    
    return (
      formData.name !== initialFormData.name ||
      formData.code !== initialFormData.code
    );
  };

  const handleClose = () => {
    if (salesperson && !checkForChanges()) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.code) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    // Check for duplicate salesperson code (only when adding new salesperson)
    if (!salesperson) {
      try {
        const existingSalespersons = await salespersonAPI.getAll();
        const isDuplicateCode = existingSalespersons.some(s => s.code === formData.code);
        
        if (isDuplicateCode) {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Salesperson Code',
            text: 'A Salesperson with this salesperson code already exists'
          });
          return;
        }
      } catch (error) {
        console.error('Error checking for duplicate codes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to validate salesperson code. Please try again.'
        });
        return;
      }
    }

    // If editing, check if any changes were made
    if (salesperson) {
      const hasChanges = 
        formData.name !== salesperson.name ||
        formData.code !== salesperson.code;

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
    
    // Only clear form if adding new salesperson (not editing)
    if (!salesperson) {
      setFormData({
        name: '',
        code: ''
      });
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {salesperson ? 'Edit Salesperson' : 'Add New Salesperson'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salesperson Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                salesperson ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
              }`}
              placeholder="Enter salesperson code"
              required
              readOnly={!!salesperson}
              disabled={!!salesperson}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {salesperson ? 'Update Salesperson' : 'Add Salesperson'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SalespersonForm;