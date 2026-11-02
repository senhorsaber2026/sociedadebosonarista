import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Check, 
  ArrowRight,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { Group, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface GroupsViewProps {
  currentUser: User | null;
  activeGroupId?: string;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onNavigateToExplore: (tag: string) => void;
}

const GROUP_CATEGORIES = [
  'Todos',
  'Agronegócio',
  'Direito & Justiça',
  'Economia',
  'Família & Sociedade',
  'Segurança Pública',
  'Juventude & Universidade'
];

export const GroupsView: React.FC<GroupsViewProps> = ({
  currentUser,
  activeGroupId,
  onRefresh,
  onOpenAuth,
  onNavigateToExplore
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New group form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Agronegócio');
  const [coverImage, setCoverImage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const groups = storageService.getGroups(
    selectedCategory === 'Todos' ? undefined : selectedCategory,
    searchQuery
  );

  const handleToggleMember = (group: Group) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const result = storageService.toggleGroupMember(group.id, currentUser.id);
    showToast(result.joined ? `Você agora faz parte de "${group.name}"!` : `Você saiu de "${group.name}".`);
    onRefresh();
  };

  const handleDeleteGroup = (group: Group) => {
    if (!currentUser) return;
    if (confirm(`Deseja realmente excluir a comunidade "${group.name}"?`)) {
      const deleted = storageService.deleteGroup(group.id, currentUser);
      if (deleted) {
        showToast(`Comunidade "${group.name}" excluída com sucesso.`);
        onRefresh();
      }
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!name.trim() || !description.trim()) {
      showToast('Preencha os campos obrigatórios do grupo.', 'error');
      return;
    }

    storageService.createGroup({
      name: name.trim(),
      description: description.trim(),
      category,
      coverImage: coverImage.trim() || undefined,
      isPrivate,
      creator: currentUser
    });

    showToast('Comunidade criada com sucesso!');
    setShowCreateModal(false);
    setName('');
    setDescription('');
    setCoverImage('');
    setIsPrivate(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
            <Users className="w-4 h-4" />
            <span>Comunidades & Núcleos Cívicos</span>
          </div>
          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            Grupos de Discussão & Mobilização
          </h2>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Conecte-se com brasileiros que atuam na sua área profissional, na sua cidade ou em temas de seu interesse.
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
          <span>Criar Nova Comunidade</span>
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
            placeholder="Pesquisar comunidades e grupos..."
            className="w-full bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {GROUP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50 shadow-sm'
                  : 'bg-[#102019] text-[#A5B2A9] border border-[#263B30] hover:text-[#F5F5F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GROUPS GRID */}
      {groups.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#102019] rounded-2xl border border-[#263B30] space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#174D32]/50 border border-[#D4AF37]/40 flex items-center justify-center text-[#E8CC76]">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#F5F5F0]">Nenhuma comunidade encontrada</h3>
          <p className="text-xs text-[#A5B2A9] max-w-sm mx-auto">
            Ainda não há grupos cadastrados. Crie a primeira comunidade patriótica da plataforma!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs rounded-xl hover:brightness-110 shadow-md cursor-pointer"
          >
            + Criar a Primeira Comunidade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((grp) => {
          const isMember = currentUser ? grp.memberUserIds.includes(currentUser.id) : false;

          return (
            <div
              key={grp.id}
              className="bg-[#102019] rounded-2xl border border-[#263B30] overflow-hidden flex flex-col justify-between hover:border-[#D4AF37]/40 transition group"
            >
              <div>
                <div className="relative h-36 bg-[#07140F] overflow-hidden">
                  <img
                    src={grp.coverImage}
                    alt={grp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102019] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#174D32]/90 backdrop-blur-sm border border-[#D4AF37]/40 text-[10px] font-bold text-[#E8CC76]">
                      {grp.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-[#A5B2A9] flex items-center gap-1">
                      {grp.isPrivate ? <Lock className="w-3 h-3 text-[#E8CC76]" /> : <Globe className="w-3 h-3 text-[#A5B2A9]" />}
                      {grp.isPrivate ? 'Privado' : 'Público'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm sm:text-base text-[#F5F5F0] group-hover:text-[#E8CC76] transition mb-1 leading-snug">
                    {grp.name}
                  </h3>

                  <p className="text-xs text-[#A5B2A9] line-clamp-2 leading-relaxed mb-3">
                    {grp.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-[#263B30]/40 pt-3">
                <span className="text-xs text-[#A5B2A9] font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {grp.membersCount.toLocaleString('pt-BR')} membros
                </span>

                <div className="flex items-center gap-2">
                  {(currentUser?.role === 'admin' || currentUser?.id === grp.creatorId) && (
                    <button
                      onClick={() => handleDeleteGroup(grp)}
                      className="p-1.5 rounded-xl bg-[#2a1414] hover:bg-[#3d1818] text-[#D94B4B] border border-[#D94B4B]/30 transition cursor-pointer"
                      title="Excluir Comunidade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleMember(grp)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isMember
                        ? 'bg-[#15291F] border border-[#263B30] text-[#A5B2A9] hover:text-[#D94B4B]'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] hover:brightness-110 shadow-sm'
                    }`}
                  >
                    {isMember ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Membro</span>
                      </>
                    ) : (
                      <span>Participar</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F0]">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span>Criar Nova Comunidade</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#A5B2A9] hover:text-[#F5F5F0]">✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Patriotas de Santa Catarina"
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                >
                  {GROUP_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  URL da Imagem de Capa
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Descrição dos Objetivos *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva quem pode participar e quais tópicos serão tratados..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#F5F5F0]">
                <input
                  type="checkbox"
                  id="grpPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded text-[#D4AF37]"
                />
                <label htmlFor="grpPrivate" className="cursor-pointer">
                  Grupo Privado (exige aprovação de moderador)
                </label>
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
                  Fundar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
