import React, { useState } from 'react';
import { Edit, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';

const SalespersonTable = ({ salespersons, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(field === 'createdAt' || field === 'updatedAt' ? 'desc' : 'asc');
    }
  };

  const filteredSalespersons = salespersons.filter(salesperson => {
    const term = searchTerm.toLowerCase();
    if (term && term.length > 0) {
      return (
        salesperson.name.toLowerCase().includes(term) ||
        (salesperson.code && salesperson.code.toLowerCase().includes(term))
      );
    } else {
      return true;
    }
  });

  const sortedSalespersons = [...filteredSalespersons].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'id':
        valueA = parseInt(a.id) || 0;
        valueB = parseInt(b.id) || 0;
        break;
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'code':
        valueA = a.code.toLowerCase();
        valueB = b.code.toLowerCase();
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        // Handle null values - put them at the end for both asc and desc
        if (!a.updatedAt && !b.updatedAt) return 0;
        if (!a.updatedAt) return sortOrder === 'desc' ? 1 : 1; // nulls always at end
        if (!b.updatedAt) return sortOrder === 'desc' ? -1 : -1; // nulls always at end
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
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

  if (!salespersons || salespersons.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 text-lg">No salespersons found</p>
      </div>
    );
  }

  if (filteredSalespersons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200/50">
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search salespersons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400 text-slate-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg">No salespersons match your search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200/50">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search salespersons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400 text-slate-700"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 border-b border-indigo-700">
        <div className="grid grid-cols-5 gap-4 px-6 py-4 text-sm font-semibold text-white">
          <button
            onClick={() => toggleSort('name')}
            className="flex items-center space-x-2 text-left hover:text-indigo-200 transition-colors"
          >
            <span>Salesperson Name</span>
            {sortField === 'name' && (
              sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => toggleSort('code')}
            className="flex items-center space-x-2 text-left hover:text-indigo-200 transition-colors"
          >
            <span>Salesperson Code</span>
            {sortField === 'code' && (
              sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => toggleSort('createdAt')}
            className="flex items-center space-x-2 text-left hover:text-indigo-200 transition-colors"
          >
            <span>Created Date</span>
            {sortField === 'createdAt' && (
              sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => toggleSort('updatedAt')}
            className="flex items-center space-x-2 text-left hover:text-indigo-200 transition-colors"
          >
            <span>Updated Date</span>
            {sortField === 'updatedAt' && (
              sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>
          <div className="text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200">
        {sortedSalespersons.map((salesperson, index) => (
          <div
            key={salesperson.id}
            className={`grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
            }`}
          >
            <div className="flex items-center">
              <div className="text-sm font-medium text-slate-800">
                {salesperson.name}
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                {salesperson.code}
              </span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              {new Date(salesperson.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              {salesperson.updatedAt ? (
                new Date(salesperson.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              ) : (
                <span className="text-slate-400 italic">NULL</span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => onEdit(salesperson)}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                title="Edit salesperson"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(salesperson.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete salesperson"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalespersonTable;
