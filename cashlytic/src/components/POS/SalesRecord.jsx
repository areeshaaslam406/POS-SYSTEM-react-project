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

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sales Records Found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Start making sales to see records appear here. All completed sales will be tracked and displayed in this table.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Sale ID</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Salesperson</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Items</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Net Total</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Date & Time</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center space-x-1">
                  <span>Updated</span>
                  <div className="text-blue-100">↕</div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Comments
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedSales.map((sale, index) => (
              <tr key={sale.id} className="hover:bg-blue-50 transition-colors duration-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    #{sale.id || index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {sale.salesperson || sale.salespersonName || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {sale.itemCount || sale.items?.length || 0} items
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{formatDate(sale.createdAt || sale.timestamp)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt || sale.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.updatedAt ? (
                    <div>
                      <div className="font-medium">{formatDate(sale.updatedAt)}</div>
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
                    {sale.comment ? (
                      <span className="text-gray-700">{sale.comment}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onLoadSale(sale)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200"
                      title="View Sale"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditSale(sale)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-colors duration-200"
                      title="Edit Sale"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSale(sale.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
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