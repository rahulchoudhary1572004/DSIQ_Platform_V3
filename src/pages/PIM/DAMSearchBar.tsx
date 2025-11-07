// components/DAM/DAMSearchBar.tsx - ABSOLUTELY LOCKED
import React, { FC } from "react";
import { Search } from "lucide-react";

interface DAMSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DAMSearchBar: FC<DAMSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search assets by name, format...",
}) => {
  return (
    <div className="px-8 py-4 border-b border-gray-100 bg-white flex-shrink-0 h-14 sticky top-0">
      <div className="flex items-center justify-center h-full">
        {/* Exactly 320px fixed width - NEVER changes */}
        <div className="w-80">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300 pointer-events-none flex-shrink-0"
              style={{ width: "20px", height: "20px" }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors duration-300 shadow-sm font-normal"
              style={{
                height: "40px",
                boxSizing: "border-box",
                WebkitBoxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAMSearchBar;
