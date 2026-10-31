import React from 'react';
import { 
  Flame, 
  Users, 
  ChevronRight, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { User, DebateTopic, Group } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface SidebarRightProps {
  currentUser: User | null;
  debates: DebateTopic[];
  groups: Group[];
  suggestedUsers: User[];
  onNavigate: (view: string, param?: string) => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onOpenManifesto?: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  currentUser,
  debates,
  groups,
  suggestedUsers,
  onNavigate,
  onRefresh,
  onOpenAuth,
  onOpenManifesto
}) => {
  // 1. Trending topics matching screenshot exactly
  const trendingTopics = [
    { tag: '#BrasilForte', count: '128 mil posts' },
    { tag: '#Liberdade', count: '97 mil posts' },
    { tag: '#Segurança', count: '78 mil posts' },
    { tag: '#DireitaJá', count: '62 mil posts' },
    { tag: '#DeusPátriaFamília', count: '51 mil posts' }
  ];

  // 2. Active members matching screenshot exactly
  const activeMembers = [
    {
      id: 'usr_patriota22',
      username: 'patriota22',
      name: 'Patriota22',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      status: 'Online agora'
    },
    {
      id: 'usr_brasillivre',
      username: 'brasillivre',
      name: 'BrasilLivre',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
      status: 'Online agora'
    },
    {
      id: 'usr_direitaja',
      username: 'direitaja',
      name: 'DireitaJá',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      status: 'Online agora'
    }
  ];

  // 3. Featured debate matching screenshot
  const featuredDebate = debates.find(d => d.id === 'deb_futuro_brasil') || debates[0] || {
    id: 'deb_futuro_brasil',
    title: 'Qual o futuro do Brasil?',
    category: 'Política',
    repliesCount: 124
  };

  // 4. Featured groups matching screenshot
  const featuredGroups = [
    {
      id: 'grp_brasil_forte',
      name: 'Brasil Forte',
      members: '253 mil membros',
      image: '/src/assets/images/brasil_bandeira_card_1793411895078.jpg'
    },
    {
      id: 'grp_direita_brasil',
      name: 'Direita Brasil',
      members: '184 mil membros',
      image: '/src/assets/images/brasil_hero_banner_1793411883121.jpg'
    }
  ];

  const handleToggleGroup = (groupId: string, groupName: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const result = storageService.toggleGroupMember(groupId, currentUser.id);
    showToast(result.joined ? `Você entrou no grupo ${groupName}!` : `Você saiu do grupo ${groupName}`);
    onRefresh();
  };

  return (
    <aside className="w-[310px] shrink-0 hidden xl:flex flex-col gap-3.5 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto pl-1 select-none">
      
      {/* 1. ASSUNTOS POPULARES */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#F5F5F0]">
          <Flame className="w-4 h-4 text-[#E5AC24] fill-[#E5AC24]" />
          <span>Assuntos Populares</span>
        </div>

        <div className="divide-y divide-[#263B30]/40">
          {trendingTopics.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('explore', item.tag)}
              className="py-2 flex items-center justify-between hover:bg-[#15291F] px-1.5 rounded-xl cursor-pointer transition group"
            >
              <div>
                <div className="text-xs font-bold text-[#F5F5F0] group-hover:text-[#E8CC76] transition">
                  {item.tag}
                </div>
                <div className="text-[10px] text-[#A5B2A9]">
                  {item.count}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A5B2A9] group-hover:text-[#E8CC76] transition" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. MEMBROS ATIVOS */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#F5F5F0]">
          <Users className="w-4 h-4 text-[#E5AC24]" />
          <span>Membros Ativos</span>
        </div>

        <div className="space-y-2.5">
          {activeMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onNavigate('profile', member.username)}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#15291F] cursor-pointer transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]/40"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#102019]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F5F0] group-hover:text-[#E8CC76] transition">
                    {member.name}
                  </div>
                  <div className="text-[10px] text-[#22C55E] font-medium">
                    {member.status}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A5B2A9] group-hover:text-[#E8CC76] transition" />
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="w-full mt-2.5 pt-2 border-t border-[#263B30]/60 text-left text-[11px] font-bold text-[#E5AC24] hover:text-[#FFF5D0] flex items-center justify-between transition"
        >
          <span>Ver todos</span>
          <span>→</span>
        </button>
      </div>

      {/* 3. PATRIOTIC CARD BANNER: BRASIL ACIMA DE TUDO, DEUS ACIMA DE TODOS! */}
      <div 
        onClick={() => onOpenManifesto ? onOpenManifesto() : onNavigate('explore')}
        className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 shadow-lg cursor-pointer group h-28 flex items-center justify-center p-3"
      >
        <img
          src="/src/assets/images/brasil_bandeira_card_1793411895078.jpg"
          alt="Bandeira do Brasil"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        
        <div className="relative z-10 text-center px-2">
          <h4 className="font-serif-patriotic font-black text-xs sm:text-sm text-[#FFDD00] leading-snug tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
            BRASIL ACIMA DE TUDO,<br />DEUS ACIMA DE TODOS!
          </h4>
        </div>
      </div>

      {/* 4. DEBATES EM ANDAMENTO */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F0]">
            <MessageSquare className="w-4 h-4 text-[#E5AC24]" />
            <span>Debates em Andamento</span>
          </div>
          <button
            onClick={() => onNavigate('debates')}
            className="text-[10px] font-bold text-[#E5AC24] hover:underline"
          >
            Ver todos →
          </button>
        </div>

        <div
          onClick={() => onNavigate('debates', featuredDebate.id)}
          className="p-2 rounded-xl bg-[#0b1712] border border-[#263B30] hover:border-[#D4AF37]/50 cursor-pointer transition flex items-center gap-3 group mt-1"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#263B30]">
            <img
              src="/src/assets/images/brasil_bandeira_card_1793411895078.jpg"
              alt="Debate"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-[#F5F5F0] truncate group-hover:text-[#E8CC76] transition">
              {featuredDebate.title}
            </h5>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E5AC24] text-[#07140F] font-extrabold uppercase">
                {featuredDebate.category || 'POLÍTICA'}
              </span>
              <span className="text-[10px] text-[#A5B2A9]">
                {featuredDebate.repliesCount || 124} respostas · 3h atrás
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GRUPOS EM DESTAQUE */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 shadow-md">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-[#F5F5F0]">
          <Users className="w-4 h-4 text-[#E5AC24]" />
          <span>Grupos em Destaque</span>
        </div>

        <div className="space-y-2.5">
          {featuredGroups.map((grp) => {
            const isMember = currentUser ? groups.find(g => g.id === grp.id)?.memberUserIds?.includes(currentUser.id) : false;
            return (
              <div key={grp.id} className="flex items-center justify-between gap-2">
                <div 
                  onClick={() => onNavigate('groups', grp.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
                >
                  <img
                    src={grp.image}
                    alt={grp.name}
                    className="w-9 h-9 rounded-xl object-cover border border-[#263B30] shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#F5F5F0] truncate group-hover:text-[#E8CC76]">
                      {grp.name}
                    </h5>
                    <p className="text-[10px] text-[#A5B2A9]">
                      {grp.members}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleGroup(grp.id, grp.name)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition shrink-0 border cursor-pointer ${
                    isMember
                      ? 'bg-[#15291F] border-[#263B30] text-[#A5B2A9]'
                      : 'bg-[#0b1712] hover:bg-[#174D32] text-[#F5F5F0] hover:text-[#E8CC76] border-[#263B30] hover:border-[#D4AF37]/50'
                  }`}
                >
                  {isMember ? 'Participando' : 'Participar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
