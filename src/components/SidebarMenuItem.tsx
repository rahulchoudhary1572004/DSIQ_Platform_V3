import React from 'react';

const SidebarMenuItem = ({
  icon,
  label,
  isActive = false,
  isOpen = true
}) => {
  return (
    <div
      className={`flex items-center px-4 py-2 mx-2 text-[#A3A1B1] hover:text-white hover:bg-[#1E1A2E] rounded transition-colors duration-200 cursor-pointer ${isActive ? 'bg-[#1E1A2E] text-white' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

export default SidebarMenuItem;