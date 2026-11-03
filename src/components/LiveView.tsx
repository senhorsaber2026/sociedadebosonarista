import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  Send, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  ArrowLeft,
  Shield,
  Play,
  Pause,
  X,
  Film,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
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
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; message: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<'front' | 'back'>('front');
  const [micEnabled, setMicEnabled] = useState(true);
  const [isMyLive, setIsMyLive] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const streamers = [
    { id: '1', name: 'Coronel Silva', avatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png', viewers: 1240, title: 'Brasil Acima de Tudo!', live: true, verified: true },
    { id: '2', name: 'Patriota RJ', avatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png', viewers: 560, title: 'Debate sobre Liberdade', live: true, verified: false },
    { id: '3', name: 'Direita SP', avatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png', viewers: 320, title: 'Notícias do Congresso', live: true, verified: true },
  ];

  useEffect(() => {
    setViewerCount(isMyLive ? Math.floor(Math.random() * 500) + 50 : 0);
  }, [isMyLive]);

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
      setIsStreaming(true);
      setIsMyLive(true);
      setIsLiveActive(true);
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
    setIsStreaming(false);
    setIsMyLive(false);
    setIsLiveActive(false);
    showToast('Transmissão encerrada.');
  };

  const handleJoinLive = (streamer: any) => {
    setIsLiveActive(true);
    setIsMyLive(false);
    setViewerCount(streamer.viewers);
    showToast(`Assistindo: ${streamer.title}`);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: currentUser.name,
      message: chatInput,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleToggleMic = () => setMicEnabled(!micEnabled);
  const handleSwitchCamera = () => setSelectedCamera(selectedCamera === 'front' ? 'back' : 'front');

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
            {isMyLive && (
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
                    {streamRef.current ? (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[#07140F]/80 border border-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                          <Video className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <p className="text-xs text-[#A5B2A9]">Sua transmissão ao vivo</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#A5B2A9]">
                        <Video className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">Conectando câmera...</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1.5 rounded-lg border border-[#D4AF37]/50">
                    <div className="w-2 h-2 rounded-full bg-[#D94B4B] animate-pulse" />
                    <span className="text-xs font-bold text-[#E8CC76]">AO VIVO</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F0]">{liveTitle || 'Minha Transmissão'}</h3>
                      <p className="text-xs text-[#A5B2A9]">{currentUser.name} • {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
                      {viewerCount} espectadores
                    </span>
                  </div>

                  {liveDescription && (
                    <p className="text-sm text-[#F5F5F0] line-clamp-2">{liveDescription}</p>
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
            {!isMyLive && !isLiveActive && (
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

            {/* Lives em andamento */}
            {!isMyLive && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#E5AC24] flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Lives em Andamento
                  </h3>
                  <span className="text-[10px] text-[#A5B2A9]">{streamers.filter(s => s.live).length} ao vivo</span>
                </div>
                <div className="space-y-3">
                  {streamers.filter(s => s.live).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleJoinLive(s)}
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
                          <span className="text-[10px] font-bold text-[#F5F5F0]">{s.viewers}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-[#263B30]" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#F5F5F0] truncate">{s.name}</h4>
                            {s.verified && <Shield className="w-3 h-3 text-[#D4AF37] text-[#D4AF37]" />}
                          </div>
                        </div>
                        <h5 className="text-sm font-semibold text-[#F5F5F0] line-clamp-1 mb-1">{s.title}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-[#A5B2A9]">
                          <Users className="w-3 h-3" />
                          <span>{s.viewers} assistindo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sala de chat da live ativa */}
            {isLiveActive && !isMyLive && (
              <div className="bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl flex flex-col h-[60vh]">
                <div className="p-4 border-b border-[#263B30] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-[#F5F5F0]">Chat ao Vivo</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
                    {viewerCount} espectadores
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
                          {msg.user.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#F5F5F0]">{msg.user}</div>
                          <div className="text-[11px] text-[#A5B2A9]">{msg.message}</div>
                          <div className="text-[9px] text-[#A5B2A9]/60 mt-0.5">{msg.time}</div>
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
