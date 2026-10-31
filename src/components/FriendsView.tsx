import React, { useState } from 'react';
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

  // 12 Connected Friends matching sidebar badge 12
  const [friendsList, setFriendsList] = useState<FriendItem[]>([
    {
      id: 'usr_patriota22',
      name: 'Patriota22',
      username: 'patriota22',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      rank: 'cabo',
      location: 'Rio de Janeiro, RJ',
      honorPoints: 340,
      online: true,
      mutualFriends: 18,
      verified: true
    },
    {
      id: 'usr_brasillivre',
      name: 'BrasilLivre',
      username: 'brasillivre',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
      rank: 'sargento',
      location: 'São Paulo, SP',
      honorPoints: 580,
      online: true,
      mutualFriends: 24,
      verified: true
    },
    {
      id: 'usr_direitaja',
      name: 'DireitaJá',
      username: 'direitaja',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      rank: 'tenente',
      location: 'Curitiba, PR',
      honorPoints: 920,
      online: true,
      mutualFriends: 32,
      verified: true
    },
    {
      id: 'usr_helena',
      name: 'Dra. Helena Moreira',
      username: 'dra_helenamoreira',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      rank: 'capitao',
      location: 'Brasília, DF',
      honorPoints: 2150,
      online: false,
      mutualFriends: 45,
      verified: true
    },
    {
      id: 'usr_rodrigo',
      name: 'Rodrigo Fagundes (Agro Forte)',
      username: 'rodrigo_agro',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      rank: 'tenente',
      location: 'Sorriso, MT',
      honorPoints: 1050,
      online: false,
      mutualFriends: 15,
      verified: false
    },
    {
      id: 'usr_carlos_silva',
      name: 'Carlos Silva',
      username: 'carlos_silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      rank: 'sargento',
      location: 'Belo Horizonte, MG',
      honorPoints: 610,
      online: true,
      mutualFriends: 9,
      verified: true
    },
    {
      id: 'usr_fernanda_lima',
      name: 'Fernanda Lima',
      username: 'fernanda_lima',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      rank: 'cabo',
      location: 'Florianópolis, SC',
      honorPoints: 420,
      online: false,
      mutualFriends: 11,
      verified: false
    },
    {
      id: 'usr_ricardo_souza',
      name: 'Ricardo Souza',
      username: 'ricardo_souza',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      rank: 'soldado',
      location: 'Porto Alegre, RS',
      honorPoints: 150,
      online: false,
      mutualFriends: 6,
      verified: true
    },
    {
      id: 'usr_mariana_costa',
      name: 'Mariana Costa',
      username: 'mariana_costa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      rank: 'cabo',
      location: 'Goiânia, GO',
      honorPoints: 380,
      online: true,
      mutualFriends: 14,
      verified: false
    },
    {
      id: 'usr_andre_oliveira',
      name: 'André Oliveira',
      username: 'andre_oliveira',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
      rank: 'soldado',
      location: 'Salvador, BA',
      honorPoints: 210,
      online: false,
      mutualFriends: 8,
      verified: false
    },
    {
      id: 'usr_dias_es',
      name: 'Sargento Dias',
      username: 'sgt_dias',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      rank: 'sargento',
      location: 'Vitória, ES',
      honorPoints: 730,
      online: true,
      mutualFriends: 21,
      verified: true
    },
    {
      id: 'usr_beatriz_ms',
      name: 'Beatriz Santos',
      username: 'beatriz_ms',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      rank: 'cabo',
      location: 'Campo Grande, MS',
      honorPoints: 390,
      online: false,
      mutualFriends: 12,
      verified: false
    }
  ]);

  // 3 Pending friend requests
  const [requestsList, setRequestsList] = useState<FriendItem[]>([
    {
      id: 'req_1',
      name: 'Lucas Martins',
      username: 'lucas_patriota',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      rank: 'soldado',
      location: 'Campinas, SP',
      honorPoints: 120,
      online: true,
      mutualFriends: 5
    },
    {
      id: 'req_2',
      name: 'Camila Rocha',
      username: 'camila_direita',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      rank: 'cabo',
      location: 'Joinville, SC',
      honorPoints: 340,
      online: false,
      mutualFriends: 8
    },
    {
      id: 'req_3',
      name: 'Major Valdir',
      username: 'major_valdir',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      rank: 'major',
      location: 'Fortaleza, CE',
      honorPoints: 3400,
      online: true,
      mutualFriends: 19,
      verified: true
    }
  ]);

  const [sentRequests, setSentRequests] = useState<string[]>([]);

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
    if (confirm(`Deseja desfazer a amizade com ${friendName}?`)) {
      setFriendsList(prev => prev.filter(f => f.id !== friendId));
      showToast(`Amizade com ${friendName} desfeita.`);
    }
  };

  const handleAddDiscoverFriend = (userId: string, userName: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSentRequests(prev => [...prev, userId]);
    showToast(`Solicitação de amizade enviada para ${userName}!`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {([
            {
              id: 'disc_1',
              name: 'Gustavo Mendonça',
              username: 'gustavo_patriota',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
              rank: 'cabo',
              location: 'Curitiba, PR',
              bio: 'Defensor da propriedade privada, da família e das liberdades individuais.'
            },
            {
              id: 'disc_2',
              name: 'Juliana Ferreira',
              username: 'juliana_agro',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
              rank: 'soldado',
              location: 'Ribeirão Preto, SP',
              bio: 'Engenheira agrônoma. O agro sustenta nossa nação com muito orgulho.'
            },
            {
              id: 'disc_3',
              name: 'Capitão Ramos',
              username: 'cap_ramos',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
              rank: 'capitao',
              location: 'Manaus, AM',
              bio: 'Vigilância contínua da Amazônia e soberania militar nacional.'
            },
            {
              id: 'disc_4',
              name: 'Dr. Paulo Victor',
              username: 'paulovictor_adv',
              avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
              rank: 'tenente',
              location: 'Goiânia, GO',
              bio: 'Advogado constitucionalista em defesa da liberdade de expressão.'
            }
          ] as { id: string; name: string; username: string; avatar: string; rank: UserRank; location: string; bio: string; }[]).map((patriot) => {
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
                        <span>Solicitação Enviada</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Adicionar Amigo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
