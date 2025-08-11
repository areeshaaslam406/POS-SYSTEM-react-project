import React, { useEffect } from 'react';
import { X, CheckCircle, Mail, Phone, Calendar, User, FileText, Package } from 'lucide-react';

const SaleInvoiceModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  // Handle loading state safely
  const isLoading = sale.loading === true;
  const hasItems = sale.items && Array.isArray(sale.items) && sale.items.length > 0;

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-4 p-6">
            <div className="bg-white bg-opacity-25 rounded-full p-3">
              <FileText size={32} className="text-white" />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-white mb-1">Sale Details</h2>
              <p className="text-purple-100">Complete transaction information</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Sale Information Cards */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-purple-600" />
              </div>
              <h6 className="font-semibold text-gray-800 mb-1">Sale ID</h6>
              <p className="text-xl font-bold text-purple-600">#{sale.id}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Calendar size={20} className="text-green-600" />
              </div>
              <h6 className="font-semibold text-gray-800 mb-1">Date & Time</h6>
              <p className="text-sm font-medium text-gray-800">
                {sale.timestamp ? new Date(sale.timestamp).toLocaleDateString() : new Date(sale.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {sale.timestamp ? new Date(sale.timestamp).toLocaleTimeString() : new Date(sale.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <User size={20} className="text-blue-600" />
              </div>
              <h6 className="font-semibold text-gray-800 mb-1">Salesperson</h6>
              <p className="font-medium text-gray-800">{sale.salesperson}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Package size={20} className="text-yellow-600" />
              </div>
              <h6 className="font-semibold text-gray-800 mb-1">Items</h6>
              <p className="text-xl font-bold text-yellow-600">{hasItems ? sale.items.length : 0}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h5 className="font-bold text-gray-800 flex items-center gap-2">
                <Package size={20} />
                Product Details
              </h5>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-gray-500 mt-4">Loading product details...</p>
                </div>
              ) : hasItems ? (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
                    <tr>
                      <th className="text-left text-white font-semibold px-6 py-4">Product Name</th>
                      <th className="text-center text-white font-semibold px-6 py-4">Quantity</th>
                      <th className="text-right text-white font-semibold px-6 py-4">Unit Price</th>
                      <th className="text-right text-white font-semibold px-6 py-4">Discount</th>
                      <th className="text-right text-white font-semibold px-6 py-4">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sale.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 rounded-full p-2">
                              <Package size={16} className="text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-800">{item.name || 'Unknown Product'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-full text-sm">
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-gray-800">Rs {(item.salesPrice || 0).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.discount && item.discount > 0 ? (
                            <span className="font-medium text-red-600">-Rs {item.discount.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-green-600">
                            Rs {((item.salesPrice || 0) * (item.quantity || 0) - (item.discount || 0)).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items found in this sale</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comments Card */}
            {sale.comment && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h6 className="font-bold text-gray-800">Comments</h6>
                </div>
                <div className="p-6">
                  <p className="text-gray-800 italic">"{sale.comment}"</p>
                </div>
              </div>
            )}
            
            {/* Totals Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h6 className="font-bold text-gray-800">Financial Summary</h6>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800">Subtotal:</span>
                  <span className="font-medium text-gray-800">Rs {(sale.subtotal || sale.total + (sale.discountAmount || 0)).toFixed(2)}</span>
                </div>
                {(sale.discountAmount && sale.discountAmount > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">
                      Total Discount {sale.discountPercentage ? `(${sale.discountPercentage.toFixed(1)}%)` : ''}:
                    </span>
                    <span className="font-medium text-red-600">-Rs {sale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">Rs {sale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 text-gray-600">
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span className="text-sm">info@salespro.com</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">+92 300 123 4567</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceModal;