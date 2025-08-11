import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../utils/localStorage';

const SalesTable = ({ 
  cartItems, 
  onUpdateQuantity, 
  onUpdateItemDiscount, 
  onRemoveItem, 
  comment, 
  onCommentChange, 
  calculateItemTotal,
  calculateItemDiscountAmount
}) => {
  const [sortField, setSortField] = useState('name'); // Current sort field
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for A-Z, 'desc' for Z-A

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' || field === 'barcode' ? 'asc' : 'desc');
    }
  };

  // Sort cart items by selected field
  const sortedCartItems = [...cartItems].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'barcode':
        valueA = (a.barcode || a.code || a.Code || '').toLowerCase();
        valueB = (b.barcode || b.code || b.Code || '').toLowerCase();
        break;
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'salesPrice':
        valueA = parseFloat(a.salesPrice) || 0;
        valueB = parseFloat(b.salesPrice) || 0;
        break;
      case 'quantity':
        valueA = parseInt(a.quantity) || 0;
        valueB = parseInt(b.quantity) || 0;
        break;
      case 'discount':
        valueA = parseFloat(a.discountPercentage) || 0;
        valueB = parseFloat(b.discountPercentage) || 0;
        break;
      case 'total':
        valueA = calculateItemTotal ? calculateItemTotal(a) : (a.salesPrice * a.quantity) || 0;
        valueB = calculateItemTotal ? calculateItemTotal(b) : (b.salesPrice * b.quantity) || 0;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'desc') {
      return valueB > valueA ? 1 : valueB < valueA ? -1 : 0;
    } else {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    }
  });

  const calculateSubtotal = () => {
    if (calculateItemTotal) {
      return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    } else {
      // Fallback calculation if no function provided
      return cartItems.reduce((total, item) => {
        const itemTotal = item.salesPrice * item.quantity;
        const itemDiscountAmount = ((item.discountPercentage || 0) / 100) * itemTotal;
        return total + (itemTotal - itemDiscountAmount);
      }, 0);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Total is now just the subtotal (which already includes item discounts)
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="table-header">Product Code</th>
                <th className="table-header">Product Name</th>
                <th className="table-header">Price</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Discount %</th>
                <th className="table-header">Total</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="table-cell text-center text-gray-500 py-8">
                  No items in cart. Search and add products to get started.
                </td>
              </tr>
            </tbody>
            <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td colSpan="6" className="table-cell text-right">Total Amount:</td>
              <td className="table-cell text-lg text-green-600">
                {formatCurrency(0)}
              </td>
            </tr>
          </tfoot>
          </table>
        </div>
        
        {/* Discount and Comments Section */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 gap-4">
            {/* Comments Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Add any special instructions or notes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="table-header">
                <button
                  onClick={() => toggleSort('barcode')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Product Code ${sortField === 'barcode' && sortOrder === 'desc' ? 'Z-A' : 'A-Z'}`}
                >
                  <span>Product Code</span>
                  {sortField === 'barcode' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Product Name ${sortField === 'name' && sortOrder === 'desc' ? 'Z-A' : 'A-Z'}`}
                >
                  <span>Product Name</span>
                  {sortField === 'name' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">
                <button
                  onClick={() => toggleSort('salesPrice')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Price ${sortField === 'salesPrice' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Price</span>
                  {sortField === 'salesPrice' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">
                <button
                  onClick={() => toggleSort('quantity')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Quantity ${sortField === 'quantity' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Quantity</span>
                  {sortField === 'quantity' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">
                <button
                  onClick={() => toggleSort('discount')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Discount ${sortField === 'discount' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Discount %</span>
                  {sortField === 'discount' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">
                <button
                  onClick={() => toggleSort('total')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Total ${sortField === 'total' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Total</span>
                  {sortField === 'total' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCartItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="table-cell font-mono text-sm">{item.barcode || item.code || item.Code || 'N/A'}</td>
                <td className="table-cell font-medium">{item.name}</td>
                <td className="table-cell">{formatCurrency(item.salesPrice)}</td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-green-600 hover:text-green-800 p-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={item.discountPercentage || ''}
                      onChange={(e) => onUpdateItemDiscount && onUpdateItemDiscount(item.id, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-16 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                  {calculateItemDiscountAmount && item.discountPercentage > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      -{formatCurrency(calculateItemDiscountAmount(item))}
                    </div>
                  )}
                </td>
                <td className="table-cell font-medium">
                  {calculateItemTotal ? formatCurrency(calculateItemTotal(item)) : formatCurrency(item.salesPrice * item.quantity)}
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="5" className="table-cell text-right font-medium">Subtotal:</td>
              <td className="table-cell font-medium">
                {formatCurrency(calculateSubtotal())}
              </td>
              <td className="table-cell"></td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td colSpan="5" className="table-cell text-right">Total Amount:</td>
              <td className="table-cell text-lg text-green-600">
                {formatCurrency(calculateTotal())}
              </td>
              <td className="table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;