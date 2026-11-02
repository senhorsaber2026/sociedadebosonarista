import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  ChevronRight, 
  ArrowLeft,
  Send,
  CheckCircle,
  HelpCircle,
  Calendar,
  XCircle,
  Search,
  Trash2
} from 'lucide-react';
import { DebateTopic, DebateCategory, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface DebatesViewProps {
  currentUser: User | null;
  activeDebateId?: string;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onNavigateToUser: (username: string) => void;
}

const DEBATE_CATEGORIES: ('Todos' | DebateCategory)[] = [
  'Todos',
  'Política brasileira',
  'Economia',
  'Liberdade de expressão',
  'Educação',
  'Segurança pública',
  'Governo',
  'Eleições',
  'Sociedade',
  'Relações internacionais'
];

export const DebatesView: React.FC<DebatesViewProps> = ({
  currentUser,
  activeDebateId,
  onRefresh,
  onOpenAuth,
  onNavigateToUser
}) => {
  const [selectedDebate, setSelectedDebate] = useState<DebateTopic | null>(() => {
    if (activeDebateId) {
      return storageService.getDebateById(activeDebateId);
    }
    return null;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New debate modal fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<DebateCategory>('Política brasileira');

  // New argument fields
  const [stance, setStance] = useState<'pro' | 'con' | 'neutral'>('pro');
  const [argumentContent, setArgumentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debates = storageService.getDebates(
    categoryFilter === 'Todos' ? undefined : categoryFilter,
    searchQuery
  );

  const handleCreateDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Preencha o título e a descrição do debate.', 'error');
      return;
    }

    const created = storageService.createDebate(currentUser, newTitle, newDescription, newCategory);
    showToast('Tópico de debate cívico criado com sucesso!');
    setNewTitle('');
    setNewDescription('');
    setShowCreateModal(false);
    setSelectedDebate(created);
    onRefresh();
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedDebate || !argumentContent.trim()) return;

    setIsSubmitting(true);
    const updated = storageService.addDebateReply(selectedDebate.id, currentUser, stance, argumentContent.trim());
    if (updated) {
      setSelectedDebate({ ...updated });
      setArgumentContent('');
      showToast('Seu argumento foi adicionado ao debate!');
      onRefresh();
    }
    setIsSubmitting(false);
  };

  const handleUpvoteReply = (replyId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedDebate) return;

    storageService.upvoteDebateReply(selectedDebate.id, replyId, currentUser.id);
    const fresh = storageService.getDebateById(selectedDebate.id);
    if (fresh) setSelectedDebate(fresh);
    onRefresh();
  };

  const handleShareDebate = (deb: DebateTopic) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#debates`);
      showToast('Link do debate copiado para a área de transferência!');
    }
  };

  const handleDeleteDebate = (e: React.MouseEvent, debateId: string, title: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (confirm(`Deseja realmente excluir o debate "${title}"?`)) {
      const deleted = storageService.deleteDebate(debateId, currentUser);
      if (deleted) {
        showToast('Debate excluído com sucesso.');
        if (selectedDebate?.id === debateId) {
          setSelectedDebate(null);
        }
        onRefresh();
      }
    }
  };

  const handleDeleteReply = (replyId: string) => {
    if (!currentUser || !selectedDebate) return;
    if (confirm('Deseja realmente excluir este argumento?')) {
      const deleted = storageService.deleteDebateReply(selectedDebate.id, replyId, currentUser);
      if (deleted) {
        showToast('Argumento excluído com sucesso.');
        const fresh = storageService.getDebateById(selectedDebate.id);
        if (fresh) setSelectedDebate(fresh);
        onRefresh();
      }
    }
  };

  // IF DETAILED VIEW FOR A SPECIFIC DEBATE IS SELECTED
  if (selectedDebate) {
    const proReplies = selectedDebate.replies.filter(r => r.stance === 'pro');
    const conReplies = selectedDebate.replies.filter(r => r.stance === 'con');
    const totalVotes = selectedDebate.proCount + selectedDebate.conCount;
    const proPercent = totalVotes > 0 ? Math.round((selectedDebate.proCount / totalVotes) * 100) : 50;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedDebate(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todos os debates</span>
        </button>

        {/* Debate Topic Statement Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/30 text-xs font-bold text-[#E8CC76]">
              {selectedDebate.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A5B2A9]">
                Criado em {new Date(selectedDebate.createdAt).toLocaleDateString('pt-BR')} por @{selectedDebate.authorUsername}
              </span>
              {(currentUser?.role === 'admin' || currentUser?.id === selectedDebate.authorId) && (
                <button
                  onClick={(e) => handleDeleteDebate(e, selectedDebate.id, selectedDebate.title)}
                  className="px-2.5 py-1 rounded-xl bg-[#2a1414] hover:bg-[#3d1818] text-[#D94B4B] border border-[#D94B4B]/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Excluir Debate (Poder de Administrador)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Debate</span>
                </button>
              )}
            </div>
          </div>

          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0] leading-snug mb-3">
            {selectedDebate.title}
          </h2>

          <p className="text-sm text-[#F5F5F0]/90 leading-relaxed bg-[#15291F] p-4 rounded-2xl border border-[#263B30] mb-4">
            {selectedDebate.description}
          </p>

          {/* Voting Ratio Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#E8CC76] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#D4AF37]" /> {selectedDebate.proCount} A Favor ({proPercent}%)
              </span>
              <span className="text-[#D94B4B] flex items-center gap-1">
                <XCircle className="w-4 h-4 text-[#D94B4B]" /> {selectedDebate.conCount} Contra ({100 - proPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#07140F] rounded-full overflow-hidden flex border border-[#263B30]">
              <div className="bg-[#D4AF37] h-full transition-all duration-500" style={{ width: `${proPercent}%` }} />
              <div className="bg-[#D94B4B] h-full transition-all duration-500" style={{ width: `${100 - proPercent}%` }} />
            </div>
          </div>
        </div>

        {/* SUBMIT ARGUMENT BOX */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#102019] border border-[#263B30]">
          <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] mb-3 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <span>Adicionar seu Argumento ao Debate</span>
          </h4>

          {currentUser ? (
            <form onSubmit={handleAddReply} className="space-y-3">
              {/* Stance Radio Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#A5B2A9]">Seu posicionamento:</span>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#E8CC76]">
                  <input
                    type="radio"
                    name="stance"
                    checked={stance === 'pro'}
                    onChange={() => setStance('pro')}
                    className="accent-[#D4AF37]"
                  />
                  <span>A Favor (Pró)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#D94B4B]">
                  <input
                    type="radio"
                    name="stance"
                    checked={stance === 'con'}
                    onChange={() => setStance('con')}
                    className="accent-[#D94B4B]"
                  />
                  <span>Contra</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#A5B2A9]">
                  <input
                    type="radio"
                    name="stance"
                    checked={stance === 'neutral'}
                    onChange={() => setStance('neutral')}
                    className="accent-[#A5B2A9]"
                  />
                  <span>Neutro / Análise</span>
                </label>
              </div>

              <textarea
                value={argumentContent}
                onChange={(e) => setArgumentContent(e.target.value)}
                placeholder="Exponha suas razões, dados e argumentos com clareza e respeito cívico..."
                rows={3}
                className="w-full bg-[#15291F] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] p-3 rounded-2xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !argumentContent.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-xs font-bold text-[#07140F] shadow hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Argumento</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 bg-[#15291F] rounded-2xl text-xs text-[#A5B2A9]">
              <button onClick={onOpenAuth} className="text-[#D4AF37] font-bold underline">
                Faça login
              </button>{' '}
              para defender seus argumentos neste debate.
            </div>
          )}
        </div>

        {/* 2-COLUMN ARGUMENTS FEED: PRO VS CON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* A FAVOR COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#174D32]/60 border border-[#D4AF37]/30 text-xs font-bold text-[#E8CC76]">
              <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>Argumentos A Favor ({proReplies.length})</span>
            </div>

            {proReplies.length > 0 ? (
              proReplies.map((reply) => {
                const isUpvoted = currentUser ? reply.upvotedUserIds.includes(currentUser.id) : false;
                return (
                  <div key={reply.id} className="p-3.5 rounded-2xl bg-[#102019] border border-[#263B30] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => onNavigateToUser(reply.authorUsername)}
                        className="flex items-center gap-2 cursor-pointer hover:underline"
                      >
                        <img src={reply.authorAvatar} alt={reply.authorName} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-[#F5F5F0]">{reply.authorName}</span>
                      </div>
                      <span className="text-[10px] text-[#A5B2A9]">
                        {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-[#F5F5F0] leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>

                    <div className="pt-2 border-t border-[#263B30]/40 flex items-center justify-between">
                      {(currentUser?.role === 'admin' || currentUser?.id === reply.authorId) ? (
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          className="p-1 rounded text-[#A5B2A9] hover:text-[#D94B4B] hover:bg-[#2e1515] transition cursor-pointer"
                          title="Excluir Argumento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : <div />}

                      <button
                        onClick={() => handleUpvoteReply(reply.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                          isUpvoted 
                            ? 'bg-[#174D32] border-[#D4AF37] text-[#E8CC76]' 
                            : 'border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Apoiar ({reply.upvotes})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#A5B2A9] text-center py-4 bg-[#102019] rounded-2xl border border-[#263B30]">
                Ainda não há argumentos a favor cadastrados.
              </p>
            )}
          </div>

          {/* CONTRA COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2a1414]/60 border border-[#D94B4B]/30 text-xs font-bold text-[#D94B4B]">
              <XCircle className="w-4 h-4 text-[#D94B4B]" />
              <span>Argumentos Contra ({conReplies.length})</span>
            </div>

            {conReplies.length > 0 ? (
              conReplies.map((reply) => {
                const isUpvoted = currentUser ? reply.upvotedUserIds.includes(currentUser.id) : false;
                return (
                  <div key={reply.id} className="p-3.5 rounded-2xl bg-[#102019] border border-[#263B30] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => onNavigateToUser(reply.authorUsername)}
                        className="flex items-center gap-2 cursor-pointer hover:underline"
                      >
                        <img src={reply.authorAvatar} alt={reply.authorName} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-[#F5F5F0]">{reply.authorName}</span>
                      </div>
                      <span className="text-[10px] text-[#A5B2A9]">
                        {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-[#F5F5F0] leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>

                    <div className="pt-2 border-t border-[#263B30]/40 flex justify-end">
                      <button
                        onClick={() => handleUpvoteReply(reply.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                          isUpvoted 
                            ? 'bg-[#2a1414] border-[#D94B4B] text-[#D94B4B]' 
                            : 'border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Apoiar ({reply.upvotes})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#A5B2A9] text-center py-4 bg-[#102019] rounded-2xl border border-[#263B30]">
                Ainda não há argumentos contra cadastrados.
              </p>
            )}
          </div>

        </div>

      </div>
    );
  }

  // LIST OF DEBATES OVERVIEW
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
            <Flame className="w-4 h-4" />
            <span>Fórum de Debates Políticos</span>
          </div>
          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            Confronto de Ideias, Razão e Liberdade
          </h2>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Debates públicos estruturados entre pontos de vista sobre os rumos constitucionais e econômicos do Brasil.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] hover:brightness-110 text-[#07140F] font-bold text-xs sm:text-sm shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Debate</span>
        </button>
      </div>

      {/* FILTER AND SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tópicos de debate..."
            className="w-full bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {DEBATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50 shadow-sm'
                  : 'bg-[#102019] text-[#A5B2A9] border border-[#263B30] hover:text-[#F5F5F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DEBATES LIST */}
      <div className="space-y-4">
        {debates.map((deb) => {
          const total = deb.proCount + deb.conCount;
          const proPct = total > 0 ? Math.round((deb.proCount / total) * 100) : 50;

          return (
            <div
              key={deb.id}
              onClick={() => setSelectedDebate(deb)}
              className="p-4 sm:p-5 rounded-2xl bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/50 cursor-pointer transition group shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#174D32] border border-[#D4AF37]/30 text-[#E8CC76] font-semibold">
                  {deb.category}
                </span>
                <span className="text-[10px] text-[#A5B2A9]">
                  {new Date(deb.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[#F5F5F0] group-hover:text-[#E8CC76] transition mb-1.5 leading-snug">
                {deb.title}
              </h3>

              <p className="text-xs text-[#A5B2A9] line-clamp-2 leading-relaxed mb-3">
                {deb.description}
              </p>

              {/* Progress and numbers */}
              <div className="pt-2 border-t border-[#263B30]/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-[#E8CC76] font-semibold">
                    ✓ {deb.proCount} A Favor ({proPct}%)
                  </span>
                  <span className="text-[#D94B4B] font-semibold">
                    ✕ {deb.conCount} Contra ({100 - proPct}%)
                  </span>
                  <span className="text-[#A5B2A9] hidden sm:inline">
                    {deb.repliesCount} argumentos
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {(currentUser?.role === 'admin' || currentUser?.id === deb.authorId) && (
                    <button
                      onClick={(e) => handleDeleteDebate(e, deb.id, deb.title)}
                      className="p-1 rounded text-[#A5B2A9] hover:text-[#D94B4B] hover:bg-[#2e1515] transition cursor-pointer"
                      title="Excluir Debate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Debater</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEBATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F0]">
                <Flame className="w-4 h-4 text-[#D4AF37]" />
                <span>Criar Tópico de Debate Cívico</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#A5B2A9] hover:text-[#F5F5F0]">✕</button>
            </div>

            <form onSubmit={handleCreateDebate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Título da Questão / Tese *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: A imunidade parlamentar deve proteger declarações em redes sociais?"
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Categoria *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DebateCategory)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                >
                  {DEBATE_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Contextualização & Argumento Inicial *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Apresente os fatos, leis e premissas que justificam esta discussão na comunidade..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#263B30]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#15291F] text-xs text-[#F5F5F0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-xs font-bold text-[#07140F] shadow hover:brightness-110"
                >
                  Iniciar Debate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
