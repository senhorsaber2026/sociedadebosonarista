import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createLocalTracks,
  Room,
  RemoteTrack,
  RemoteParticipant,
  ConnectionQuality,
  RoomEvent,
  ParticipantEvent,
  TrackEvent,
  LogLevel,
} from 'livekit-client';
import {
  Video,
  MicOff,
  Volume2,
  Volume1,
  VolumeX,
  Expand,
  Users,
  Signal,
  Play,
  Pause,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  StopCircle,
} from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';
import { LiveChat } from './LiveChat';

interface LivePlayerViewProps {
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth?: () => void;
  liveSession?: any;
}

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || '';
const API_BASE = import.meta.env.VITE_API_BASE || '';

export const LivePlayerView: React.FC<LivePlayerViewProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth,
  liveSession: initialSession,
}) => {
  // Estados da sala
  const [session, setSession] = useState<any>(initialSession || null);
  const [token, setToken] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [remoteTracks, setRemoteTracks] = useState<Map<string, RemoteTrack>>(new Map());
  const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [stage, setStage] = useState<'connecting' | 'live' | 'ended' | 'error'>('connecting');

  // Estados do chat
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Gerar identidade de visitante se não existir
  useEffect(() => {
    if (!visitorId) {
      const stored = sessionStorage.getItem('sb_visitor_id');
      const id = stored || `visitor_${Math.random().toString(36).slice(2, 14)}`;
      sessionStorage.setItem('sb_visitor_id', id);
      setVisitorId(id);
    }
  }, [visitorId]);

  // Obter token de espectador
  const fetchViewerToken = useCallback(async (roomName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/live-token/viewer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });
      if (!response.ok) throw new Error('Falha ao obter token de espectador.');
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error('Erro ao buscar token de espectador:', err);
      setError('Não foi possível conectar à transmissão.');
      return null;
    }
  }, [API_BASE]);

  // Carregar dados da sessão
  const loadSession = useCallback(async (roomName?: string) => {
    try {
      if (roomName) {
        const response = await fetch(`${API_BASE}/api/live-sessions?room_name=${encodeURIComponent(roomName)}`);
        // Este endpoint não existe diretamente, usamos GET por ID ou listagem
        // Para simplificar, assumimos que a sessão já vem como prop
      }
    } catch (e) {
      console.error('Erro ao carregar sessão:', e);
    }
  }, [API_BASE]);

  // Conectar à sala como espectador
  const connectToRoom = useCallback(async (jwt: string, rName: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      setStage('connecting');

      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = r;

      r.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStage('live');
        setIsPlaying(true);
      });

      r.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (stage === 'live') setStage('ended');
      });

      r.on(RoomEvent.Reconnecting, () => {
        setIsConnecting(true);
        setStage('connecting');
      });

      r.on(RoomEvent.Reconnected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStage('live');
      });

      r.on(RoomEvent.ParticipantConnected, (participant) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.set(participant.identity, participant);
          return next;
        });
        setViewerCount((prev) => prev + 1);
      });

      r.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setParticipants(prev => {
          const next = new Map(prev);
          next.delete(participant.identity);
          return next;
        });
        setViewerCount((prev) => Math.max(0, prev - 1));
      });

      r.on(ParticipantEvent.TrackPublished, (publication, participant) => {
        const track = publication.track;
        if (track && track.sid) {
          const sid = track.sid;
          setRemoteTracks(prev => {
            const next = new Map(prev);
            next.set(sid, track);
            return next;
          });
        }
      });

      r.on(ParticipantEvent.TrackUnpublished, (publication) => {
        setRemoteTracks(prev => {
          const next = new Map(prev);
          next.delete(publication.track?.sid || '');
          return next;
        });
      });

      r.on(ParticipantEvent.TrackSubscribed, (track) => {
        if (!track.sid) return;
        const sid = track.sid;
        setRemoteTracks(prev => {
          const next = new Map(prev);
          next.set(sid, track);
          return next;
        });
      });

      r.on(ParticipantEvent.TrackUnsubscribed, (track) => {
        if (!track.sid) return;
        const sid = track.sid;
        setRemoteTracks(prev => {
          const next = new Map(prev);
          next.delete(sid);
          return next;
        });
      });

      await r.connect(LIVEKIT_URL, jwt, {
        autoSubscribe: true,
      });

      setRoom(r);

      // Atualizar qualidade
      const qualityInterval = setInterval(() => {
        for (const [, participant] of participants) {
          const videoPubs = (participant as any).videoTracks;
          for (const [, publication] of videoPubs) {
            const track = publication.track;
            if (track) {
              setConnectionQuality(track.quality);
              return;
            }
          }
        }
      }, 5000);

      return () => clearInterval(qualityInterval);
    } catch (err: any) {
      setIsConnecting(false);
      setStage('error');
      setError(err instanceof Error ? err.message : 'Erro ao conectar à transmissão.');
    }
  }, [stage, participants, LIVEKIT_URL, API_BASE]);

  // Conectar ao montar se houver sessão
  useEffect(() => {
    if (session?.room_name && visitorId && !isConnected && !isConnecting) {
      fetchViewerToken(session.room_name).then(jwt => {
        if (jwt) {
          setToken(jwt);
          connectToRoom(jwt, session.room_name);
        }
      });
    }
  }, [session, visitorId, isConnected, isConnecting, fetchViewerToken, connectToRoom]);

  // Carregar histórico do chat
  useEffect(() => {
    if (session?.id) {
      loadChatHistory(session.id);
    }
  }, [session?.id]);

  const loadChatHistory = async (liveSessionId: string) => {
    try {
      setChatLoading(true);
      const response = await fetch(`${API_BASE}/api/live-chat/history?liveSessionId=${encodeURIComponent(liveSessionId)}&limit=50`);
      if (response.ok) {
        const messages = await response.json();
        setChatMessages(messages);
      }
    } catch (e) {
      console.error('Erro ao carregar chat:', e);
    } finally {
      setChatLoading(false);
    }
  };

  // Registrar presença do espectador
  useEffect(() => {
    if (session?.id && visitorId) {
      fetch(`${API_BASE}/api/live-viewer-presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId: session.id,
          participantIdentity: visitorId,
        }),
      }).catch(e => console.error('Erro ao registrar presença:', e));
    }
    return () => {
      // Marcar saída ao desmontar
      if (session?.id && visitorId) {
        fetch(`${API_BASE}/api/live-viewer-presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            liveSessionId: session.id,
            participantIdentity: visitorId,
          }),
        }).catch(() => {});
      }
    };
  }, [session?.id, visitorId, API_BASE]);

  // Enviar mensagem de chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !session?.id || !visitorId) return;

    const displayName = currentUser ? currentUser.name : `Visitante ${visitorId.slice(-6)}`;

    setChatInput('');
    try {
      const response = await fetch(`${API_BASE}/api/live-chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId: session.id,
          senderUserId: currentUser?.id || undefined,
          visitorId: currentUser ? undefined : visitorId,
          displayName: displayName.substring(0, 80),
          message: chatInput.trim(),
        }),
      });
      if (response.ok) {
        const msg = await response.json();
        setChatMessages(prev => [...prev, msg]);
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
    }
  };

  // Denunciar mensagem
  const handleReportMessage = async (messageId: string, reason: string) => {
    if (!session?.id || !visitorId) return;
    try {
      await fetch(`${API_BASE}/api/live-chat/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId: session.id,
          messageId,
          reporterIdentity: visitorId,
          reason,
        }),
      });
      showToast('Denúncia enviada para moderação.');
    } catch (e) {
      console.error('Erro ao denunciar:', e);
    }
  };

  // Alternar mudo
  const toggleMute = () => {
    setIsMuted(!isMuted);
    const videoEl = videoContainerRef.current?.querySelector('video');
    if (videoEl) videoEl.muted = isMuted;
  };

  // Alternar tela cheia
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!isFullscreen) {
      try {
        videoContainerRef.current.requestFullscreen?.();
      } catch {}
      setIsFullscreen(true);
    } else {
      try {
        document.exitFullscreen?.();
      } catch {}
      setIsFullscreen(false);
    }
  };

  // Sair da transmissão
  const handleLeave = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    setRoom(null);
    setIsConnected(false);
    setToken(null);
    onNavigate('live');
  };

  const qualityColor = (q: ConnectionQuality | null) => {
    switch (q) {
      case ConnectionQuality.Excellent: return 'text-[#34A853]';
      case ConnectionQuality.Good: return 'text-[#E8CC76]';
      case ConnectionQuality.Poor: return 'text-[#D94B4B]';
      default: return 'text-[#A5B2A9]';
    }
  };

  const qualityLabel = (q: ConnectionQuality | null) => {
    switch (q) {
      case ConnectionQuality.Excellent: return 'Excelente';
      case ConnectionQuality.Good: return 'Boa';
      case ConnectionQuality.Poor: return 'Ruim';
      default: return 'Conectando...';
    }
  };

  const displayName = currentUser ? currentUser.name : `Visitante ${visitorId?.slice(-6)}`;
  const isHost = Boolean(currentUser && session?.hostUserId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#07140F] text-[#F5F5F0] flex flex-col">
      {stage === 'error' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#102019] border border-[#D94B4B]/50 rounded-3xl p-8 sm:p-12 text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#D94B4B]" />
            <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0] mb-2">
              Erro de Conexão
            </h2>
            <p className="text-xs sm:text-sm text-[#A5B2A9] mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-[#174D32] hover:bg-[#1f6643] text-[#E8CC76] font-bold text-xs shadow-lg transition"
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Tentar Novamente
              </button>
              <button
                onClick={handleLeave}
                className="px-5 py-2.5 rounded-xl border border-[#263B30] text-[#A5B2A9] font-bold text-xs hover:bg-[#15291F] transition"
              >
                <X className="w-4 h-4 mr-1" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {stage !== 'error' && (
        <>
          <header className="sticky top-0 z-40 w-full bg-[#07140F]/95 backdrop-blur-md border-b border-[#263B30] px-4 py-3 flex items-center justify-between shadow-md">
            <button
              onClick={handleLeave}
              className="p-2 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
              title="Sair da transmissão"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${stage === 'live' ? 'bg-[#D94B4B] text-white animate-pulse' : 'bg-[#15291F] text-[#A5B2A9]'} text-[10px] font-bold border border-transparent ${stage === 'live' ? 'border-[#D94B4B]/40' : 'border-[#263B30]'}`}>
                <span className={`w-2 h-2 rounded-full ${stage === 'live' ? 'bg-white' : 'bg-[#A5B2A9]'} animate-pulse mr-1.5`} />
                {stage === 'live' ? 'AO VIVO' : 'Conectando...'}
              </span>
              <span className="hidden sm:block text-xs text-[#A5B2A9]">{session?.title || 'Transmissão'}</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Layout Desktop: Player à esquerda, chat à direita */}
              <div className="lg:flex lg:gap-6">
                <div className="lg:w-3/4 space-y-4">
                  {/* Player de vídeo */}
                  <div className={`relative aspect-video bg-black rounded-xl overflow-hidden border border-[#263B30] shadow-xl ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen bg-black' : ''}`} ref={videoContainerRef}>
                    {isConnected && stage === 'live' ? (
                      <>
                        <div ref={el => {
                          // Attach remote video tracks
                          if (el) {
                            remoteTracks.forEach(track => {
                              if (track.kind === 'video' && track.sid) {
                                const existing = el.querySelector(`[data-track="${track.sid}"]`);
                                if (!existing) {
                                  const div = document.createElement('div');
                                  div.setAttribute('data-track', track.sid);
                                  div.className = 'w-full h-full object-cover';
                                  el.appendChild(div);
                                  track.attach(div as unknown as HTMLMediaElement);
                                }
                              }
                            });
                          }
                        }} className="w-full h-full" />

                        {/* Sobreposição de controle */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                          <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1 rounded-xl border border-[#D4AF37]/30 backdrop-blur-sm pointer-events-auto">
                            <span className="w-2 h-2 rounded-full bg-[#D94B4B] animate-pulse mr-1.5" />
                            <span className="text-[10px] font-bold text-[#E8CC76]">AO VIVO</span>
                          </div>
                          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1.5 rounded-xl border border-[#263B30] backdrop-blur-sm pointer-events-auto">
                            <span className={`text-xs font-bold ${qualityColor(connectionQuality)}`}>
                              {qualityLabel(connectionQuality)}
                            </span>
                          </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none opacity-50 transition-opacity duration-300" id="play-overlay">
                          {!isPlaying && (
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        )}
                        </div>

                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1 rounded-xl border border-[#263B30] backdrop-blur-sm pointer-events-auto">
                          <Users className="w-3 h-3 text-[#E8CC76] mr-1" />
                          <span className="text-[10px] font-bold text-[#F5F5F0]">{viewerCount} espectadores</span>
                        </div>

                        <div className="absolute top-4 right-4 flex gap-1 px-2 pointer-events-auto">
                          <button
                            onClick={toggleMute}
                            className="p-2 rounded bg-[#15291F] border border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#174D32] transition"
                            title={isMuted ? 'Ativar som' : 'Silenciar'}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded bg-[#15291F] border border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#174D32] transition"
                            title={isFullscreen ? 'Sair tela cheia' : 'Tela cheia'}
                          >
                            <Expand className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : stage === 'ended' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                        <StopCircle className="w-16 h-16 text-[#D94B4B] mb-4" />
                        <h3 className="font-serif-patriotic text-lg font-bold text-[#F5F5F0] mb-2">
                          Transmissão Encerrada
                        </h3>
                        <p className="text-xs text-[#A5B2A9] max-w-xs mx-auto">
                          Obrigado por assistir. Esta transmissão foi finalizada pelo apresentador.
                        </p>
                        <button
                          onClick={handleLeave}
                          className="mt-4 px-5 py-2 rounded-xl bg-[#174D32] text-[#E8CC76] font-bold text-xs hover:bg-[#1f6643] transition"
                        >
                          Voltar às Transmissões
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                        <RefreshCw className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                        <p className="text-xs text-[#A5B2A9]">Conectando à transmissão...</p>
                      </div>
                    )}
                  </div>

                  {/* Informações da transmissão */}
                  <div className="bg-[#102019] border border-[#263B30] rounded-3xl p-4 space-y-4">
                    <div>
                      <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">{session?.title}</h2>
                      {session?.description && (
                        <p className="text-sm text-[#A5B2A9] mt-1 line-clamp-2">{session.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A5B2A9]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#15291F] border border-[#263B30] flex items-center justify-center text-[10px] font-bold">
                          {session?.hostUserName?.charAt(0) || '?'}
                        </div>
                        <span>Por {session?.hostUserName}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{new Date(session?.startedAt || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Chat lateral (desktop) */}
                <div className="lg:w-1/4 space-y-4 hidden lg:block">
                  <LiveChat
                    session={session}
                    currentUser={currentUser}
                    visitorId={visitorId || undefined}
                    messages={chatMessages}
                    onSend={handleSendChat}
                    onReport={handleReportMessage}
                    isHost={isHost}
                  />
                </div>
              </div>

              {/* Layout Mobile: Chat abaixo do player */}
              <div className="lg:hidden space-y-4">
                <LiveChat
                  session={session}
                  currentUser={currentUser}
                  visitorId={visitorId || undefined}
                  messages={chatMessages}
                  onSend={handleSendChat}
                  onReport={handleReportMessage}
                  isHost={isHost}
                />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};
