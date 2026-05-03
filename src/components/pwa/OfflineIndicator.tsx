import { useState, useEffect } from "react";
import { WifiOff, CloudUpload, Check } from "lucide-react";
import { isOnline, onOnlineStatusChange, getPendingUploadsCount } from "../../services/offlineStorage";
import { addSyncListener, syncPendingUploads } from "../../services/syncService";

type PillState = "offline" | "syncing" | "success" | "pending" | "hidden";

const OfflineIndicator = () => {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const unsubOnline = onOnlineStatusChange((status) => {
      setOnline(status);
      if (status) getPendingUploadsCount().then(setPendingCount);
    });

    const unsubSync = addSyncListener((isSyncing, pending) => {
      setSyncing(isSyncing);
      setPendingCount(pending);
      if (!isSyncing && pending === 0) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });

    getPendingUploadsCount().then(setPendingCount);

    return () => { unsubOnline(); unsubSync(); };
  }, []);

  let state: PillState = "hidden";
  if (showSuccess) state = "success";
  else if (syncing) state = "syncing";
  else if (!online) state = "offline";
  else if (pendingCount > 0) state = "pending";

  if (state === "hidden") return null;

  const configs = {
    offline: {
      bg: "bg-orange-500",
      hover: "",
      icon: <WifiOff size={13} />,
      text: `Offline${pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : ""}`,
      onClick: undefined as (() => void) | undefined,
    },
    syncing: {
      bg: "bg-blue-500",
      hover: "",
      icon: <CloudUpload size={13} className="animate-pulse" />,
      text: `Sincronizando ${pendingCount} ${pendingCount === 1 ? "item" : "itens"}…`,
      onClick: undefined,
    },
    success: {
      bg: "bg-green-600",
      hover: "",
      icon: <Check size={13} />,
      text: "Sincronizado!",
      onClick: undefined,
    },
    pending: {
      bg: "bg-yellow-500",
      hover: "hover:bg-yellow-600 cursor-pointer",
      icon: <CloudUpload size={13} />,
      text: `${pendingCount} ${pendingCount === 1 ? "item" : "itens"} · Toque para enviar`,
      onClick: () => syncPendingUploads(),
    },
  };

  const cfg = configs[state];

  return (
    <button
      onClick={cfg.onClick}
      disabled={!cfg.onClick}
      className={[
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg",
        "text-white text-xs font-medium whitespace-nowrap",
        "transition-all duration-300 select-none",
        cfg.bg,
        cfg.hover,
        !cfg.onClick && "cursor-default",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cfg.icon}
      <span>{cfg.text}</span>
    </button>
  );
};

export default OfflineIndicator;
