import { useState, useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdatePrompt = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => r.update(), 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar SW:', error);
    },
    onOfflineReady() {
      setShowOfflineReady(true);
      setTimeout(() => setShowOfflineReady(false), 4000);
    },
  });

  const forceUpdate = () => {
    if (!navigator.onLine) return;
    setIsUpdating(true);
    if ('caches' in window) {
      caches.keys().then((cacheNames: string[]) =>
        Promise.all(cacheNames.map(name => caches.delete(name)))
      ).then(() => location.reload());
    } else {
      location.reload();
    }
  };

  return (
    <>
      {showOfflineReady && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <WifiOff size={16} />
            App pronto para uso offline
          </div>
        </div>
      )}

      {isOnline && (
        <button
          onClick={forceUpdate}
          disabled={isUpdating}
          className={`fixed bottom-4 right-4 z-40 w-12 h-12 bg-[#ffd300] text-[#0d2d6c] rounded-full shadow-lg flex items-center justify-center transition-all hover:bg-[#e6be00] hover:scale-110 ${
            isUpdating ? 'animate-spin cursor-not-allowed' : ''
          }`}
          title="Forçar atualização"
        >
          <RefreshCw size={20} />
        </button>
      )}
    </>
  );
};

export default UpdatePrompt;
