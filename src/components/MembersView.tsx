import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Award, 
  Check, 
  MessageSquare,
  UserX,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { User, UserRank } from '../types';
import { storageService } from '../services/storageService';
import { RankBadge } from './RankBadge';
import { RANK_DEFINITIONS } from '../services/rankService';
import { showToast } from './Toast';

interface MembersViewProps {
  currentUser: User | null;
  onNavigateToUser: (username: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  currentUser,
  onNavigateToUser,
  onNavigate,
  onRefresh,
  onOpenAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const allUsers = storageService.getUsers();
  const isAdmin = currentUser?.role === 'admin';

  // Filtered list
  const filteredUsers = allUsers.filter(u => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchLocation = (u.location || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchLocation) {
        return false;
      }
    }

    // Role filter
    if (filterRole !== 'all' && u.role !== filterRole) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all' && u.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const handleDeleteUser = (u: User) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Apenas administradores podem excluir membros.', 'error');
      return;
    }

    if (u.id === currentUser.id) {
      showToast('Você não pode excluir sua própria conta de administrador.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ ATENÇÃO ADMINISTRADOR:\n\nDeseja realmente excluir o membro @${u.username} (${u.name}) definitivamente da plataforma?\n\nTodas as publicações, comentários, empresas e dados associados serão apagados permanentemente.`
    );

    if (confirmed) {
      const deleted = storageService.deleteUser(u.id, currentUser);
      if (deleted) {
        showToast(`Membro @${u.username} excluído definitivamente com sucesso.`);
        onRefresh();
      } else {
        showToast('Erro ao excluir membro.', 'error');
      }
    }
  };

  const handleToggleAdmin = (u: User) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (u.id === currentUser.id) {
      showToast('Você não pode alterar seu próprio cargo.', 'error');
      return;
    }
    const newRole = storageService.toggleUserRole(u.id, currentUser);
    showToast(`Cargo de @${u.username} alterado para ${newRole}.`);
    onRefresh();
  };

  const handleToggleStatus = (u: User, newStatus: 'active' | 'suspended') => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (u.id === currentUser.id) {
      showToast('Você não pode suspender sua própria conta.', 'error');
      return;
    }
    storageService.setUserStatus(u.id, newStatus, currentUser);
    showToast(`Status de @${u.username} atualizado para ${newStatus === 'active' ? 'Ativo' : 'Suspenso'}.`);
    onRefresh();
  };

  const handlePromoteRank = (u: User, newRank: UserRank) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const ok = storageService.setUserRank(u.id, newRank, currentUser);
    if (ok) {
      showToast(`Patente de @${u.username} atualizada para ${RANK_DEFINITIONS[newRank]?.title || newRank}.`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0c2016] via-[#153424] to-[#0c2016] border border-[#263B30] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              Comunidade Cívica Oficial
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F0] font-serif-patriotic tracking-tight">
              Membros Cadastrados
            </h1>
            <p className="text-xs sm:text-sm text-[#A5B2A9] leading-relaxed">
              Consulte os patriotas cadastrados na plataforma, veja detalhes de perfil e exerça a moderação cívica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-[#07140F]/80 border border-[#263B30] text-center">
              <div className="text-[10px] text-[#A5B2A9] font-medium uppercase">Total de Membros</div>
              <div className="text-lg font-black text-[#F5F5F0]">{allUsers.length}</div>
            </div>

            {isAdmin && (
              <div className="px-3 py-2 rounded-2xl bg-[#174D32] border border-[#D4AF37]/50 text-center flex items-center gap-1.5 text-xs text-[#E8CC76] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Poder de Exclusão Ativo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome, @username, cidade ou e-mail..."
              className="w-full bg-[#07140F] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] pl-10 pr-4 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#07140F] p-1 rounded-xl border border-[#263B30]">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterRole === 'all'
                    ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                    : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Todos ({allUsers.length})
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterRole === 'admin'
                    ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                    : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Admins ({allUsers.filter(u => u.role === 'admin').length})
              </button>
            </div>

            <div className="flex items-center bg-[#07140F] p-1 rounded-xl border border-[#263B30]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'all' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Status: Todos
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'active' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Ativos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERS LIST (RESPONSIVE CARDS) */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredUsers.map((u) => {
            const isSelf = currentUser?.id === u.id;
            const rankTitle = RANK_DEFINITIONS[u.rank || 'soldado']?.title || 'Soldado Cívico';

            return (
              <div
                key={u.id}
                className="bg-[#102019] rounded-2xl border border-[#263B30] hover:border-[#D4AF37]/50 transition p-4 shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header: Avatar + Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      onClick={() => onNavigateToUser(u.username)}
                      className="relative shrink-0 cursor-pointer"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-[#D4AF37]/60 group-hover:scale-105 transition"
                      />
                      {u.role === 'admin' && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-[#D4AF37] text-[#07140F]" title="Administrador Oficial">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div 
                        onClick={() => onNavigateToUser(u.username)}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <h3 className="font-bold text-sm text-[#F5F5F0] truncate group-hover:text-[#E8CC76] transition">
                          {u.name}
                        </h3>
                        {u.verified && (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0" title="Verificado">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-[#A5B2A9] flex items-center gap-1 truncate">
                        <span>@{u.username}</span>
                        {isSelf && <span className="text-[#E8CC76] font-bold">(Você)</span>}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <RankBadge rank={u.rank} size="xs" />
                        <span className="text-[10px] text-[#E8CC76] font-semibold truncate">
                          {rankTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {u.bio && (
                    <p className="text-[11px] text-[#A5B2A9] line-clamp-2 leading-relaxed mb-3 bg-[#07140F]/60 p-2 rounded-xl border border-[#263B30]/40">
                      {u.bio}
                    </p>
                  )}

                  {/* Badges / metadata */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#A5B2A9] mb-3">
                    {u.location && (
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{u.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-semibold text-[#F5F5F0]">Pontos:</span>
                      <span className="text-[#E8CC76] font-bold">{u.honorPoints || 0} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                        u.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
                      }`}>
                        {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </div>
                  </div>

                  {/* Admin inline controls: change patent */}
                  {isAdmin && (
                    <div className="mb-3 pt-2 border-t border-[#263B30]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#A5B2A9]">Alterar Patente Cívica:</span>
                        <select
                          value={u.rank || 'soldado'}
                          onChange={(e) => handlePromoteRank(u, e.target.value as UserRank)}
                          className="bg-[#07140F] text-[10px] text-[#E8CC76] border border-[#263B30] rounded px-1.5 py-0.5 focus:border-[#D4AF37] cursor-pointer"
                        >
                          {Object.keys(RANK_DEFINITIONS).map((rKey) => (
                            <option key={rKey} value={rKey}>
                              {RANK_DEFINITIONS[rKey as UserRank].name} ({RANK_DEFINITIONS[rKey as UserRank].title})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          disabled={isSelf}
                          className="flex-1 py-1 rounded bg-[#15291F] hover:bg-[#1f3d28] border border-[#263B30] text-[10px] text-[#E8CC76] font-semibold transition disabled:opacity-40"
                        >
                          {u.role === 'admin' ? 'Tirar Admin' : 'Tornar Admin'}
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u, u.status === 'active' ? 'suspended' : 'active')}
                          disabled={isSelf}
                          className={`flex-1 py-1 rounded text-[10px] font-semibold transition disabled:opacity-40 border ${
                            u.status === 'active'
                              ? 'bg-[#2a1414] text-[#D94B4B] border-[#D94B4B]/30 hover:bg-[#3d1818]'
                              : 'bg-[#174D32] text-[#E8CC76] border-[#D4AF37]/40 hover:bg-[#226B47]'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspender' : 'Reativar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM ACTIONS: ENTRAR NO PERFIL & DELETAR */}
                <div className="pt-3 border-t border-[#263B30] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToUser(u.username)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <span>Entrar no Perfil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {/* DELETAR MEMBRO — EXCLUSIVO PARA O ADMINISTRADOR */}
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="py-2 px-3 rounded-xl bg-[#3b1212] hover:bg-[#521919] text-[#FF4D4D] border border-[#FF4D4D]/40 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-98"
                      title="Excluir este membro definitivamente do site"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Deletar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] space-y-3">
          <Users className="w-12 h-12 text-[#A5B2A9] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#F5F5F0]">Nenhum membro encontrado</h3>
          <p className="text-xs text-[#A5B2A9] max-w-sm mx-auto">
            Não encontramos membros com esses termos de pesquisa.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-[#15291F] hover:bg-[#1f3d28] text-[#E8CC76] rounded-xl text-xs font-bold border border-[#263B30] transition"
          >
            Limpar Filtros
          </button>
        </div>
      )}

    </div>
  );
};
