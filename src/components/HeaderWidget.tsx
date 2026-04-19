import React, { useState, useEffect } from 'react';

const HeaderWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-[#1e1e2f] border border-gray-700 rounded-xl p-4 text-white shadow-lg">
      <div className="text-lg font-medium text-gray-200 mb-1">
        {getGreeting()}!
      </div>
      <div className="text-sm text-gray-400 mb-2">
        {formatDate()}
      </div>
      <div className="text-2xl font-mono font-bold text-violet-400">
        {formatTime()}
      </div>
    </div>
  );
};

export default HeaderWidget;