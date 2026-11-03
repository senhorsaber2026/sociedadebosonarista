import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  PlusCircle, 
  Bell, 
  MessageSquare, 
  User as UserIcon, 
  Shield, 
  Settings, 
  Bookmark, 
  LogOut, 
  ChevronDown, 
  Check, 
  Menu, 
  X,
  ExternalLink,
  Users,
  Flame,
  Newspaper,
  Award,
  ShieldCheck,
  PenLine,
  Mail,
  CheckCircle2,
  Store,
  Heart,
  Video
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { storageService } from '../services/storageService';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenRanksModal: () => void;
  onOpenDonationModal?: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  onOpenCreatePost,
  onOpenAuth,
  onOpenRanksModal,
  onOpenDonationModal,
  currentView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const refreshNotificationState = () => {
    if (currentUser) {
      const notifs = storageService.getNotifications(currentUser.id);
      setNotifications(notifs);
      const userMsgs = storageService.getMessagesForUser(currentUser.id);
      const unreadMsgs = userMsgs.filter(m => m.receiverId === currentUser.id && !m.read).length;
      setUnreadMessagesCount(unreadMsgs);
    } else {
      setNotifications([]);
      setUnreadMessagesCount(0);
    }
  };

  useEffect(() => {
    refreshNotificationState();
  }, [currentUser, currentView]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      storageService.markAllNotificationsRead(currentUser.id);
      refreshNotificationState();
      showToast('Todas as notificações foram marcadas como lidas.');
    }
  };

  const handleClearRead = () => {
    if (currentUser) {
      storageService.clearReadNotifications(currentUser.id);
      refreshNotificationState();
      showToast('Notificações lidas foram removidas.');
    }
  };

  const handleMarkSingleRead = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    storageService.markNotificationRead(notifId);
    refreshNotificationState();
  };

  const handleDeleteSingle = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    storageService.deleteNotification(notifId);
    refreshNotificationState();
    showToast('Notificação excluída.');
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    storageService.markNotificationRead(notif.id);
    refreshNotificationState();
    setShowNotifications(false);
    if (notif.link?.startsWith('#perfil/')) {
      const u = notif.link.replace('#perfil/', '');
      onNavigate('profile', u);
    } else if (notif.link === '/mensagens') {
      onNavigate('messages');
    } else {
      onNavigate('home');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate('explore', searchQuery.trim());
    setShowSearchResults(false);
  };

  // Quick switch between Admin and normal user for easy instant testing
  const handleQuickSwitchUser = (userId: string) => {
    const u = storageService.setCurrentUser(userId);
    if (u) {
      showToast(`Conectado como: ${u.name} (${u.role === 'admin' ? 'Administrador' : 'Membro'})`);
      setShowUserMenu(false);
      window.location.reload();
    }
  };

  const handleLogout = () => {
    storageService.logout();
    showToast('Sessão encerrada com sucesso.');
    setShowUserMenu(false);
    window.location.reload();
  };

  // Live search previews
  const searchPosts = searchQuery ? storageService.getPosts({ query: searchQuery }).slice(0, 3) : [];
  const searchUsers = searchQuery ? storageService.getUsers().filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3) : [];
  const searchNews = searchQuery ? storageService.getNews({ query: searchQuery }).slice(0, 2) : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07140F]/95 backdrop-blur-md border-b border-[#263B30] transition-all">
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LOGO & BRAND (ROUND EMBLEM + GOLD TITLES) */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 group select-none"
        >
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#E5AC24] shadow-[0_0_12px_rgba(229,172,36,0.35)] group-hover:scale-105 transition-transform shrink-0">
            <img 
              src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png" 
              alt="Sociedade Bosonarista Emblema"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-serif-patriotic font-extrabold text-base md:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D0] via-[#E5AC24] to-[#C99818] group-hover:brightness-110 transition-colors">
                SOCIEDADE BOSONARISTA
              </span>
            </div>
            <p className="text-[11px] text-[#A5B2A9] hidden md:block line-clamp-1">
              Uma comunidade para debater, compartilhar e participar.
            </p>
          </div>
        </div>

        {/* SEARCH BAR (ROUNDED FULL PILL) */}
        <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Pesquisar na Sociedade Bosonarista..."
              className="w-full bg-[#0b1712] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] pl-10 pr-4 py-2.5 rounded-full border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition-all shadow-inner"
            />
          </form>

          {/* Search dropdown results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#102019] border border-[#263B30] rounded-xl shadow-2xl overflow-hidden z-50 p-2 max-h-96 overflow-y-auto">
              {searchUsers.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-[#D4AF37] px-2 py-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Patriotas
                  </div>
                  {searchUsers.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        onNavigate('profile', u.username);
                        setShowSearchResults(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#15291F] cursor-pointer transition"
                    >
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="text-xs">
                        <div className="font-semibold text-[#F5F5F0]">{u.name}</div>
                        <div className="text-[#A5B2A9]">@{u.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchNews.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-[#D4AF37] px-2 py-1 flex items-center gap-1">
                    <Newspaper className="w-3.5 h-3.5" /> Notícias
                  </div>
                  {searchNews.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNavigate('news', n.id);
                        setShowSearchResults(false);
                      }}
                      className="p-2 rounded-lg hover:bg-[#15291F] cursor-pointer text-xs"
                    >
                      <div className="font-semibold text-[#F5F5F0] line-clamp-1">{n.title}</div>
                      <div className="text-[#A5B2A9] text-[10px]">{n.category} • {new Date(n.publishedAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  ))}
                </div>
              )}

              {searchPosts.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#D4AF37] px-2 py-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Publicações
                  </div>
                  {searchPosts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onNavigate('explore', searchQuery);
                        setShowSearchResults(false);
                      }}
                      className="p-2 rounded-lg hover:bg-[#15291F] cursor-pointer text-xs"
                    >
                      <span className="text-[#A5B2A9] font-medium">@{p.authorUsername}: </span>
                      <span className="text-[#F5F5F0] line-clamp-1">{p.content}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  onNavigate('explore', searchQuery);
                  setShowSearchResults(false);
                }}
                className="w-full mt-1 text-center py-2 text-xs font-semibold text-[#E8CC76] hover:bg-[#15291F] rounded-lg transition"
              >
                Ver todos os resultados para "{searchQuery}" →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS: GOLDEN PUBLICAR + NOTIFICATIONS + MESSAGES + AVATAR */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Golden Publicar Button with Pencil Icon */}
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 text-[#07140F] font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PenLine className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Publicar</span>
          </button>

          {/* Fazer Live Button (desktop) */}
          {currentUser && (
            <button
              onClick={() => onNavigate('live')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#D94B4B] via-[#b93a3a] to-[#8e2a2a] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-[0_0_15px_rgba(217,75,75,0.5)] animate-pulse transition-all active:scale-95 cursor-pointer"
              title="Fazer transmissão ao vivo"
            >
              <Video className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Ao Vivo</span>
            </button>
          )}

          {/* Doação PIX Button */}
          {onOpenDonationModal && (
            <button
              onClick={onOpenDonationModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#102019] border border-[#D4AF37]/50 hover:bg-[#174D32] text-[#E8CC76] font-bold text-xs transition cursor-pointer"
              title="Doação Voluntária via PIX - Suba de Patente"
            >
              <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              <span>Apoiar PIX</span>
            </button>
          )}

          {currentUser ? (
            <>
              {/* Notifications Dropdown */}
              <div ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notificações"
                  className="relative p-2 rounded-xl text-[#F5F5F0] hover:bg-[#102019] border border-transparent hover:border-[#263B30] transition cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-[#F5F5F0]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#D94B4B] text-white text-[10px] font-bold flex items-center justify-center border border-[#07140F] shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[250px] sm:w-80 max-w-[calc(100vw-2rem)] bg-[#102019] border border-[#263B30] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-[#263B30] flex items-center justify-between bg-[#0b1712]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm font-bold text-[#F5F5F0]">Notificações</span>
                        {unreadCount > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-semibold">
                            {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#15291F] text-[#A5B2A9]">
                            Todas lidas
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                          >
                            Marcar lidas
                          </button>
                        )}
                        {notifications.some(n => n.read) && (
                          <button
                            onClick={handleClearRead}
                            className="text-[11px] text-[#A5B2A9] hover:text-[#D94B4B] cursor-pointer"
                            title="Limpar lidas"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#263B30]/40">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#A5B2A9]">
                          Nenhuma notificação encontrada.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 flex items-start gap-3 hover:bg-[#15291F] cursor-pointer transition group relative ${
                              !notif.read ? 'bg-[#15291F]/70 border-l-2 border-[#D4AF37]' : 'opacity-85'
                            }`}
                          >
                            <img
                              src={notif.fromUserAvatar || '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png'}
                              alt="Avatar"
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#263B30]"
                            />
                            <div className="flex-1 text-xs min-w-0 pr-6">
                              <p className="text-[#F5F5F0] leading-snug">
                                <strong className="font-semibold text-white">{notif.fromUserName || 'Sistema'}</strong>{' '}
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-[#A5B2A9] mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Actions on hover */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleMarkSingleRead(e, notif.id)}
                                  className="w-2.5 h-2.5 rounded-full bg-[#E5AC24] shadow-[0_0_8px_rgba(229,172,36,0.8)]"
                                  title="Marcar como lida"
                                />
                              )}
                              <button
                                onClick={(e) => handleDeleteSingle(e, notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-[#A5B2A9] hover:text-[#D94B4B] transition"
                                title="Excluir notificação"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Messages Icon */}
              <button
                onClick={() => onNavigate('messages')}
                title="Mensagens Privadas"
                className={`relative p-2 rounded-xl text-[#F5F5F0] hover:bg-[#102019] border border-transparent hover:border-[#263B30] transition cursor-pointer ${
                  currentView === 'messages' ? 'bg-[#102019] text-[#D4AF37] border-[#263B30]' : ''
                }`}
              >
                <MessageSquare className="w-5 h-5 text-[#F5F5F0]" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#D94B4B] text-white text-[10px] font-bold flex items-center justify-center border border-[#07140F] shadow-sm">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* User Avatar Menu Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 rounded-xl bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/50 transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/40"
                  />
                  <RankBadge rank={currentUser.rank} size="xs" />
                  <ChevronDown className="w-3.5 h-3.5 text-[#A5B2A9]" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#102019] border border-[#263B30] rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                    {/* Header info */}
                    <div className="p-3 bg-[#15291F] rounded-xl mb-2 border border-[#263B30]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#D4AF37]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#F5F5F0] truncate flex items-center gap-1">
                            {currentUser.name}
                            {currentUser.role === 'admin' && (
                              <Shield className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#A5B2A9] truncate">@{currentUser.username}</div>
                          {currentUser.email && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-[#E8CC76] bg-[#07140F] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 truncate" title={currentUser.email}>
                              <Mail className="w-3 h-3 text-[#D4AF37] shrink-0" />
                              <span className="truncate font-mono">{currentUser.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <RankBadge rank={currentUser.rank} size="xs" />
                            <span className="text-[10px] text-[#34A853] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Cadastrado
                            </span>
                            <span className="text-[10px] text-[#D4AF37] font-semibold ml-auto">
                              {currentUser.honorPoints || 0} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="space-y-1 text-xs text-[#F5F5F0]">
                      {/* Career / Rank Modal link */}
                      <button
                        onClick={() => {
                          onOpenRanksModal();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#174D32] to-[#1f593b] border border-[#D4AF37]/40 text-[#E8CC76] font-bold transition text-left hover:brightness-110"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#D4AF37]" />
                          <span>Plano de Patentes & Carreira</span>
                        </div>
                        <span className="text-[10px] bg-[#07140F] px-1.5 py-0.5 rounded text-[#D4AF37]">
                          Ver Missões
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('profile', currentUser.username);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#15291F] transition text-left"
                      >
                        <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                        Meu Perfil
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('saved');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#15291F] transition text-left"
                      >
                        <Bookmark className="w-4 h-4 text-[#A5B2A9]" />
                        Publicações Salvas
                      </button>

                      {/* Empresas Patriotas */}
                      <button
                        onClick={() => {
                          onNavigate('companies');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#15291F] transition text-left"
                      >
                        <Store className="w-4 h-4 text-[#D4AF37]" />
                        Vitrine de Empresas
                      </button>

                      {/* Admin Panel Link - strictly shown for admin */}
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#174D32] transition text-left group"
                        >
                          <div className="flex items-center gap-2.5 text-[#E8CC76] font-semibold">
                            <Shield className="w-4 h-4 text-[#D4AF37]" />
                            Painel Administrativo
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#D4AF37] text-[#07140F] rounded font-bold">
                            ADMIN
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#15291F] transition text-left"
                      >
                        <Settings className="w-4 h-4 text-[#A5B2A9]" />
                        Configurações & Privacidade
                      </button>

                      {/* Fast testing switch */}
                      <div className="pt-2 mt-2 border-t border-[#263B30]">
                        <div className="text-[10px] text-[#A5B2A9] px-3 pb-1 font-semibold uppercase tracking-wider">
                          Alternar Conta (Ambiente de Teste)
                        </div>
                        <button
                          onClick={() => handleQuickSwitchUser('usr_kaliton')}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition text-left cursor-pointer ${
                            currentUser.id === 'usr_kaliton' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'hover:bg-[#15291F] text-[#A5B2A9]'
                          }`}
                        >
                          <span>⭐️ Kaliton Leite (Membro Normal - Sem Admin)</span>
                          {currentUser.id === 'usr_kaliton' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleQuickSwitchUser('usr_admin')}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition text-left cursor-pointer ${
                            currentUser.id === 'usr_admin' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'hover:bg-[#15291F] text-[#A5B2A9]'
                          }`}
                        >
                          <span>👑 Administração Central (Admin Oficial)</span>
                          {currentUser.id === 'usr_admin' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="pt-1 mt-1 border-t border-[#263B30] space-y-1">
                        <button
                          onClick={() => { setShowUserMenu(false); onOpenAuth('register'); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#15291F] text-[#E8CC76] transition text-left font-bold text-xs cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                          <span>Fazer Meu Cadastro de Membro</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#2b1414] text-[#D94B4B] transition text-left font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Encerrar Sessão (Sair)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prominent new registration button even when logged in */}
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8CC76] text-[#07140F] hover:brightness-110 text-xs font-black shadow-[0_0_12px_rgba(212,175,55,0.35)] transition cursor-pointer"
                title="Cadastrar uma nova conta com sua rede social ou CPF"
              >
                <ShieldCheck className="w-4 h-4 text-[#07140F]" />
                <span className="hidden sm:inline">Cadastro de Membro</span>
                <span className="sm:hidden">Cadastrar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 rounded-xl border border-[#263B30] hover:border-[#D4AF37] text-xs font-bold text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] hover:brightness-110 text-[#07140F] text-xs font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition cursor-pointer transform hover:scale-105"
                title="Cadastre-se com Rede Social (Google, Instagram, WhatsApp, etc.) ou CPF"
              >
                <ShieldCheck className="w-4 h-4 text-[#07140F]" />
                <span className="uppercase tracking-wider">CADASTRO DE MEMBRO</span>
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#F5F5F0] hover:bg-[#102019] transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-3 pb-2 pt-1 border-t border-[#263B30]/50">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
          />
        </form>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#102019] border-b border-[#263B30] px-4 py-3 space-y-2 animate-fade-in text-sm">
          {/* Mobile Registration Prominent Button */}
          <button
            onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-black text-xs flex items-center justify-center gap-2 shadow-md uppercase tracking-wider mb-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#07140F]" />
            <span>Cadastro de Membro (Redes ou CPF)</span>
          </button>

          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'home' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            Início
          </button>
          <button
            onClick={() => { onNavigate('explore'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'explore' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            Explorar
          </button>
          <button
            onClick={() => { onNavigate('news'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'news' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            Notícias
          </button>
          <button
            onClick={() => { onNavigate('debates'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'debates' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            Debates Políticos
          </button>
          <button
            onClick={() => { onNavigate('live'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'live' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            <Video className="w-4 h-4 text-[#D4AF37] mr-2" />
            Lives Patrióticas
          </button>
          <button
            onClick={() => { onNavigate('groups'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg ${currentView === 'groups' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            Comunidades & Grupos
          </button>
          <button
            onClick={() => { onNavigate('companies'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${currentView === 'companies' ? 'bg-[#174D32] text-[#E8CC76] font-bold' : 'text-[#F5F5F0]'}`}
          >
            <span>Empresas Patriotas</span>
            <Store className="w-4 h-4 text-[#D4AF37]" />
          </button>
          {onOpenDonationModal && (
            <button
              onClick={() => { onOpenDonationModal(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-[#E8CC76] font-bold"
            >
              <span>Apoiar via PIX</span>
              <Heart className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
            </button>
          )}
          {/* Admin panel in mobile - strictly if admin */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-[#E8CC76] font-semibold ${currentView === 'admin' ? 'bg-[#174D32]' : ''}`}
            >
              <span>Painel Administrativo</span>
              <Shield className="w-4 h-4 text-[#D4AF37]" />
            </button>
          )}
          <button
            onClick={() => { onNavigate('settings'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#A5B2A9]"
          >
            Configurações
          </button>
        </div>
      )}
    </header>
  );
};
