import React, { useState } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Share2, 
  ExternalLink, 
  Globe, 
  Instagram, 
  Youtube, 
  CheckCircle2, 
  Check, 
  Flag,
  Flame,
  Bookmark,
  Heart,
  Award,
  MessageSquare,
  Mail
} from 'lucide-react';
import { User, Post, DebateTopic } from '../types';
import { storageService } from '../services/storageService';
import { PostCard } from './PostCard';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';

interface ProfileViewProps {
  username: string;
  currentUser: User | null;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onOpenReport: (item: any) => void;
  onNavigateToUser: (username: string) => void;
  onOpenRanksModal?: () => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  currentUser,
  onRefresh,
  onOpenAuth,
  onOpenReport,
  onNavigateToUser,
  onOpenRanksModal,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'debates' | 'saved'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);

  const profileUser = storageService.getUserByUsername(username) || currentUser;

  // Edit form states
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editBio, setEditBio] = useState(profileUser?.bio || '');
  const [editLocation, setEditLocation] = useState(profileUser?.location || '');
  const [editAvatar, setEditAvatar] = useState(profileUser?.avatar || '');
  const [editCover, setEditCover] = useState(profileUser?.coverImage || '');
  const [editInstagram, setEditInstagram] = useState(profileUser?.socialLinks.instagram || '');
  const [editX, setEditX] = useState(profileUser?.socialLinks.x || '');
  const [editYoutube, setEditYoutube] = useState(profileUser?.socialLinks.youtube || '');
  const [editWhatsapp, setEditWhatsapp] = useState(profileUser?.socialLinks.whatsapp || '');
  const [editWebsite, setEditWebsite] = useState(profileUser?.socialLinks.website || '');

  if (!profileUser) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30]">
        <UserIcon className="w-12 h-12 text-[#A5B2A9] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#F5F5F0]">Cidadão não encontrado</h3>
        <p className="text-xs text-[#A5B2A9] mt-1">Este perfil pode ter sido alterado ou não existe.</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === profileUser.id;
  const isFollowing = currentUser ? storageService.isFollowing(currentUser.id, profileUser.id) : false;

  const userPosts = storageService.getPosts().filter(p => p.authorId === profileUser.id);
  const savedPosts = storageService.getPosts().filter(p => (p.savedUserIds || []).includes(profileUser.id));
  const userDebates = storageService.getDebates().filter(d => d.authorId === profileUser.id);

  const handleToggleFollow = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = storageService.toggleFollow(currentUser.id, profileUser.id);
    showToast(res.following ? `Você começou a seguir @${profileUser.username}` : `Você deixou de seguir @${profileUser.username}`);
    onRefresh();
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#perfil/${profileUser.username}`);
      showToast('Link do perfil copiado para a área de transferência!');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isSelf) return;

    storageService.updateProfile(currentUser.id, {
      name: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      avatar: editAvatar.trim(),
      coverImage: editCover.trim(),
      socialLinks: {
        instagram: editInstagram.trim() || undefined,
        x: editX.trim() || undefined,
        youtube: editYoutube.trim() || undefined,
        whatsapp: editWhatsapp.trim() || undefined,
        website: editWebsite.trim() || undefined,
      }
    });

    showToast('Perfil atualizado com sucesso!');
    setShowEditModal(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-[#102019] rounded-3xl border border-[#263B30] overflow-hidden shadow-xl">
        {/* Cover image */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-[#0d1a14] to-[#174D32] overflow-hidden">
          {profileUser.coverImage ? (
            <img
              src={profileUser.coverImage}
              alt="Capa do perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#15291F]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#102019] via-transparent to-black/30" />
        </div>

        {/* Profile info row */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar */}
            <div className="relative group">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#102019] shadow-2xl bg-[#07140F]"
              />
              {profileUser.role === 'admin' && (
                <div className="absolute bottom-1 right-1 p-1 rounded-xl bg-[#D4AF37] text-[#07140F] shadow-lg" title="Administrador Oficial">
                  <Shield className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareProfile}
                className="p-2 rounded-xl bg-[#15291F] border border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0] transition"
                title="Compartilhar perfil"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isSelf ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] text-xs font-bold border border-[#D4AF37]/30 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-[#15291F] border border-[#263B30] text-[#A5B2A9]'
                        : 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] hover:brightness-110 shadow-md'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <span>Seguir</span>
                    )}
                  </button>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('messages', profileUser.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] text-xs font-bold border border-[#D4AF37]/30 transition flex items-center gap-1.5 cursor-pointer"
                      title="Enviar mensagem privada"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mensagem</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h1 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0] flex items-center justify-center sm:justify-start gap-1.5">
                {profileUser.name}
                {profileUser.role === 'admin' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37] text-[#07140F] font-black uppercase">
                    ADMIN
                  </span>
                ) : profileUser.verified ? (
                  <span title="Verificado">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  </span>
                ) : null}
              </h1>
              <span className="text-xs text-[#A5B2A9]">@{profileUser.username}</span>
            </div>

            {/* Rank Insignia Card */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 py-1">
              <RankBadge rank={profileUser.rank} size="md" />
              <span className="text-xs font-semibold text-[#E8CC76] bg-[#15291F] px-2.5 py-1 rounded-lg border border-[#263B30]">
                {profileUser.honorPoints || 0} Pontos de Honra
              </span>
              {onOpenRanksModal && (
                <button
                  onClick={onOpenRanksModal}
                  className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1 bg-[#102019] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Ver Plano de Patentes</span>
                </button>
              )}
            </div>

            {profileUser.bio && (
              <p className="text-xs sm:text-sm text-[#F5F5F0]/90 leading-relaxed max-w-2xl">
                {profileUser.bio}
              </p>
            )}

            {/* Meta tags & Location */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#A5B2A9] pt-2">
              {profileUser.email && (
                <span className="flex items-center gap-1.5 bg-[#15291F] px-2.5 py-1 rounded-xl border border-[#D4AF37]/30 text-[#E8CC76] font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{profileUser.email}</span>
                  <span className="text-[10px] bg-[#07140F] text-[#34A853] px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    CADASTRADO
                  </span>
                </span>
              )}

              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {profileUser.location}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                Membro desde {new Date(profileUser.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Social Links Icons */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
              {profileUser.socialLinks.x && (
                <a href={profileUser.socialLinks.x} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#15291F] text-[#A5B2A9] hover:text-[#E8CC76] border border-[#263B30] text-xs">
                  𝕏 Twitter
                </a>
              )}
              {profileUser.socialLinks.instagram && (
                <a href={profileUser.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#15291F] text-[#A5B2A9] hover:text-[#E8CC76] border border-[#263B30] text-xs flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {profileUser.socialLinks.youtube && (
                <a href={profileUser.socialLinks.youtube} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#15291F] text-[#A5B2A9] hover:text-[#E8CC76] border border-[#263B30] text-xs flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5" /> YouTube
                </a>
              )}
              {profileUser.socialLinks.website && (
                <a href={profileUser.socialLinks.website} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#15291F] text-[#A5B2A9] hover:text-[#E8CC76] border border-[#263B30] text-xs flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>

            {/* Counters */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-[#263B30]/60 text-xs">
              <div>
                <strong className="text-sm font-bold text-[#F5F5F0]">{profileUser.postsCount}</strong>{' '}
                <span className="text-[#A5B2A9]">Publicações</span>
              </div>
              <div>
                <strong className="text-sm font-bold text-[#F5F5F0]">{profileUser.followersCount}</strong>{' '}
                <span className="text-[#A5B2A9]">Seguidores</span>
              </div>
              <div>
                <strong className="text-sm font-bold text-[#F5F5F0]">{profileUser.followingCount}</strong>{' '}
                <span className="text-[#A5B2A9]">Seguindo</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-t border-[#263B30] bg-[#0b1712] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-[#D4AF37] text-[#E8CC76]'
                : 'border-transparent text-[#A5B2A9] hover:text-[#F5F5F0]'
            }`}
          >
            Publicações ({userPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('debates')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'debates'
                ? 'border-[#D4AF37] text-[#E8CC76]'
                : 'border-transparent text-[#A5B2A9] hover:text-[#F5F5F0]'
            }`}
          >
            Debates Criados ({userDebates.length})
          </button>

          {isSelf && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-3 px-4 border-b-2 transition ${
                activeTab === 'saved'
                  ? 'border-[#D4AF37] text-[#E8CC76]'
                  : 'border-transparent text-[#A5B2A9] hover:text-[#F5F5F0]'
              }`}
            >
              Publicações Salvas ({savedPosts.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                currentUser={currentUser}
                onPostUpdated={onRefresh}
                onOpenReport={onOpenReport}
                onNavigateToUser={onNavigateToUser}
                onOpenAuth={onOpenAuth}
              />
            ))
          ) : (
            <div className="p-10 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
              Este cidadão ainda não publicou nenhuma postagem.
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.length > 0 ? (
            savedPosts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                currentUser={currentUser}
                onPostUpdated={onRefresh}
                onOpenReport={onOpenReport}
                onNavigateToUser={onNavigateToUser}
                onOpenAuth={onOpenAuth}
              />
            ))
          ) : (
            <div className="p-10 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
              Você ainda não salvou nenhuma publicação para leitura posterior.
            </div>
          )}
        </div>
      )}

      {activeTab === 'debates' && (
        <div className="space-y-3">
          {userDebates.length > 0 ? (
            userDebates.map(deb => (
              <div key={deb.id} className="p-4 rounded-2xl bg-[#102019] border border-[#263B30] text-xs">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-semibold">
                  {deb.category}
                </span>
                <h4 className="font-bold text-sm text-[#F5F5F0] mt-1">{deb.title}</h4>
                <p className="text-[#A5B2A9] mt-1 line-clamp-2">{deb.description}</p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
              Nenhum debate criado por este usuário.
            </div>
          )}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-5 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <span className="text-sm font-bold text-[#F5F5F0]">Editar Dados do Perfil</span>
              <button onClick={() => setShowEditModal(false)} className="text-[#A5B2A9] hover:text-[#F5F5F0]">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">Biografia Cívica</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">Localização (Cidade, UF)</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Ex: Brasília, DF"
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">URL da Foto de Perfil</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">URL da Imagem de Capa</label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#263B30]">
                <span className="block text-xs font-bold text-[#E8CC76] mb-2">Redes Sociais & Canais</span>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editX}
                    onChange={(e) => setEditX(e.target.value)}
                    placeholder="Link do X (Twitter)"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30]"
                  />
                  <input
                    type="url"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    placeholder="Link do Instagram"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30]"
                  />
                  <input
                    type="url"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    placeholder="Link do Canal YouTube"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30]"
                  />
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="Website Pessoal ou Profissional"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#263B30]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#15291F] text-xs text-[#F5F5F0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-xs font-bold text-[#07140F] shadow hover:brightness-110"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
