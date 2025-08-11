import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ProductSearch = ({ products, onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    onProductSelect(product);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter product name or barcode..."
        />
      </div>

      {showSuggestions && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{product.productName}</p>
                  {product.barcode && (
                    <p className="text-xs text-gray-400">Barcode: {product.barcode}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">Rs {product.salesPrice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && searchTerm && filteredProducts.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No products found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;