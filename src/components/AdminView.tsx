import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Newspaper, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Star, 
  Search, 
  Activity,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserX,
  UserCheck,
  Video,
  StopCircle,
  RefreshCw,
  Flag,
} from 'lucide-react';
import { User, NewsItem, ReportItem, AuditLogItem, UserRank, LiveSession, LiveChatMessage, LiveViewerPresence, LiveChatReport, LiveModerationAction } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';
import { RankBadge } from './RankBadge';
import { RANK_DEFINITIONS } from '../services/rankService';

interface AdminViewProps {
  currentUser: User | null;
  onRefresh: () => void;
  onOpenArticle: (newsItem: NewsItem) => void;
  onOpenLivePlayer?: (session: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  onRefresh,
  onOpenArticle,
  onOpenLivePlayer
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'news' | 'users' | 'reports' | 'logs' | 'lives'>('stats');
  const [userSearch, setUserSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  const isAdmin = currentUser?.role === 'admin';

  // If user is not admin, provide clear feedback without public test bypass
  if (!currentUser || !isAdmin) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#102019] border border-[#D94B4B]/50 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2a1414] border border-[#D94B4B] flex items-center justify-center mx-auto text-[#D94B4B]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
          Acesso Restrito à Administração Central
        </h2>
        <p className="text-xs sm:text-sm text-[#A5B2A9] max-w-lg mx-auto leading-relaxed">
          Este painel contém ferramentas de moderação institucional, auditoria jurídica e controle de membros reservadas exclusivamente aos administradores oficiais da Sociedade Bosonarista.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#174D32] hover:bg-[#1f6643] text-[#E8CC76] font-bold text-xs shadow-lg transition"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  const stats = storageService.getAdminStats();
  const allUsers = storageService.getUsers();
  const newsList = storageService.getNews();
  const reportsList = storageService.getReports(reportFilter);
  const auditLogs = storageService.getAuditLogs();

  // Dados de transmissões ao vivo (busca via API)
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [livePresence, setLivePresence] = useState<LiveViewerPresence[]>([]);
  const [liveReports, setLiveReports] = useState<LiveChatReport[]>([]);
  const [liveModeration, setLiveModeration] = useState<LiveModerationAction[]>([]);
  const [livesLoading, setLivesLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || process.env.APP_URL || '';

  const loadLiveData = async () => {
    setLivesLoading(true);
    try {
      const [sessionsRes, presenceRes, reportsRes, modRes] = await Promise.all([
        fetch(`${API_BASE}/api/live-sessions`),
        fetch(`${API_BASE}/api/live-viewer-presence`),
        fetch(`${API_BASE}/api/live-chat/reports`),
        fetch(`${API_BASE}/api/live-sessions/moderation`),
      ]);
      if (sessionsRes.ok) setLiveSessions(await sessionsRes.json());
      if (presenceRes.ok) setLivePresence(await presenceRes.json());
      if (reportsRes.ok) setLiveReports(await reportsRes.json());
      if (modRes.ok) setLiveModeration(await modRes.json());
    } catch (e) {
      console.error('Erro ao carregar dados de lives:', e);
    } finally {
      setLivesLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleToggleUserStatus = (u: User, newStatus: 'active' | 'suspended' | 'banned') => {
    storageService.setUserStatus(u.id, newStatus, currentUser);
    showToast(`Status de @${u.username} alterado para: ${newStatus}`);
    onRefresh();
  };

  const handleToggleUserAdminRole = (u: User) => {
    if (u.id === currentUser.id) {
      showToast('Você não pode alterar sua própria permissão.', 'error');
      return;
    }
    const newRole = storageService.toggleUserRole(u.id, currentUser);
    showToast(`Cargo de @${u.username} atualizado para ${newRole}.`);
    onRefresh();
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === currentUser.id) {
      showToast('Você não pode excluir sua própria conta de administrador.', 'error');
      return;
    }
    if (confirm(`ATENÇÃO: Deseja realmente excluir o membro @${u.username} (${u.name}) definitivamente da plataforma?\n\nTodas as publicações, comentários, empresas e dados associados serão removidos permanentemente.`)) {
      const deleted = storageService.deleteUser(u.id, currentUser);
      if (deleted) {
        showToast(`Membro @${u.username} excluído definitivamente com sucesso.`);
        onRefresh();
      } else {
        showToast('Erro ao excluir membro.', 'error');
      }
    }
  };

  const handlePromoteRank = (targetUser: User, newRank: UserRank) => {
    if (!currentUser) return;
    const updated = storageService.setUserRank(targetUser.id, newRank, currentUser);
    if (updated) {
      showToast(`Patente de @${targetUser.username} alterada para ${RANK_DEFINITIONS[newRank].title}`, 'success');
      onRefresh();
    }
  };

  const handleResolveReport = (report: ReportItem, action: 'remover_conteudo' | 'advertir' | 'suspender' | 'ignorar') => {
    storageService.resolveReport(report.id, action, 'Ação de moderação executada pelo administrador', currentUser);
    showToast(`Ação "${action}" aplicada à denúncia com sucesso.`);
    onRefresh();
  };

  const handleToggleNewsFeatured = (item: NewsItem) => {
    storageService.toggleFeaturedNews(item.id, currentUser);
    onRefresh();
  };

  const handleDeleteNews = (item: NewsItem) => {
    if (confirm(`Excluir a notícia "${item.title}"?`)) {
      storageService.deleteNews(item.id, currentUser);
      showToast('Notícia excluída.');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
            <Shield className="w-4 h-4" />
            <span>Painel Institucional Administrativo</span>
          </div>
          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            Gestão & Moderação da Sociedade Bosonarista
          </h2>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Acompanhe métricas, modere denúncias, audite publicações e gerencie notícias oficiais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            Administrador Ativo
          </span>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Patriotas</span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5">{stats.totalUsers.toLocaleString('pt-BR')}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Ativos Hoje</span>
          <div className="text-base sm:text-lg font-bold text-[#E8CC76] mt-0.5">{stats.activeUsers.toLocaleString('pt-BR')}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Publicações</span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5">{stats.totalPosts.toLocaleString('pt-BR')}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Comentários</span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5">{stats.totalComments.toLocaleString('pt-BR')}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Comunidades</span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5">{stats.totalGroups}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center">
          <span className="text-[10px] text-[#A5B2A9]">Notícias</span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5">{stats.totalNews}</div>
        </div>
        <div className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#D94B4B] font-semibold">Denúncias</span>
          <div className="text-base sm:text-lg font-bold text-[#D94B4B] mt-0.5">{stats.pendingReports}</div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex border-b border-[#263B30] text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap ${
            activeTab === 'stats' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          Visão Geral & Indicadores
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          <span>Fila de Denúncias</span>
          {stats.pendingReports > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#D94B4B] text-[#F5F5F0] text-[10px] font-bold">
              {stats.pendingReports}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap ${
            activeTab === 'users' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          Gerenciar Usuários ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap ${
            activeTab === 'news' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          Gerenciar Notícias ({newsList.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          Registros de Auditoria (Logs)
        </button>

        <button
          onClick={() => setActiveTab('lives')}
          className={`py-2.5 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'lives' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Gerenciar Transmissões</span>
          {liveSessions.filter(s => s.status === 'live').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#D94B4B] text-[#F5F5F0] text-[10px] font-bold">
              AO VIVO
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30] space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
              <span>Diretrizes e Segurança Operacional</span>
            </h4>
            <p className="text-xs text-[#A5B2A9] leading-relaxed">
              O sistema protege a liberdade cívica de manifestação mantendo a ordem conforme os termos de serviço e a legislação nacional. Todos os relatórios de auditoria são assinados digitalmente.
            </p>
            <div className="p-3 bg-[#15291F] rounded-xl text-xs space-y-2 border border-[#263B30]">
              <div className="flex justify-between">
                <span className="text-[#A5B2A9]">Status do Banco de Dados:</span>
                <span className="text-emerald-400 font-semibold">Online & Sincronizado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5B2A9]">Compliance LGPD:</span>
                <span className="text-emerald-400 font-semibold">100% Em Conformidade</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5B2A9]">Política de Moderação:</span>
                <span className="text-[#E8CC76] font-semibold">Proativo & Reativo</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30] space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Ações Rápidas de Manutenção</span>
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  storageService.resetDefaults();
                  showToast('Banco de dados restaurado para os dados iniciais padrão com sucesso.');
                  window.location.reload();
                }}
                className="w-full text-left p-3 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] text-[#F5F5F0] font-semibold transition"
              >
                ↺ Restaurar Dados Demonstrativos Padrão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS & MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {(['pending', 'resolved', 'dismissed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setReportFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  reportFilter === status ? 'bg-[#174D32] text-[#E8CC76]' : 'bg-[#102019] text-[#A5B2A9]'
                }`}
              >
                {status === 'pending' ? 'Pendentes de Análise' : status === 'resolved' ? 'Resolvidas' : 'Descartadas'}
              </button>
            ))}
          </div>

          {reportsList.length > 0 ? (
            <div className="space-y-3">
              {reportsList.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#102019] border border-[#263B30] text-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#2a1414] text-[#D94B4B] font-bold border border-[#D94B4B]/30">
                        Motivo: {rep.reason}
                      </span>
                      <span className="text-[#A5B2A9]">Tipo: {rep.contentType}</span>
                    </div>
                    <span className="text-[#A5B2A9]">
                      Denunciado por {rep.reporterName} em {new Date(rep.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#15291F] border border-[#263B30] text-[#F5F5F0]">
                    <span className="text-[#A5B2A9] text-[10px] block mb-1">Trecho do Conteúdo:</span>
                    "{rep.contentSnippet}"
                  </div>

                  {rep.details && (
                    <p className="text-xs text-[#A5B2A9]">
                      <strong>Detalhes informados:</strong> {rep.details}
                    </p>
                  )}

                  {rep.status === 'pending' && (
                    <div className="pt-2 border-t border-[#263B30] flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep, 'remover_conteudo')}
                        className="px-3 py-1.5 rounded-xl bg-[#D94B4B] text-white font-bold text-xs hover:brightness-110"
                      >
                        Remover Conteúdo
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep, 'advertir')}
                        className="px-3 py-1.5 rounded-xl bg-[#15291F] border border-[#D4AF37] text-[#E8CC76] font-semibold text-xs hover:bg-[#203a2c]"
                      >
                        Advertir Autor
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep, 'suspender')}
                        className="px-3 py-1.5 rounded-xl bg-[#2a1414] border border-[#D94B4B] text-[#D94B4B] font-semibold text-xs hover:bg-[#3d1818]"
                      >
                        Suspender Conta
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep, 'ignorar')}
                        className="px-3 py-1.5 rounded-xl bg-[#15291F] text-[#A5B2A9] font-medium text-xs hover:text-[#F5F5F0]"
                      >
                        Descartar Denúncia
                      </button>
                    </div>
                  )}

                  {rep.status !== 'pending' && (
                    <div className="text-[11px] text-[#D4AF37] pt-1">
                      Status: {rep.status === 'resolved' ? 'Resolvido' : 'Descartado'} ({rep.actionTaken || 'Concluído'})
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#102019] text-xs text-[#A5B2A9]">
              Nenhuma denúncia nesta categoria no momento.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Pesquisar por nome, username ou email..."
              className="w-full bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#263B30]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b1712] text-[#A5B2A9] border-b border-[#263B30]">
                <tr>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Patente Cívica</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações de Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B30]/40 bg-[#102019]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#15291F] transition">
                    <td className="p-3 flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-[#F5F5F0]">{u.name}</div>
                        <div className="text-[10px] text-[#A5B2A9]">@{u.username}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <RankBadge rank={u.rank} size="xs" />
                          <span className="text-[10px] text-[#A5B2A9]">({u.honorPoints || 0} pts)</span>
                        </div>
                        <select
                          value={u.rank || 'soldado'}
                          onChange={(e) => handlePromoteRank(u, e.target.value as UserRank)}
                          className="bg-[#07140F] text-[10px] text-[#E8CC76] border border-[#263B30] rounded px-1.5 py-0.5 focus:border-[#D4AF37] cursor-pointer"
                          title="Alterar patente por mérito / decreto administrativo"
                        >
                          {Object.keys(RANK_DEFINITIONS).map((rKey) => (
                            <option key={rKey} value={rKey}>
                              {RANK_DEFINITIONS[rKey as UserRank].name} - {RANK_DEFINITIONS[rKey as UserRank].title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-3 text-[#A5B2A9]">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-[#D4AF37] text-[#07140F]' : 'bg-[#15291F] text-[#A5B2A9]'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
                      }`}>
                        {u.status === 'active' ? 'Ativo' : u.status === 'suspended' ? 'Suspenso' : 'Banido'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleUserAdminRole(u)}
                        className="px-2 py-1 rounded bg-[#15291F] text-[#E8CC76] border border-[#263B30] hover:border-[#D4AF37]"
                        title="Alternar Cargo Admin"
                      >
                        {u.role === 'admin' ? 'Tirar Admin' : 'Tornar Admin'}
                      </button>

                      {u.status === 'active' ? (
                        <button
                          onClick={() => handleToggleUserStatus(u, 'suspended')}
                          className="px-2 py-1 rounded bg-[#2a1414] text-[#D94B4B] hover:bg-[#3d1818]"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleUserStatus(u, 'active')}
                          className="px-2 py-1 rounded bg-[#174D32] text-[#E8CC76] hover:bg-[#226B47]"
                        >
                          Reativar
                        </button>
                      )}

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="px-2 py-1 rounded bg-[#3b1212] text-[#FF4D4D] border border-[#FF4D4D]/40 hover:bg-[#521919] transition font-bold"
                          title="Excluir Membro Definitivamente (Poder de Administrador)"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NEWS MANAGEMENT */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {newsList.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#102019] border border-[#263B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={item.imageUrl} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#E8CC76] text-[10px]">{item.category}</span>
                      {item.isFeatured && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37] text-[#07140F] font-bold rounded">
                          DESTAQUE
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-[#F5F5F0] truncate">{item.title}</h5>
                    <p className="text-[10px] text-[#A5B2A9]">Por {item.authorName} • {new Date(item.publishedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenArticle(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#15291F] text-[#F5F5F0] hover:bg-[#203a2c]"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleToggleNewsFeatured(item)}
                    className={`p-1.5 rounded-lg border ${item.isFeatured ? 'bg-[#D4AF37] text-[#07140F]' : 'text-[#A5B2A9] border-[#263B30]'}`}
                    title={item.isFeatured ? 'Remover destaque' : 'Tornar destaque'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(item)}
                    className="p-1.5 rounded-lg bg-[#2a1414] text-[#D94B4B] hover:bg-[#3d1818]"
                    title="Excluir notícia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-[#263B30] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1712] text-[#A5B2A9] border-b border-[#263B30]">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Autoridade</th>
                <th className="p-3">Ação Registrada</th>
                <th className="p-3">Alvo</th>
                <th className="p-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263B30]/40 bg-[#102019]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#15291F]">
                  <td className="p-3 text-[#A5B2A9] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 font-semibold text-[#E8CC76]">{log.adminName}</td>
                  <td className="p-3 font-bold text-[#F5F5F0]">{log.action}</td>
                  <td className="p-3 text-[#A5B2A9]">{log.targetType}</td>
                  <td className="p-3 text-[#F5F5F0]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: GERENCIAR TRANSMISSÕES */}
      {activeTab === 'lives' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30] space-y-4">
            <h3 className="font-serif-patriotic text-lg font-bold text-[#F5F5F0]">
              Gerenciamento de Transmissões ao Vivo
            </h3>
            <p className="text-xs text-[#A5B2A9]">
              Acompanhe transmissões ativas, agende novas, modere o chat e controle participantes.
            </p>

            {livesLoading && (
              <div className="text-center py-4 text-xs text-[#A5B2A9]">
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                Carregando transmissões...
              </div>
            )}

            {/* Transmissões Ativas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-[#D4AF37]" />
                  Transmissões Ativas ({liveSessions.filter(s => s.status === 'live').length})
                </h4>
              </div>
              {liveSessions.filter(s => s.status === 'live').length > 0 ? (
                <div className="space-y-2">
                  {liveSessions.filter(s => s.status === 'live').map(s => (
                    <div key={s.id} className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D94B4B]/20 text-[#D94B4B] text-[10px] border border-[#D94B4B]/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D94B4B] animate-pulse" />
                            AO VIVO
                          </span>
                          <span className="text-[10px] text-[#A5B2A9]">{s.category || 'Sem categoria'}</span>
                        </div>
                        <h5 className="font-bold text-[#F5F5F0]">{s.title}</h5>
                        <p className="text-[10px] text-[#A5B2A9] truncate">{s.description || ''}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[#A5B2A9]">Por {s.hostUserName || 'Desconhecido'}</span>
                          <span className="text-[#A5B2A9]">•</span>
                          <span className="text-[#E8CC76] font-bold">{s.viewerCount} espectadores</span>
                          <span className="text-[#A5B2A9]">•</span>
                          <span className="text-[#A5B2A9]">{s.roomName}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            showToast('Funcionalidade de encerramento via painel em breve.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#D94B4B] text-white text-[10px] font-bold hover:bg-[#b93a3a] transition"
                        >
                          Encerrar
                        </button>
                        <button
                          onClick={() => onOpenLivePlayer?.(s)}
                          className="px-3 py-1.5 rounded-xl bg-[#174D32] text-[#E8CC76] text-[10px] font-bold hover:bg-[#1f6643] transition"
                        >
                          Assistir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-[#15291F] border border-[#263B30]/50 text-xs text-[#A5B2A9]">
                  Nenhuma transmissão ao vivo no momento.
                </div>
              )}
            </div>

            {/* Todas as transmissões */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-[#D4AF37]" />
                  Histórico e Agendadas
                </h4>
              </div>
              {liveSessions.filter(s => s.status !== 'live').length > 0 ? (
                <div className="space-y-2">
                  {liveSessions.filter(s => s.status !== 'live').map(s => (
                    <div key={s.id} className="p-3 rounded-2xl bg-[#15291F] border border-[#263B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'scheduled' ? 'bg-[#174D32]/20 text-[#E8CC76] border border-[#174D32]/40' : 'bg-[#6b7280]/20 text-[#A5B2A9] border border-[#6b7280]/40'
                          }`}>
                            {s.status === 'scheduled' ? 'Agendada' : s.status === 'ended' ? 'Encerrada' : 'Cancelada'}
                          </span>
                          <span className="text-[10px] text-[#A5B2A9]">{s.category || 'Sem categoria'}</span>
                        </div>
                        <h5 className="font-bold text-[#F5F5F0]">{s.title}</h5>
                        <div className="mt-1 flex items-center gap-3 text-[10px] text-[#A5B2A9]">
                          <span>Por {s.hostUserName || 'Desconhecido'}</span>
                          <span>•</span>
                          <span>{new Date(s.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2">
                        {s.status === 'scheduled' && (
                          <button
                            onClick={() => showToast('Iniciar agendada em breve.')}
                            className="px-3 py-1.5 rounded-xl bg-[#174D32] text-[#E8CC76] text-[10px] font-bold hover:bg-[#1f6643] transition"
                          >
                            Iniciar
                          </button>
                        )}
                        <button
                          onClick={() => onOpenLivePlayer?.(s)}
                          className="px-3 py-1.5 rounded-xl bg-[#15291F] border border-[#263B30] text-[#A5B2A9] text-[10px] font-bold hover:bg-[#174D32] transition"
                        >
                          Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-[#15291F] border border-[#263B30]/50 text-xs text-[#A5B2A9]">
                  Nenhuma transmissão agendada ou encerrada.
                </div>
              )}
            </div>
          </div>

          {/* Presença de espectadores */}
          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30]">
            <h4 className="text-xs font-bold text-[#E8CC76] mb-3 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#D4AF37]" />
              Espectadores Conectados ({livePresence.length})
            </h4>
            {livePresence.length > 0 ? (
              <div className="space-y-1">
                {livePresence.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-[#15291F] border border-[#263B30]/50 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#174D32] flex items-center justify-center text-[10px] font-bold">
                        {p.participantIdentity.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[#F5F5F0] truncate">{p.participantIdentity}</span>
                    </div>
                      <span className="text-[10px] text-[#A5B2A9]">
                        {new Date(p.joinedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#A5B2A9]">
                Nenhum espectador conectado no momento.
              </div>
            )}
          </div>

          {/* Denúncias de chat */}
          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30]">
            <h4 className="text-xs font-bold text-[#E8CC76] mb-3 flex items-center gap-1.5">
              <Flag className="w-3 h-3 text-[#D94B4B]" />
              Denúncias de Chat ({liveReports.filter(r => r.status === 'pending').length} pendentes)
            </h4>
            {liveReports.length > 0 ? (
              <div className="space-y-2">
                {liveReports.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-[#15291F] border border-[#263B30] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'pending' ? 'bg-[#2a1414] text-[#D94B4B]' : 'bg-[#174D32]/20 text-[#E8CC76]'
                      }`}>
                        {r.status === 'pending' ? 'Pendente' : r.status === 'reviewed' ? 'Revisado' : 'Descartado'}
                      </span>
                      <span className="text-[#A5B2A9]">{r.reason}</span>
                    </div>
                    <div className="text-[#F5F5F0] truncate">{r.details || 'Sem detalhes'}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#A5B2A9]">
                      <span>Mensagem: {r.messageId}</span>
                      <span>•</span>
                      <span>Repórter: {r.reporterIdentity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#A5B2A9]">
                Nenhuma denúncia de chat no momento.
              </div>
            )}
          </div>

          {/* Ações de moderação */}
          <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30]">
            <h4 className="text-xs font-bold text-[#E8CC76] mb-3 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#D4AF37]" />
              Ações de Moderação Recentes
            </h4>
            {liveModeration.length > 0 ? (
              <div className="space-y-1">
                {liveModeration.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-[#15291F] border border-[#263B30]/50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5F5F0]">{m.action}</span>
                      <span className="text-[10px] text-[#A5B2A9]">{m.participantIdentity}</span>
                    </div>
                    <span className="text-[10px] text-[#A5B2A9]">{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#A5B2A9]">
                Nenhuma ação de moderação registrada.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
