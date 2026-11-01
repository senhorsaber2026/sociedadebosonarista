import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  MessageSquare, 
  Search, 
  Check, 
  X, 
  MapPin, 
  Award, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';
import { User, UserRank } from '../types';
import { storageService } from '../services/storageService';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';

interface FriendsViewProps {
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
}

interface FriendItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: UserRank;
  location: string;
  bio?: string;
  honorPoints: number;
  online: boolean;
  mutualFriends: number;
  verified?: boolean;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  onNavigate,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  // Load real users from storage
  const allUsers = useMemo(() => storageService.getUsers(), []);
  const followingList = useMemo(
    () => currentUser ? storageService.getFollowingList(currentUser.id) : [],
    [currentUser]
  );

  // "Friends" = users this person follows
  const [friendsList, setFriendsList] = useState<FriendItem[]>(() => {
    return allUsers
      .filter(u => followingList.includes(u.id) && u.id !== 'usr_admin')
      .map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        rank: (u.rank || 'soldado') as UserRank,
        location: u.location || 'Brasil',
        bio: u.bio || 'Membro da Sociedade Bosonarista',
        honorPoints: u.honorPoints || 0,
        online: false,
        mutualFriends: 0,
        verified: u.verified
      }));
  });

  // "Requests" - empty in real mode (no fake requests)
  const [requestsList, setRequestsList] = useState<FriendItem[]>([]);

  // "Discover" = users not yet followed, excluding admin and self
  const discoverUsers = useMemo(() => {
    return allUsers
      .filter(u => u.id !== currentUser?.id && u.id !== 'usr_admin' && !followingList.includes(u.id))
      .map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        rank: (u.rank || 'soldado') as UserRank,
        location: u.location || 'Brasil',
        bio: u.bio || 'Membro da Sociedade Bosonarista',
        honorPoints: u.honorPoints || 0,
        online: false,
        mutualFriends: 0,
        verified: u.verified
      }));
  }, [allUsers, currentUser, followingList]);

  const handleAcceptRequest = (req: FriendItem) => {
    setRequestsList(prev => prev.filter(r => r.id !== req.id));
    setFriendsList(prev => [req, ...prev]);
    showToast(`Você aceitou a solicitação de ${req.name}!`);
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequestsList(prev => prev.filter(r => r.id !== reqId));
    showToast('Solicitação recusada.');
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    if (confirm(`Deseja deixar de seguir ${friendName}?`)) {
      if (currentUser) storageService.toggleFollow(currentUser.id, friendId);
      setFriendsList(prev => prev.filter(f => f.id !== friendId));
      showToast(`Você deixou de seguir ${friendName}.`);
    }
  };

  const handleAddDiscoverFriend = (userId: string, userName: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    storageService.toggleFollow(currentUser.id, userId);
    setSentRequests(prev => [...prev, userId]);
    showToast(`Você começou a seguir ${userName}!`);
  };

  const filteredFriends = friendsList.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* HEADER CARD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#102019] border border-[#263B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E5AC24]" />
            <h1 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
              Amigos & Patriotas Conectados
            </h1>
          </div>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Rede de companheiros cívicos para conversas privadas, alianças e debates.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-[#0b1712] p-1 rounded-2xl border border-[#263B30] self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'friends'
                ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Amigos ({friendsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Solicitações ({requestsList.length})</span>
            {requestsList.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D94B4B]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'discover'
                ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5AC24]" />
            <span>Descobrir</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR (FOR FRIENDS TAB) */}
      {activeTab === 'friends' && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar amigo por nome, usuário ou estado..."
            className="w-full bg-[#102019] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] pl-10 pr-4 py-2.5 rounded-2xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition shadow-sm"
          />
        </div>
      )}

      {/* 1. FRIENDS LIST */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredFriends.map((f) => (
            <div
              key={f.id}
              className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 flex items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition group"
            >
              <div 
                onClick={() => onNavigate('profile', f.username)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <div className="relative shrink-0">
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#263B30] group-hover:scale-105 transition"
                  />
                  {f.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#102019]" title="Online agora" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] group-hover:text-[#E8CC76] transition truncate">
                      {f.name}
                    </h4>
                    {f.verified && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#A5B2A9] mt-0.5">
                    <span>@{f.username}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#E5AC24]" />
                      {f.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <RankBadge rank={f.rank} size="xs" />
                    <span className="text-[10px] text-[#E5AC24] font-semibold">
                      {f.honorPoints} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onNavigate('messages', f.id)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#174D32] to-[#1f593b] hover:brightness-110 text-[#E8CC76] text-xs font-bold flex items-center gap-1.5 border border-[#D4AF37]/30 transition active:scale-95 cursor-pointer"
                  title="Conversar no privado"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mensagem</span>
                </button>

                <button
                  onClick={() => handleRemoveFriend(f.id, f.name)}
                  className="px-2.5 py-1 rounded-xl bg-[#15291F] hover:bg-[#2e1515] text-[#A5B2A9] hover:text-[#D94B4B] text-[10px] font-semibold transition cursor-pointer text-center"
                >
                  Desfazer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. PENDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requestsList.length > 0 ? (
            requestsList.map((req) => (
              <div
                key={req.id}
                className="bg-[#102019] rounded-2xl border border-[#263B30] p-4 flex items-center justify-between gap-3 shadow-md"
              >
                <div 
                  onClick={() => onNavigate('profile', req.username)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#263B30]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0]">
                        {req.name}
                      </h4>
                      {req.verified && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-[#A5B2A9]">
                      @{req.username} • {req.location}
                    </div>
                    <div className="text-[10px] text-[#E8CC76] mt-0.5">
                      {req.mutualFriends} amigos em comum na Sociedade Bosonarista
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5AC24] to-[#C99818] text-[#07140F] font-bold text-xs flex items-center gap-1 shadow transition hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Aceitar</span>
                  </button>

                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="p-2 rounded-xl bg-[#15291F] hover:bg-[#2b1717] text-[#A5B2A9] hover:text-[#D94B4B] transition cursor-pointer"
                    title="Recusar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
              Você não tem nenhuma solicitação de amizade pendente no momento.
            </div>
          )}
        </div>
      )}

      {/* 3. DISCOVER PATRIOTS */}
      {activeTab === 'discover' && (
        discoverUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discoverUsers.map((patriot) => {
              const isSent = sentRequests.includes(patriot.id);
              return (
                <div
                  key={patriot.id}
                  className="bg-[#102019] rounded-2xl border border-[#263B30] p-4 flex flex-col justify-between gap-3 shadow-md"
                >
                  <div 
                    onClick={() => onNavigate('profile', patriot.username)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <img
                      src={patriot.avatar}
                      alt={patriot.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#263B30] group-hover:border-[#D4AF37] transition shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] group-hover:text-[#E8CC76] transition truncate">
                          {patriot.name}
                        </h4>
                        <RankBadge rank={patriot.rank} size="xs" />
                      </div>
                      <div className="text-[10px] text-[#A5B2A9]">
                        @{patriot.username} • {patriot.location}
                      </div>
                      <p className="text-[11px] text-[#F5F5F0] mt-1 line-clamp-2 leading-snug">
                        {patriot.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#263B30]/60">
                    <button
                      onClick={() => onNavigate('profile', patriot.username)}
                      className="text-xs font-semibold text-[#A5B2A9] hover:text-[#E8CC76] transition"
                    >
                      Ver Perfil
                    </button>

                    <button
                      onClick={() => handleAddDiscoverFriend(patriot.id, patriot.name)}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSent
                          ? 'bg-[#15291F] text-[#22C55E] border border-[#263B30]'
                          : 'bg-gradient-to-r from-[#E5AC24] to-[#C99818] text-[#07140F] hover:brightness-110 shadow-sm active:scale-95'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Seguindo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Seguir Patriota</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
            Nenhum novo patriota para descobrir no momento. Seja um dos primeiros a convidar amigos e fortalecer a rede!
          </div>
        )
      )}
    </div>
  );
};
