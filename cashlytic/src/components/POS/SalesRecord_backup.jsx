import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/localStorage';
import { Eye, FileText, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const SalesRecord = ({ sales, onLoadSale, onEditSale, onDeleteSale }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'id':
        aValue = sales.indexOf(a) + 1;
        bValue = sales.indexOf(b) + 1;
        break;
      case 'createdAt':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.timestamp).getTime();
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.timestamp).getTime();
        break;
      case 'updatedAt':
        aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        break;
      case 'salesperson':
        aValue = (a.salesperson || a.salespersonName || '').toLowerCase();
        bValue = (b.salesperson || b.salespersonName || '').toLowerCase();
        break;
      case 'items':
        aValue = a.itemCount || a.items?.length || 0;
        bValue = b.itemCount || b.items?.length || 0;
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'discountAmount':
        aValue = a.discountAmount || 0;
        bValue = b.discountAmount || 0;
        break;
      case 'comment':
        aValue = (a.comment || '').toLowerCase();
        bValue = (b.comment || '').toLowerCase();
        break;
      default:
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.timestamp).getTime();
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.timestamp).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (sales.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No sales records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Sale ID</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Salesperson</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Items</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Net Total</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Date & Time</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Updated</span>
                  <div className="text-gray-400">↕</div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSales.map((sale, index) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{sale.id || index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.salesperson || sale.salespersonName || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.itemCount || sale.items?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div>{formatDate(sale.createdAt || sale.timestamp)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt || sale.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.updatedAt ? (
                    <div>
                      <div>{formatDate(sale.updatedAt)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(sale.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="max-w-xs truncate block" title={sale.comment || ''}>
                    {sale.comment || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onLoadSale(sale)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="View Sale"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditSale(sale)}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="Edit Sale"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSale(sale.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete Sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRecord;
