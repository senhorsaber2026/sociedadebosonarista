import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Mic,
  Send,
  Users,
  ThumbsUp,
  Heart,
  ArrowLeft,
  Shield,
  Play,
  Pause,
  X,
  Film,
  Smartphone,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { User, LiveSession, LiveChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface LiveViewProps {
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
}

export const LiveView: React.FC<LiveViewProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth
}) => {
  const [isMyLive, setIsMyLive] = useState(false);
  [isMyLive];
  const [isStreaming, setIsStreaming] = useState(false);
  [isStreaming];
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [activeLives, setActiveLives] = useState<LiveSession[]>([]);
  [activeLives];
  const [selectedLive, setSelectedLive] = useState<LiveSession | null>(null);
  [selectedLive];
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  [chatMessages];
  const [chatInput, setChatInput] = useState('');
  [chatInput];
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('front');
  [selectedCamera];
  const [micEnabled, setMicEnabled] = useState(true);
  [micEnabled];
  const [isLiked, setIsLiked] = useState(false);
  [isLiked];
  const [likes, setLikes] = useState(0);
  [likes];
  const [viewerCount, setViewerCount] = useState(0);
  [viewerCount];

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentLiveIdRef = useRef<string | null>(null);
  const viewerIntervalRef = useRef<number | null>(null);

  const refreshLives = useCallback(() => {
    setActiveLives(storageService.getActiveLives());
  }, []);

  useEffect(() => {
    refreshLives();
  }, [refreshLives]);

  useEffect(() => {
    if (currentUser) {
      const myLive = activeLives.find(l => l.userId === currentUser.id && l.isActive);
      setIsMyLive(!!myLive);
      if (myLive) {
        setSelectedLive(myLive);
        currentLiveIdRef.current = myLive.id;
        setViewerCount(myLive.viewerCount);
        setChatMessages(storageService.getLiveChatMessages(myLive.id));
        setLikes(0);
      } else {
        setIsMyLive(false);
        setSelectedLive(null);
        currentLiveIdRef.current = null;
      }
    } else {
      setIsMyLive(false);
      setSelectedLive(null);
      currentLiveIdRef.current = null;
    }
  }, [currentUser, activeLives]);

  useEffect(() => {
    if (selectedLive && selectedLive.id !== currentLiveIdRef.current) {
      currentLiveIdRef.current = selectedLive.id;
      setViewerCount(selectedLive.viewerCount);
      setChatMessages(storageService.getLiveChatMessages(selectedLive.id));
      storageService.incrementLiveViewers(selectedLive.id);
      setLikes(0);
      setIsLiked(false);
    }
    return () => {
      if (currentLiveIdRef.current) {
        storageService.decrementLiveViewers(currentLiveIdRef.current);
      }
    };
  }, [selectedLive]);

  const handleStartLive = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!liveTitle.trim()) {
      showToast('Informe o título da sua transmissão.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const newLive = storageService.startLive(currentUser.id, liveTitle, liveDescription || undefined);
      setIsStreaming(true);
      setIsMyLive(true);
      setSelectedLive(newLive);
      currentLiveIdRef.current = newLive.id;
      setViewerCount(newLive.viewerCount);
      setChatMessages([]);
      setLikes(0);
      setIsLiked(false);
      showToast('Transmissão ao vivo iniciada!');
    } catch (err) {
      showToast('Não foi possível acessar câmera/microfone.');
    }
  };

  const handleStopLive = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (currentLiveIdRef.current) {
      storageService.stopLive(currentLiveIdRef.current);
      storageService.decrementLiveViewers(currentLiveIdRef.current);
    }
    if (viewerIntervalRef.current) {
      clearInterval(viewerIntervalRef.current);
      viewerIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsMyLive(false);
    setSelectedLive(null);
    currentLiveIdRef.current = null;
    setViewerCount(0);
    setChatMessages([]);
    setLikes(0);
    setIsLiked(false);
    refreshLives();
    showToast('Transmissão encerrada.');
  };

  const handleJoinLive = (live: LiveSession) => {
    setSelectedLive(live);
    currentLiveIdRef.current = live.id;
    setViewerCount(live.viewerCount);
    setChatMessages(storageService.getLiveChatMessages(live.id));
    setLikes(0);
    setIsLiked(false);
    storageService.incrementLiveViewers(live.id);
    showToast(`Assistindo: ${live.title}`);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser || !currentLiveIdRef.current) return;
    storageService.sendLiveChatMessage(currentLiveIdRef.current, currentUser.id, chatInput);
    setChatMessages(storageService.getLiveChatMessages(currentLiveIdRef.current));
    setChatInput('');
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleToggleMic = () => setMicEnabled(!micEnabled);
  const handleSwitchCamera = () => setSelectedCamera(selectedCamera === 'front' ? 'back' : 'front');

  useEffect(() => {
    if (isStreaming && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isStreaming]);

  return (
    <div className="min-h-screen bg-[#07140F] text-[#F5F5F0] flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-[#07140F]/95 backdrop-blur-md border-b border-[#263B30] px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif-patriotic text-lg font-bold text-[#E5AC24] flex items-center gap-2">
          <Video className="w-5 h-5 text-[#D4AF37]" />
          Lives Patrióticas
        </h1>
        <button
          onClick={isMyLive ? handleStopLive : handleStartLive}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            isMyLive
              ? 'bg-[#D94B4B] text-white hover:bg-[#b93a3a] shadow-[0_0_15px_rgba(217,75,75,0.5)] animate-pulse'
              : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg hover:brightness-110'
          }`}
          disabled={!currentUser && !isMyLive}
        >
          {isMyLive ? 'Encerrar Live' : <><Video className="w-4 h-4 mr-1" /> Fazer Live</>}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {currentUser ? (
          <>
            {/* Minha transmissão ao vivo */}
            {isMyLive && selectedLive && (
              <div className="mb-6 bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl overflow-hidden">
                <div className="relative w-full aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#07140F]/80 border border-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                        <Video className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <p className="text-xs text-[#A5B2A9]">Sua transmissão ao vivo</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1.5 rounded-lg border border-[#D4AF37]/50">
                    <div className="w-2 h-2 rounded-full bg-[#D94B4B] animate-pulse" />
                    <span className="text-xs font-bold text-[#E8CC76]">AO VIVO</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F0]">{selectedLive.title}</h3>
                      <p className="text-xs text-[#A5B2A9]">{currentUser.name} • {new Date(selectedLive.startedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
                      {selectedLive.viewerCount} espectadores
                    </span>
                  </div>

                  {selectedLive.description && (
                    <p className="text-sm text-[#F5F5F0] line-clamp-2">{selectedLive.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#263B30]">
                    <button
                      onClick={handleToggleMic}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                        micEnabled ? 'border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0]' : 'border-[#D94B4B] text-[#D94B4B] bg-[#2b1414]'
                      }`}
                      title={micEnabled ? 'Desligar microfone' : 'Ligar microfone'}
                    >
                      <Mic className={`w-5 h-5 ${!micEnabled ? 'text-[#D94B4B]' : ''}`} />
                      <span className="text-[10px]">{micEnabled ? 'Mic' : 'Mic Off'}</span>
                    </button>
                    <button
                      onClick={handleSwitchCamera}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0] transition"
                      title="Trocar câmera"
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-[10px]">Câmera</span>
                    </button>
                    <button
                      onClick={handleStopLive}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#D94B4B] text-[#D94B4B] hover:bg-[#2b1414] transition"
                      title="Encerrar transmissão"
                    >
                      <X className="w-5 h-5" />
                      <span className="text-[10px]">Encerrar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form para iniciar live */}
            {!isMyLive && (
              <div className="mb-6 bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl p-6">
                <h3 className="text-sm font-bold text-[#E5AC24] mb-4 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Iniciar Transmissão ao Vivo
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="Título da sua live (ex: Brasil Acima de Tudo!)"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <textarea
                    value={liveDescription}
                    onChange={(e) => setLiveDescription(e.target.value)}
                    placeholder="Descrição (opcional)"
                    rows={2}
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    onClick={handleStartLive}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 text-[#07140F]" />
                    <span>Ir ao Vivo Agora</span>
                  </button>
                </div>
                <p className="text-[10px] text-[#A5B2A9] mt-3 text-center">
                  Somente membros cadastrados podem fazer transmissões ao vivo.
                </p>
              </div>
            )}

            {/* Lives em andamento de outros usuários */}
            {!isMyLive && activeLives.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#E5AC24] flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Lives em Andamento
                  </h3>
                  <span className="text-[10px] text-[#A5B2A9]">{activeLives.length} ao vivo</span>
                </div>
                <div className="space-y-3">
                  {activeLives.map((live) => (
                    <div
                      key={live.id}
                      onClick={() => handleJoinLive(live)}
                      className="bg-[#102019] border border-[#263B30] rounded-2xl overflow-hidden cursor-pointer transition hover:border-[#D4AF37]/50 group"
                    >
                      <div className="relative aspect-video bg-black">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#07140F]/90 border border-[#D4AF37] flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#07140F]/80 px-2 py-0.5 rounded-lg border border-[#D4AF37]/40">
                          <div className="w-2 h-2 rounded-full bg-[#D94B4B] animate-pulse" />
                          <span className="text-[10px] font-bold text-[#E8CC76]">AO VIVO</span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-[#07140F]/80 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] font-bold text-[#F5F5F0]">{live.viewerCount}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={live.userAvatar} alt={live.userName} className="w-8 h-8 rounded-full object-cover border border-[#263B30]" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#F5F5F0] truncate">{live.userName}</h4>
                          </div>
                        </div>
                        <h5 className="text-sm font-semibold text-[#F5F5F0] line-clamp-1 mb-1">{live.title}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-[#A5B2A9]">
                          <Users className="w-3 h-3" />
                          <span>{live.viewerCount} assistindo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isMyLive && activeLives.length === 0 && (
              <div className="mb-6 flex flex-col items-center justify-center text-center py-12 bg-[#102019] border border-[#263B30] rounded-3xl">
                <Video className="w-16 h-16 text-[#263B30] mb-4" />
                <p className="text-xs text-[#A5B2A9] max-w-md">
                  Nenhuma transmissão ao vivo no momento. Seja o primeiro a fazer uma live patriótica!
                </p>
              </div>
            )}

            {/* Sala de chat da live ativa */}
            {selectedLive && !isMyLive && (
              <div className="bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl flex flex-col h-[60vh]">
                <div className="p-4 border-b border-[#263B30] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-[#F5F5F0]">Chat ao Vivo</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
                    {selectedLive.viewerCount} espectadores
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-[11px] text-[#A5B2A9]">
                      <div className="w-10 h-10 rounded-full bg-[#15291F] border border-[#263B30] flex items-center justify-center mx-auto mb-3 text-[#A5B2A9]">
                        <Video className="w-5 h-5" />
                      </div>
                      <p>Bate-papo ao vivo. Seja o primeiro a comentar!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#174D32] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {msg.userName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#F5F5F0]">{msg.userName}</div>
                          <div className="text-[11px] text-[#A5B2A9]">{msg.message}</div>
                          <div className="text-[9px] text-[#A5B2A9]/60 mt-0.5">{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-[#263B30] p-3 bg-[#0b1712]">
                  <form onSubmit={handleSendChat} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="flex-1 bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-3 py-2 rounded-xl bg-[#174D32] text-[#E8CC76] font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition hover:bg-[#1f6643]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Video className="w-16 h-16 text-[#263B30] mb-4" />
            <h3 className="font-serif-patriotic text-lg font-bold text-[#F5F5F0] mb-2">
              Faça login para acessar Lives
            </h3>
            <p className="text-xs text-[#A5B2A9] mb-6 max-w-md">
              Entre com sua conta de membro para assistir e fazer transmissões ao vivo patrióticas.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs shadow hover:brightness-110 transition"
            >
              Entrar / Cadastrar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
