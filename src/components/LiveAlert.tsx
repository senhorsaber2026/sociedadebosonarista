import React, { useEffect, useRef, useState } from 'react';
import { Activity, Volume2, VolumeX, Mic, AlertTriangle } from 'lucide-react';

interface LiveAlertProps {
  isLive: boolean;
  liveTitle?: string;
  liveUser?: string;
}

export const LiveAlert: React.FC<LiveAlertProps> = ({ isLive, liveTitle, liveUser }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  useEffect(() => {
    if (isLive && !audio) {
      const beep = new Audio('data:audio/wav;base64,UklGRlAAAAEAQXBVAAAAAgAAABAAAABAAAABBhYAAEAAB3cNDlOT8hISFhYV9oY2hlbnVtYWwAAA==');
      beep.loop = true;
      setAudio(beep);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [isLive, audio]);

  useEffect(() => {
    if (isLive && audio && !muted) {
      audio.play().catch(() => {});
      setAlertActive(true);
    } else if (!isLive && audio) {
      audio.pause();
      setAlertActive(false);
    }
  }, [isLive, audio, muted]);

  const toggleMute = () => {
    setMuted(!muted);
    if (audio) {
      if (muted) audio.play().catch(() => {});
      else audio.pause();
    }
  };

  if (!isLive) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2.5 rounded-full bg-red-900/95 border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(139,0,0,0.8)] animate-pulse">
      {/* Luz vermelha piscando */}
      <div className="w-3 h-3 rounded-full bg-[#D94B4B] shadow-[0_0_12px_rgba(217,75,75,0.9)] animate-ping" />
      <div className="flex items-center gap-1.5">
        <Activity className="w-4 h-4 text-[#D94B4B] animate-pulse" />
        <span className="text-xs font-black text-[#FFF5D0] tracking-wider uppercase">
          AO VIVO AGORA
        </span>
        {liveUser && (
          <span className="text-xs font-bold text-[#E8CC76] truncate max-w-xs">{liveUser}</span>
        )}
        {liveTitle && (
          <span className="text-[10px] text-[#A5B2A9] truncate max-w-sm">• {liveTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          onClick={toggleMute}
          className="w-6 h-6 rounded-full bg-black/40 hover:bg-[#D94B4B]/80 flex items-center justify-center text-xs transition"
          title={muted ? 'Ativar som do alerta' : 'Silenciar alerta'}
        >
          {muted ? <VolumeX className="w-3 h-3 text-[#A5B2A9]" /> : <Volume2 className="w-3 h-3 text-[#D94B4B]" />}
        </button>
      </div>
    </div>
  );
};
