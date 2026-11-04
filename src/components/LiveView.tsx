import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Video,
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
  Link,
  ExternalLink,
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
  const [activeLives, setActiveLives] = useState<LiveSession[]>([]);
  const [selectedLive, setSelectedLive] = useState<LiveSession | null>(null);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAddingLive, setIsAddingLive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveType, setLiveType] = useState<'link' | 'camera'>('link');
  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveUrl, setNewLiveUrl] = useState('');
  const [cameraVideoFile, setCameraVideoFile] = useState<File | null>(null);
  const [cameraVideoUrl, setCameraVideoUrl] = useState<string | null>(null);
  const [isMyLive, setIsMyLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const currentLiveIdRef = useRef<string | null>(null);

  const refreshLives = useCallback(async () => {
    const lives = await storageService.getActiveLives();
    setActiveLives(lives);
  }, []);

  useEffect(() => {
    refreshLives();
    const interval = setInterval(refreshLives, 10000);
    return () => clearInterval(interval);
  }, [refreshLives]);

  useEffect(() => {
    if (currentUser) {
      refreshLives();
    }
  }, [currentUser, refreshLives]);

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

  const handleAddLive = async () => {
    console.log('[LiveView] handleAddLive chamado', { liveType, newLiveTitle, newLiveUrl, cameraVideoFile, currentUser });
    if (!currentUser) {
      console.log('[LiveView] Sem usuário logado, abrindo auth');
      onOpenAuth();
      return;
    }
    if (!newLiveTitle.trim()) {
      showToast('Informe o título da transmissão.');
      return;
    }
    let finalDescription: string | undefined;
    if (liveType === 'link') {
      if (!newLiveUrl.trim()) {
        showToast('Informe o link da transmissão.');
        return;
      }
      finalDescription = newLiveUrl;
    } else {
      if (!cameraVideoFile) {
        showToast('Selecione ou grave um vídeo da câmera.');
        return;
      }
      finalDescription = cameraVideoUrl || '';
    }
    setIsSubmitting(true);
    try {
      console.log('[LiveView] Chamando storageService.startLive...');
      const newLive = await storageService.startLive(currentUser.id, newLiveTitle, finalDescription);
      console.log('[LiveView] Live criada:', newLive);
      setActiveLives([newLive, ...activeLives]);
      setIsAddingLive(false);
      setNewLiveTitle('');
      setNewLiveUrl('');
      setCameraVideoFile(null);
      setCameraVideoUrl(null);
      setLiveType('link');
      setIsMyLive(true);
      setSelectedLive(newLive);
      currentLiveIdRef.current = newLive.id;
      setViewerCount(newLive.viewerCount);
      setChatMessages([]);
      setLikes(0);
      setIsLiked(false);
      showToast('Transmissão ao vivo adicionada!');
    } catch (err: any) {
      console.error('[LiveView] Erro ao criar live:', err);
      showToast('Erro ao criar transmissão: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLive = () => {
    if (!currentLiveIdRef.current) return;
    storageService.stopLive(currentLiveIdRef.current);
    setIsMyLive(false);
    setSelectedLive(null);
    currentLiveIdRef.current = null;
    setViewerCount(0);
    setChatMessages([]);
    setLikes(0);
    setIsLiked(false);
    refreshLives();
    showToast('Link de transmissão removido.');
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

  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    return url;
  };

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
        {currentUser && (
          <button
            onClick={() => setIsAddingLive(!isAddingLive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              isAddingLive
                ? 'bg-[#D94B4B] text-white hover:bg-[#b93a3a]'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg hover:brightness-110'
            }`}
          >
            {isAddingLive ? 'Cancelar' : <><Link className="w-4 h-4 mr-1" /> Nova Live</>}
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {currentUser ? (
          <>
            {/* Formulário para adicionar transmissão ao vivo */}
            {isAddingLive && (
              <div className="mb-6 bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl p-6">
                <h3 className="text-sm font-bold text-[#E5AC24] mb-4 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Nova Transmissão ao Vivo
                </h3>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setLiveType('link')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      liveType === 'link'
                        ? 'bg-[#D4AF37] text-[#07140F] shadow'
                        : 'bg-[#15291F] text-[#A5B2A9] border border-[#263B30] hover:bg-[#174D32]'
                    }`}
                  >
                    🔗 Link
                  </button>
                  <button
                    onClick={() => setLiveType('camera')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      liveType === 'camera'
                        ? 'bg-[#D4AF37] text-[#07140F] shadow'
                        : 'bg-[#15291F] text-[#A5B2A9] border border-[#263B30] hover:bg-[#174D32]'
                    }`}
                  >
                    📹 Câmera
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newLiveTitle}
                    onChange={(e) => setNewLiveTitle(e.target.value)}
                    placeholder="Título da transmissão ao vivo"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                  {liveType === 'link' ? (
                    <input
                      type="text"
                      value={newLiveUrl}
                      onChange={(e) => setNewLiveUrl(e.target.value)}
                      placeholder="Link da transmissão (YouTube, etc.)"
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  ) : (
                    <>
                      <label className="block text-xs text-[#A5B2A9] mb-1">
                        Selecionar ou gravar vídeo da câmera
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            setCameraVideoFile(file);
                            setCameraVideoUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="w-full bg-[#15291F] text-xs text-[#F5F5F0] px-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                      />
                      {cameraVideoUrl && (
                        <div className="mt-2 bg-[#07140F] border border-[#263B30] rounded-xl overflow-hidden">
                          <video
                            src={cameraVideoUrl}
                            className="w-full h-40 object-cover"
                            controls
                          />
                          <button
                            onClick={() => {
                              setCameraVideoFile(null);
                              if (cameraVideoUrl) URL.revokeObjectURL(cameraVideoUrl);
                              setCameraVideoUrl(null);
                            }}
                            className="w-full py-1.5 text-[10px] text-[#D94B4B] bg-[#2b1414] border-t border-[#263B30] hover:text-white transition"
                          >
                            Remover vídeo
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <button
                    onClick={handleAddLive}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-[#6b7280] text-[#F5F5F0] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-black hover:brightness-110'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-[#07140F]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Iniciando...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-[#07140F]" />
                        <span>Iniciar Transmissão</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Minha transmissão (link adicionado pelo usuário logado) */}
            {isMyLive && selectedLive && (
              <div className="mb-6 bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl overflow-hidden">
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
                    <div className="bg-[#15291F] border border-[#263B30] rounded-xl p-3">
                      <p className="text-xs text-[#A5B2A9] mb-2">Transmissão ao vivo:</p>
                      {isYoutubeUrl(selectedLive.description || '') || selectedLive.description.startsWith('http') ? (
                        <>
                          <a
                            href={selectedLive.description}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#D4AF37] break-all hover:underline block mb-2"
                          >
                            {selectedLive.description}
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedLive.description || '')}
                            className="ml-2 text-xs text-[#A5B2A9] hover:text-[#F5F5F0]"
                          >
                            Copiar
                          </button>
                        </>
                      ) : (
                        <>
                          <video
                            src={selectedLive.description}
                            className="w-full h-48 object-cover rounded-lg bg-black"
                            controls
                          />
                          <button
                            onClick={() => window.open(selectedLive.description, '_blank')}
                            className="mt-2 w-full py-2 rounded-xl border border-[#D4AF37] text-[#D4AF37] text-xs font-bold hover:bg-[#1a2e25] transition"
                          >
                            Abrir em nova janela
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#263B30]">
                    <button
                      onClick={handleRemoveLive}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#D94B4B] text-[#D94B4B] hover:bg-[#2b1414] transition"
                      title="Remover link"
                    >
                      <X className="w-5 h-5" />
                      <span className="text-[10px]">Remover</span>
                    </button>
                    <button
                      onClick={() => window.open(selectedLive.description, '_blank')}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#D4AF37] text-[#D4AF37] hover:bg-[#1a2e25] transition"
                      title="Abrir transmissão"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-[10px]">Abrir</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lives em andamento de outros usuários */}
            {activeLives.length > 0 && (
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
                        {isYoutubeUrl(live.description || '') ? (
                          <iframe
                            className="w-full h-full"
                            src={getYoutubeEmbedUrl(live.description || '')}
                            title="Transmissão ao vivo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-[#07140F]/90 border border-[#D4AF37] flex items-center justify-center shadow-lg">
                              <Play className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                          </div>
                        )}
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
                  Nenhuma transmissão ao vivo no momento. Adicione um link de live para compartilhar com a comunidade!
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
              Entre com sua conta de membro para adicionar e assistir transmissões ao vivo.
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
