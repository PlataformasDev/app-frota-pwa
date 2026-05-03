import { useState } from "react";
import { WifiOff } from "lucide-react";
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdatePrompt = () => {
  const [showOfflineReady, setShowOfflineReady] = useState(false);

  const { updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (!r) return;

      // Checa atualização imediatamente ao voltar online
      const handleOnline = () => r.update();
      window.addEventListener('online', handleOnline);

      // Checa atualização ao trazer o app para o foreground
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          r.update();
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      // Fallback: checa a cada 30 minutos enquanto online
      const interval = setInterval(() => {
        if (navigator.onLine) r.update();
      }, 30 * 60 * 1000);

      // Cleanup ao desmontar (improvável, mas correto)
      r.addEventListener('updatefound', () => {
        // SW novo encontrado — o skipWaiting no SW cuida do resto
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearInterval(interval);
      };
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar SW:', error);
    },
    onOfflineReady() {
      setShowOfflineReady(true);
      setTimeout(() => setShowOfflineReady(false), 5000);
    },
    onNeedRefresh() {
      // Novo SW pronto: atualiza e recarrega automaticamente
      updateServiceWorker(true);
    },
  });

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
    </>
  );
};

export default UpdatePrompt;
