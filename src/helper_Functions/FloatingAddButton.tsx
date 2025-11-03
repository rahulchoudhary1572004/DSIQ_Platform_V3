import React from 'react';
import { UserPlus } from 'lucide-react';

type IconComponent = React.ComponentType<{ size?: number }>;

export interface FloatingAddButtonProps {
  onClick: () => void;
  label?: string;
  icon?: IconComponent;
  className?: string;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({
  onClick,
  label = 'Add User',
  icon: Icon = UserPlus,
  className = '',
}) => {
  return (
    <>
      <style>{`
        .floating-add-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #D1442F 0%, #E45A2B 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(242, 122, 86, 0.3);
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 50;
          border: none;
          outline: none;
        }
        .floating-add-btn:hover {
          width: 11rem;
          border-radius: 2rem;
          box-shadow: 0 6px 20px rgba(242, 122, 86, 0.4);
        }
        .floating-add-btn .icon {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          transition: all 0.4s;
        }
        .floating-add-btn:hover .icon {
          left: 1.25rem;
          transform: translateX(0) rotate(360deg);
        }
        .floating-add-btn .text {
          position: absolute;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-1rem);
          transition: all 0.4s;
        }
        .floating-add-btn:hover .text {
          opacity: 1;
          transform: translateX(1.75rem);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(242, 122, 86, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(242, 122, 86, 0); }
          100% { box-shadow: 0 0 0 0 rgba(242, 122, 86, 0); }
        }
        .floating-add-btn::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .floating-add-btn:hover::after {
          animation: none;
          opacity: 0;
        }
      `}</style>
      <div className={`floating-add-btn ${className}`} onClick={onClick}>
        <div className="icon">
          <Icon size={24} />
        </div>
        <span className="text font-medium">{label}</span>
      </div>
    </>
  );
};

export default FloatingAddButton;
