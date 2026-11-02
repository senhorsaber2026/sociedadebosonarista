import React from 'react';
import { 
  Home, 
  User as UserIcon, 
  Compass, 
  Newspaper, 
  MessageSquare, 
  Users, 
  Flame, 
  Bookmark, 
  Shield, 
  Settings, 
  Crown,
  Check,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Landmark,
  Store,
  Heart
} from 'lucide-react';
import { User, Group } from '../types';
import { storageService } from '../services/storageService';

interface SidebarLeftProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth: () => void;
  onOpenRanksModal: () => void;
  onOpenManifesto?: () => void;
  onOpenDonationModal?: () => void;
  groups: Group[];
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenCreatePost,
  onOpenAuth,
  onOpenRanksModal,
  onOpenManifesto,
  onOpenDonationModal,
  groups
}) => {
  const unreadMessagesCount = currentUser 
    ? storageService.getMessagesForUser(currentUser.id).filter(m => m.receiverId === currentUser.id && !m.read).length
    : 0;

  const followingCount = currentUser ? storageService.getFollowingCount(currentUser.id) : 0;

  // Navigation items matching exact user brief and screenshot order:
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'register', label: 'Cadastro de Membro', icon: ShieldCheck, badge: 'NOVO', isPill: false },
    { id: 'companies', label: 'Empresas Patriotas', icon: Store, badge: 'VITRINE', isPill: false },
    { id: 'memorial', label: 'Ala Memorial', icon: Landmark, badge: 'ALA', isPill: false },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, authRequired: true, param: currentUser?.username },
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'debates', label: 'Debates', icon: Flame },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'friends', label: 'Amigos', icon: UserCheck, badge: followingCount > 0 ? String(followingCount) : undefined, isPill: true },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare, badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined, isPill: true, authRequired: true },
    { id: 'saved', label: 'Salvos', icon: Bookmark, authRequired: true },
    { id: 'settings', label: 'Configurações', icon: Settings, authRequired: true },
  ];

  // If user is admin, add Admin Panel button
  if (currentUser?.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Painel Admin',
      icon: Shield,
      badge: 'ADMIN',
      isPill: false
    });
  }

  // Real featured communities from groups prop - use top 3 groups
  const featuredCommunities = groups.slice(0, 3).map(g => ({
    id: g.id,
    name: g.name,
    members: g.membersCount > 1000
      ? `${(g.membersCount / 1000).toFixed(1)} mil membros`
      : `${g.membersCount} ${g.membersCount === 1 ? 'membro' : 'membros'}`,
    image: g.coverImage || '/src/assets/images/brasil_bandeira_card_1793411895078.jpg'
  }));

  return (
    <aside className="w-[250px] shrink-0 hidden lg:flex flex-col gap-3.5 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1 select-none">
      
      {/* 1. USER PROFILE MINI-CARD MATCHING SCREENSHOT */}
      {currentUser ? (
        <div 
          onClick={() => onNavigate('profile', currentUser.username)}
          className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] hover:border-[#D4AF37]/50 cursor-pointer transition shadow-md group flex items-center gap-3"
        >
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#E5AC24] to-[#FFF5D0] group-hover:scale-105 transition">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-[#F5F5F0] break-words leading-tight group-hover:text-[#E8CC76] transition">
                {currentUser.name}
              </h4>
              <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0" title="Verificado">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
            </div>

            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-[#E5AC24]">
              <Crown className="w-3.5 h-3.5 fill-[#E5AC24]" />
              <span>Membro Premium</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center space-y-2">
          <h4 className="text-xs font-bold text-[#F5F5F0]">Sociedade Bosonarista</h4>
          <p className="text-[11px] text-[#A5B2A9]">
            Acesse sua conta para participar da comunidade cívica.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full py-1.5 bg-[#E5AC24] text-[#07140F] font-bold text-xs rounded-xl hover:brightness-110 shadow"
          >
            Entrar / Cadastrar
          </button>
        </div>
      )}

      {/* 2. NAVIGATION LIST MATCHING SCREENSHOT */}
      <nav className="bg-[#102019] rounded-2xl border border-[#263B30] p-1.5 space-y-0.5 shadow-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.authRequired && !currentUser) {
                  onOpenAuth();
                } else {
                  onNavigate(item.id, item.param);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-[#E5AC24] text-[#07140F] shadow-md'
                  : 'text-[#A5B2A9] hover:bg-[#15291F] hover:text-[#F5F5F0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#07140F]' : 'text-[#A5B2A9]'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  item.isPill
                    ? 'bg-[#D94B4B] text-white'
                    : 'bg-[#174D32] text-[#E8CC76]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. COMUNIDADES EM DESTAQUE */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3.5 shadow-md">
        <h3 className="text-xs font-bold text-[#E5AC24] mb-2.5">
          Comunidades em Destaque
        </h3>

        {featuredCommunities.length === 0 ? (
          <div className="py-3 px-2 text-center bg-[#0d1a14] rounded-xl border border-dashed border-[#263B30] text-[11px] text-[#A5B2A9]">
            <span>Nenhuma comunidade criada ainda.</span>
            <button
              onClick={() => onNavigate('groups')}
              className="block mx-auto mt-1.5 text-[#E5AC24] font-bold hover:underline"
            >
              + Criar Comunidade
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {featuredCommunities.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('groups', c.id)}
                className="flex items-center gap-2.5 cursor-pointer group hover:bg-[#15291F] p-1 rounded-xl transition"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#263B30] bg-[#07140F]">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#F5F5F0] truncate group-hover:text-[#E8CC76] transition">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-[#A5B2A9] truncate">
                    {c.members}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => onNavigate('groups')}
          className="w-full mt-3 pt-2 border-t border-[#263B30]/60 text-left text-[11px] font-bold text-[#E5AC24] hover:text-[#FFF5D0] flex items-center justify-between transition"
        >
          <span>Ver todas</span>
          <span>→</span>
        </button>
      </div>

      {/* 4. PATRIOTIC BOTTOM BANNER CARD MATCHING SCREENSHOT */}
      <div 
        onClick={() => onOpenManifesto ? onOpenManifesto() : onNavigate('explore')}
        className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 shadow-lg cursor-pointer group min-h-[112px] h-28 shrink-0 flex items-center justify-center p-3"
      >
        <img
          src="/src/assets/images/brasil_bandeira_card_1793411895078.jpg"
          alt="Bandeira do Brasil"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="relative z-10 text-center">
          <h4 className="font-serif-patriotic font-black text-sm text-[#FFDD00] leading-tight tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
            JUNTOS<br />POR UM BRASIL<br />AINDA MELHOR
          </h4>
        </div>
      </div>

    </aside>
  );
};
