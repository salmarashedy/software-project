import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-out ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    } sm:right-4 sm:top-4 md:right-6 md:top-6`}>
      <div className="bg-[#1e1e2f] text-white px-4 py-3 rounded-xl shadow-lg border border-gray-600 max-w-xs sm:max-w-sm">
        {message}
      </div>
    </div>
  );
};

export default Toast;