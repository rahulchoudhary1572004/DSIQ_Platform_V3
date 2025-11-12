                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

const ProfileDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const handleSignOut = async () => {
    await dispatch(logoutUser() as any);
    onClose();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: <User size={12} className="text-gray" />,
      label: "Your Profile",
      action: () => {
        onClose();
        navigate('/profile');
      }
    },
    {
      icon: <LogOut size={12} className="text-danger-red" />,
      label: "Sign Out",
      action: handleSignOut
    }
  ];

  return (
    <div className="bg-white rounded-md w-42">
      {/* User Info Section */}
      <div className="px-3 py-[9px] border-b border-light-gray bg-cream">
        <p className="text-[9px] text-gray uppercase">Signed in as</p>
        <div className="flex items-center justify-between mt-[3px]">
          <p className="text-[10.5px] font-medium text-dark-gray">{user?.first_name} {user?.last_name}</p>
        </div>
        <p className="text-[9px] text-gray">{user?.email}</p>
      </div>

      {/* Menu Items */}
      <div>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`flex items-center justify-between w-full px-3 py-[9px] text-[10.5px] text-left ${
              item.label === "Sign Out" 
                ? "text-danger-red hover:bg-peach" 
                : "text-dark-gray hover:bg-peach"
            } transition-colors`}
          >
            <div className="flex items-center space-x-[9px]">
              <span className="flex items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.label !== "Sign Out" && (
              <ChevronRight size={12} className="text-gray" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileDropdown;