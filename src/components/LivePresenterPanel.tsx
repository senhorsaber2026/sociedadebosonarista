import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createLocalTracks,
  Room,
  LocalTrack,
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
  Mic,
  MicOff,
  VideoOff,
  Play,
  StopCircle,
  RefreshCw,
  Users,
  Signal,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  Shield,
  RefreshCw as RefreshIcon,
} from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface LivePresenterPanelProps {
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onClose: () => void;
}

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || process.env.LIVEKIT_URL || '';
const API_BASE = import.meta.env.VITE_API_BASE || process.env.APP_URL || '';

export const LivePresenterPanel: React.FC<LivePresenterPanelProps> = ({
  currentUser,
  onNavigate,
  onClose,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isModerator = currentUser?.role === 'moderator';
  const canPresent = isAdmin || isModerator;

  if (!canPresent) {
    return (
      <div className="min-h-screen bg-[#07140F] text-[#F5F5F0] flex flex-col items-center justify-center p-6">
        <div className="bg-[#102019] border border-[#D94B4B]/50 rounded-3xl p-8 sm:p-12 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-[#D94B4B]" />
          <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0] mb-2">
            Acesso Restrito a Apresentadores
          </h2>
          <p className="text-xs sm:text-sm text-[#A5B2A9] mb-6">
            Apenas administradores e moderadores podem iniciar transmissões ao vivo com câmera e microfone.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#174D32] hover:bg-[#1f6643] text-[#E8CC76] font-bold text-xs shadow-lg transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Estados da interface
  const [stage, setStage] = useState<'setup' | 'live' | 'ending'>('setup');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    coverImage: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados de mídia
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalTrack | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  // Estados da sala LiveKit
  const [room, setRoom] = useState<Room | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const roomRef = useRef<Room | null>(null);
  const tracksRef = useRef<(LocalTrack | RemoteTrack)[]>([]);

  const CATEGORIES = ['Política', 'Brasil', 'Economia', 'Segurança Pública', 'Educação', 'Saúde', 'Opinião', 'Internacional'];

  // Detectar dispositivos de câmera e microfone
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      setCameraDevices(videoDevices);
      setMicrophoneDevices(audioDevices);
      if (videoDevices.length > 0 && !selectedCameraId) setSelectedCameraId(videoDevices[0].deviceId);
      if (audioDevices.length > 0 && !selectedMicId) setSelectedMicId(audioDevices[0].deviceId);
    } catch (err) {
      console.error('Erro ao listar dispositivos:', err);
      setError('Não foi possível listar câmeras e microfones disponíveis.');
    }
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  // Obter token do apresentador via API
  const fetchPresenterToken = useCallback(async (sessionId: string, rName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/live-token/presenter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: rName, userId: currentUser!.id }),
      });
      if (!response.ok) throw new Error('Falha ao obter token de apresentador.');
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error('Erro ao buscar token:', err);
      setError(err instanceof Error ? err.message : 'Erro ao obter token de apresentador.');
      return null;
    }
  }, [currentUser, API_BASE]);

  // Criar tracks locais de câmera e microfone
  const createTracks = useCallback(async () => {
    try {
      setError(null);
      const constraints: any = {
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
      };
      const tracks = await createLocalTracks(constraints);
      const videoTrack = tracks.find(t => t.kind === 'video');
      const audioTrack = tracks.find(t => t.kind === 'audio');
      setLocalVideoTrack(videoTrack || null);
      setLocalAudioTrack(audioTrack || null);
    } catch (err: any) {
      console.error('Erro ao criar tracks:', err);
      setError('Não foi possível acessar câmera e microfone. Verifique as permissões do navegador.');
      throw err;
    }
  }, [selectedCameraId, selectedMicId]);

  // Conectar à sala LiveKit
  const connectToRoom = useCallback(async (token: string, rName: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = r;

      r.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStage('live');
        showToast('Conectado à sala de transmissão.');
      });

      r.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsConnecting(false);
        showToast('Desconectado da sala.');
      });

      r.on(RoomEvent.Reconnected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        showToast('Reconectado à sala.');
      });

      r.on(RoomEvent.Reconnecting, () => {
        setIsConnecting(true);
        showToast('Reconectando...');
      });

      r.on(RoomEvent.ParticipantConnected, (participant) => {
        setViewerCount((prev) => prev + 1);
      });

      r.on(RoomEvent.ParticipantDisconnected, () => {
        setViewerCount((prev) => Math.max(0, prev - 1));
      });

      r.on(RoomEvent.ActiveSpeakersChanged, () => {
        // não usado por enquanto
      });

      r.on(ParticipantEvent.TrackSubscribed, (track, publication, participant) => {
        // Track remoto inscrito - não usado pelo apresentador
      });

      await r.connect(LIVEKIT_URL, token, {
        autoSubscribe: true,
      });

      setRoom(r);

      // Publicar tracks locais
      if (localVideoTrack) await r.localParticipant.publishTrack(localVideoTrack);
      if (localAudioTrack) await r.localParticipant.publishTrack(localAudioTrack);

      // Atualizar qualidade de conexão periodicamente
      const qualityInterval = setInterval(() => {
        const participant = r.localParticipant;
        const trackPub = Array.from((r.localParticipant as any).videoTracks.values())[0];
        if (trackPub && (trackPub as any).track) {
          setConnectionQuality((trackPub as any).track.quality);
        }
      }, 5000);

      return () => clearInterval(qualityInterval);
    } catch (err: any) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : 'Erro ao conectar à sala de transmissão.');
      throw err;
    }
  }, [localVideoTrack, localAudioTrack, LIVEKIT_URL]);

  // Iniciar transmissão
  const startStream = async () => {
    if (!form.title.trim()) {
      setError('Informe o título da transmissão.');
      return;
    }
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Criar tracks de mídia primeiro (solicita permissões do navegador)
      await createTracks();

      // Criar sessão no banco via API
      const response = await fetch(`${API_BASE}/api/live-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          category: form.category || undefined,
          roomName: `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          hostUserId: currentUser.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao criar sessão de transmissão.');
      }

      const session = await response.json();
      setSessionId(session.id);
      setRoomName(session.room_name);

      // Obter token de apresentador
      const jwt = await fetchPresenterToken(session.id, session.room_name);
      if (!jwt) throw new Error('Falha ao obter token de apresentador.');
      setToken(jwt);

      // Conectar à sala
      await connectToRoom(jwt, session.room_name);

      setLoading(false);
      showToast('Transmissão iniciada com sucesso!');
    } catch (err: any) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Erro ao iniciar transmissão.');
      // Liberar tracks em caso de erro
      if (localVideoTrack) localVideoTrack.stop();
      if (localAudioTrack) localAudioTrack.stop();
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
    }
  };

  // Encerrar transmissão
  const endStream = async () => {
    if (!currentUser || !sessionId) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/live-sessions/${sessionId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (roomRef.current) {
        await roomRef.current.disconnect();
        setRoom(null);
      }

      if (localVideoTrack) {
        localVideoTrack.stop();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        setLocalAudioTrack(null);
      }

      setIsConnected(false);
      setIsConnecting(false);
      setStage('ending');
      setToken(null);
      setRoomName('');
      setSessionId('');

      showToast('Transmissão encerrada.');
      setTimeout(() => {
        setStage('setup');
        setLoading(false);
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Erro ao encerrar transmissão.');
    }
  };

  // Alternar câmera
  const toggleCamera = async () => {
    if (!isCameraEnabled && localVideoTrack) {
      // Reativar
      try {
        await roomRef.current?.localParticipant.publishTrack(localVideoTrack);
        setIsCameraEnabled(true);
      } catch (e) {
        setError('Erro ao reativar câmera.');
      }
    } else {
      if (localVideoTrack) {
        await roomRef.current?.localParticipant.unpublishTrack(localVideoTrack);
        localVideoTrack.stop();
        setLocalVideoTrack(null);
        setIsCameraEnabled(false);
      }
    }
  };

  // Alternar microfone
  const toggleMic = async () => {
    if (!isMicEnabled && localAudioTrack) {
      try {
        await roomRef.current?.localParticipant.publishTrack(localAudioTrack);
        setIsMicEnabled(true);
      } catch (e) {
        setError('Erro ao reativar microfone.');
      }
    } else {
      if (localAudioTrack) {
        await roomRef.current?.localParticipant.unpublishTrack(localAudioTrack);
        localAudioTrack.stop();
        setLocalAudioTrack(null);
        setIsMicEnabled(false);
      }
    }
  };

  // Trocar dispositivo de câmera
  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (localVideoTrack && isCameraEnabled) {
      localVideoTrack.stop();
      await roomRef.current?.localParticipant.unpublishTrack(localVideoTrack);
      setLocalVideoTrack(null);
      await createTracks();
      if (localVideoTrack) {
        await roomRef.current?.localParticipant.publishTrack(localVideoTrack);
      }
    }
  };

  // Trocar dispositivo de microfone
  const switchMic = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (localAudioTrack && isMicEnabled) {
      localAudioTrack.stop();
      await roomRef.current?.localParticipant.unpublishTrack(localAudioTrack);
      setLocalAudioTrack(null);
      await createTracks();
      if (localAudioTrack) {
        await roomRef.current?.localParticipant.publishTrack(localAudioTrack);
      }
    }
  };

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      tracksRef.current.forEach(t => t.stop());
    };
  }, []);

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
      default: return 'Aguardando';
    }
  };

  return (
    <div className="min-h-screen bg-[#07140F] text-[#F5F5F0] flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-[#07140F]/95 backdrop-blur-md border-b border-[#263B30] px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-serif-patriotic text-lg font-bold text-[#E5AC24] flex items-center gap-2">
          <Video className="w-5 h-5 text-[#D4AF37]" />
          Painel de Transmissão ao Vivo
        </h1>
        <span className="px-3 py-1 rounded-full bg-[#174D32] text-[#E8CC76] text-xs font-bold border border-[#D4AF37]/40">
          Apresentador: {currentUser?.name}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {stage === 'setup' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Painel de configuração */}
            <div className="bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
                  Preparar Transmissão
                </h2>
                <span className="px-3 py-1 rounded-full bg-[#15291F] border border-[#263B30] text-[#A5B2A9] text-xs">
                  Teste de Câmera e Microfone
                </span>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-[#2b1414] border border-[#D94B4B] text-[#F5F5F0] mb-4 text-sm">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-3 text-xs text-[#D4AF37] hover:underline"
                  >
                    Fechar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Título da Transmissão</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ex: Discurso Patriótico ao Vivo"
                      className="w-full bg-[#15291F] text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Descrição</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="O que será abordado nesta transmissão?"
                      className="w-full bg-[#15291F] text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Categoria</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#15291F] text-[#F5F5F0] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="">Selecione uma categoria</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Imagem de Capa (URL opcional)</label>
                    <input
                      type="text"
                      value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="w-full bg-[#15291F] text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pré-visualização */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Câmera</label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => switchCamera(e.target.value)}
                      disabled={!cameraDevices.length}
                      className="w-full bg-[#15291F] text-[#F5F5F0] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    >
                      {cameraDevices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || 'Câmera'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#A5B2A9] mb-1.5">Microfone</label>
                    <select
                      value={selectedMicId}
                      onChange={(e) => switchMic(e.target.value)}
                      disabled={!microphoneDevices.length}
                      className="w-full bg-[#15291F] text-[#F5F5F0] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    >
                      {microphoneDevices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microfone'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative aspect-video bg-black rounded-xl border border-[#263B30] overflow-hidden">
                    {localVideoTrack ? (
                      <div ref={el => { if (el) localVideoTrack!.attach(el as unknown as HTMLMediaElement); }} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#263B30]">
                        <Video className="w-12 h-12 mb-2" />
                        <p className="text-xs">Pré-visualização da câmera</p>
                      </div>
                    )}
                    {!isCameraEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-[#D94B4B]">
                          <VideoOff className="w-8 h-8 mb-2" />
                          <p className="text-xs font-bold">Câmera Desligada</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={toggleCamera}
                      disabled={!localVideoTrack}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold shadow-lg transition ${
                        isCameraEnabled
                          ? 'bg-[#D94B4B] text-white hover:bg-[#b93a3a]'
                          : 'bg-[#174D32] text-[#E8CC76] hover:bg-[#1f6643]'
                      }`}
                    >
                      {isCameraEnabled ? <VideoOff className="w-4 h-4 mr-1" /> : <Video className="w-4 h-4 mr-1" />}
                      {isCameraEnabled ? 'Desligar Câmera' : 'Ligar Câmera'}
                    </button>
                    <button
                      onClick={toggleMic}
                      disabled={!localAudioTrack}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold shadow-lg transition ${
                        isMicEnabled
                          ? 'bg-[#D94B4B] text-white hover:bg-[#b93a3a]'
                          : 'bg-[#174D32] text-[#E8CC76] hover:bg-[#1f6643]'
                      }`}
                    >
                      {isMicEnabled ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                      {isMicEnabled ? 'Silenciar Microfone' : 'Ativar Microfone'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#263B30] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#A5B2A9]">
                  <Camera className="w-4 h-4" /> {cameraDevices.length} câmera(s) detectada(s)
                  <span className="hidden sm:inline">•</span>
                  <Mic className="w-4 h-4" /> {microphoneDevices.length} microfone(s) detectado(s)
                </div>
                <button
                  onClick={startStream}
                  disabled={loading || !localVideoTrack || !localAudioTrack}
                  className={`px-6 py-3 rounded-xl text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition ${
                    loading || !localVideoTrack || !localAudioTrack
                      ? 'bg-[#6b7280] text-[#F5F5F0] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-black'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-[#07140F] mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar Transmissão Ao Vivo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#102019] border border-[#263B30] rounded-3xl p-4 text-xs text-[#A5B2A9]">
              <p className="mb-2"><strong>Antes de iniciar:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>As permissões de câmera e microfone serão solicitadas pelo navegador.</li>
                <li>Somente administradores e moderadores podem transmitir.</li>
                <li>O token de apresentador é gerado pelo servidor e expira em 2 horas.</li>
                <li>Não armazene credenciais do LiveKit no navegador.</li>
              </ul>
            </div>
          </div>
        )}

        {stage === 'live' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header da transmissão ao vivo */}
            <div className="bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D94B4B] text-white text-[10px] font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-1.5" />
                    AO VIVO
                  </span>
                  <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0] mt-1">{form.title}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#A5B2A9]">Qualidade</div>
                  <div className={`flex items-center gap-1 ${qualityColor(connectionQuality)} font-bold text-xs`}>
                    <Signal className="w-3 h-3" />
                    {qualityLabel(connectionQuality)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] text-center">
                  <span className="text-[10px] text-[#A5B2A9] block">Espectadores</span>
                  <div className="text-lg font-bold text-[#F5F5F0]">{viewerCount}</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] text-center">
                  <span className="text-[10px] text-[#A5B2A9] block">Câmera</span>
                  <span className={`text-xs font-bold ${isCameraEnabled ? 'text-[#34A853]' : 'text-[#D94B4B]'}`}>
                    {isCameraEnabled ? 'Ligada' : 'Desligada'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] text-center">
                  <span className="text-[10px] text-[#A5B2A9] block">Microfone</span>
                  <span className={`text-xs font-bold ${isMicEnabled ? 'text-[#34A853]' : 'text-[#D94B4B]'}`}>
                    {isMicEnabled ? 'Ativo' : 'Silenciado'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] text-center">
                  <span className="text-[10px] text-[#A5B2A9] block">Status</span>
                  <span className="text-xs font-bold text-[#E8CC76]">Conectado</span>
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                {localVideoTrack ? (
                  <div ref={el => { if (el) localVideoTrack!.attach(el as unknown as HTMLMediaElement); }} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#263B30]">
                    <Video className="w-16 h-16 mb-2" />
                    <p className="text-xs">Sua pré-visualização</p>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#07140F]/80 px-3 py-1 rounded-xl border border-[#D4AF37]/30 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-[#D94B4B] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#E8CC76]">AO VIVO</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCamera}
                    className={`p-2.5 rounded-xl transition ${
                      isCameraEnabled ? 'bg-[#D94B4B] text-white' : 'bg-[#174D32] text-[#E8CC76]'
                    }`}
                    title={isCameraEnabled ? 'Desligar câmera' : 'Ligar câmera'}
                  >
                    {isCameraEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`p-2.5 rounded-xl transition ${
                      isMicEnabled ? 'bg-[#D94B4B] text-white' : 'bg-[#174D32] text-[#E8CC76]'
                    }`}
                    title={isMicEnabled ? 'Silenciar microfone' : 'Ativar microfone'}
                  >
                    {isMicEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={endStream}
                  className="px-6 py-2.5 rounded-xl bg-[#D94B4B] text-white font-bold text-xs hover:bg-[#b93a3a] shadow-lg transition active:scale-95 flex items-center gap-1.5"
                >
                  <StopCircle className="w-4 h-4" /> Encerrar Transmissão
                </button>
              </div>
            </div>

            <div className="bg-[#102019] border border-[#263B30] rounded-3xl p-4 text-xs text-[#A5B2A9]">
              <p className="mb-2"><strong>Controles ao vivo:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use os botões acima para ligar/desligar câmera e microfone a qualquer momento.</li>
                <li>O indicador de qualidade mostra a saúde da conexão WebRTC em tempo real.</li>
                <li>O contador de espectadores é atualizado automaticamente pela sala LiveKit.</li>
                <li>Para encerrar, clique em "Encerrar Transmissão" — a sala será fechada e os tracks liberados.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
