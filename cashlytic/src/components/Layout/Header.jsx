import React from 'react';
import { Shield } from 'lucide-react';

const Header = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Header;