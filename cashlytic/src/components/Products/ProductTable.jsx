import React, { useState } from 'react';
import { Edit, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt'); // Current sort field
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(field === 'createdAt' || field === 'updatedAt' ? 'desc' : 'asc');
    }
  };

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    if (term && term.length > 0) {
      return (
        product.productName.toLowerCase().includes(term) ||
        (product.barcode && product.barcode.toLowerCase().includes(term))
      );
    } else {
      return true;
    }
  });

  // Sort products by selected field
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'id':
        valueA = parseInt(a.id) || 0;
        valueB = parseInt(b.id) || 0;
        break;
      case 'barcode':
        valueA = (a.barcode || '').toLowerCase();
        valueB = (b.barcode || '').toLowerCase();
        break;
      case 'productName':
        valueA = a.productName.toLowerCase();
        valueB = b.productName.toLowerCase();
        break;
      case 'costPrice':
        valueA = parseFloat(a.costPrice) || 0;
        valueB = parseFloat(b.costPrice) || 0;
        break;
      case 'salesPrice':
        valueA = parseFloat(a.salesPrice) || 0;
        valueB = parseFloat(b.salesPrice) || 0;
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
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

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No products added yet. Click "Add Product" to get started.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0 && searchTerm) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No products found matching "{searchTerm}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-700"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('id')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by ID ${sortField === 'id' && sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                  <span>ID</span>
                  {sortField === 'id' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('barcode')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Code ${sortField === 'barcode' && sortOrder === 'desc' ? 'Z-A' : 'A-Z'}`}
                >
                  <span>Code</span>
                  {sortField === 'barcode' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('productName')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Name ${sortField === 'productName' && sortOrder === 'desc' ? 'Z-A' : 'A-Z'}`}
                >
                  <span>Name</span>
                  {sortField === 'productName' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('costPrice')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Cost Price ${sortField === 'costPrice' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Cost Price</span>
                  {sortField === 'costPrice' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('salesPrice')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Retail Price ${sortField === 'salesPrice' && sortOrder === 'desc' ? 'lowest' : 'highest'} first`}
                >
                  <span>Retail Price</span>
                  {sortField === 'salesPrice' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('createdAt')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Added ${sortField === 'createdAt' && sortOrder === 'desc' ? 'oldest' : 'newest'} first`}
                >
                  <span>Added</span>
                  {sortField === 'createdAt' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('updatedAt')}
                  className="flex items-center space-x-1 hover:text-blue-300 transition-colors"
                  title={`Sort by Updated ${sortField === 'updatedAt' && sortOrder === 'desc' ? 'oldest' : 'newest'} first`}
                >
                  <span>Updated</span>
                  {sortField === 'updatedAt' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )
                  ) : null}
                </button>
              </th>
              <th className="table-header whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium px-3 py-3">{index + 1}</td>
                <td className="table-cell px-3 py-3">{product.barcode || '-'}</td>
                <td className="table-cell font-medium px-3 py-3">{product.productName}</td>
                <td className="table-cell px-3 py-3">Rs {product.costPrice || '0.00'}</td>
                <td className="table-cell font-medium px-3 py-3">Rs {product.salesPrice}</td>
                <td className="table-cell text-sm text-gray-500 px-3 py-3">
                  {new Date(product.createdAt).toLocaleString()}
                </td>
                <td className="table-cell text-sm text-gray-500 px-3 py-3">
                  {product.updatedAt ? 
                    new Date(product.updatedAt).toLocaleString() : 
                    'NULL'
                  }
                </td>
                <td className="table-cell px-3 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
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

export default ProductTable;