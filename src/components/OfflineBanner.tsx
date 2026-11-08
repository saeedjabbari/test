import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 shadow-sm">
      <WifiOff className="w-3.5 h-3.5" />
      <span>حالت آفلاین — اطلاعات مراکز درمانی از حافظه دستگاه در دسترس است.</span>
    </div>
  );
};
