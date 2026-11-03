import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Shield, 
  CheckCircle2, 
  Send, 
  Flag, 
  Trash2, 
  Check,
  Calendar,
  Globe,
  Camera,
  Music,
  ExternalLink
} from 'lucide-react';
import { Post, User } from '../types';
import { storageService } from '../services/storageService';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';
import { getYouTubeEmbedUrl, extractYouTubeId } from '../utils/youtube';
import { detectSocialLinks } from '../utils/socialMedia';
import { extractTwitterInfo } from '../utils/twitter';
import { TwitterEmbed } from './TwitterEmbed';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onPostUpdated: () => void;
  onOpenReport: (post: Post) => void;
  onNavigateToUser: (username: string) => void;
  onOpenAuth: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onPostUpdated,
  onOpenReport,
  onNavigateToUser,
  onOpenAuth
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isLiked = currentUser ? post.likedUserIds.includes(currentUser.id) : false;
  const isSaved = currentUser ? (post.savedUserIds || []).includes(currentUser.id) : false;
  const canDelete = currentUser ? (currentUser.id === post.authorId || currentUser.role === 'admin') : false;

  const handleLike = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    storageService.toggleLike(post.id, currentUser.id);
    onPostUpdated();
  };

  const handleSave = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const saved = storageService.toggleSavePost(post.id, currentUser.id);
    showToast(saved ? 'Publicação salva aos seus favoritos!' : 'Publicação removida dos salvos.');
    onPostUpdated();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#${post.id}`);
      showToast('Link da publicação copiado para a área de transferência!');
    }
  };

  const handleVotePoll = (optionId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    storageService.votePoll(post.id, optionId, currentUser.id);
    onPostUpdated();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    storageService.addComment(post.id, currentUser, commentText.trim());
    setCommentText('');
    setIsSubmittingComment(false);
    showToast('Comentário publicado!');
    onPostUpdated();
  };

  const handleDeletePost = () => {
    if (!currentUser) return;
    if (confirm('Tem certeza que deseja excluir esta publicação?')) {
      const deleted = storageService.deletePost(post.id, currentUser.id, currentUser.role === 'admin');
      if (deleted) {
        showToast('Publicação excluída com sucesso.');
        onPostUpdated();
      }
    }
    setShowMenu(false);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    if (confirm('Deseja realmente excluir este comentário?')) {
      const deleted = storageService.deleteComment(post.id, commentId, currentUser);
      if (deleted) {
        showToast('Comentário excluído com sucesso.');
        onPostUpdated();
      }
    }
  };

  return (
    <article 
      id={post.id}
      className="mb-4 bg-[#102019] rounded-3xl border border-[#263B30] p-4 sm:p-5 shadow-sm transition hover:border-[#2f493b]"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div 
          onClick={() => onNavigateToUser(post.authorUsername)}
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
        >
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(post.authorName)}`;
            }}
            className="w-10 h-10 rounded-full object-cover border border-[#263B30] group-hover:border-[#D4AF37] transition shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-[#F5F5F0] group-hover:text-[#E8CC76] transition break-words">
                {post.authorName}
              </span>
              <RankBadge rank={post.authorRank} size="xs" />
              {post.authorRole === 'admin' ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37] text-[#07140F] font-extrabold" title="Administrador Oficial">
                  <Shield className="w-2.5 h-2.5" /> ADMIN
                </span>
              ) : post.authorVerified ? (
                <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0" title="Verificado">
                  <Check className="w-2 h-2 stroke-[3]" />
                </div>
              ) : null}
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] text-[#A5B2A9]">
              <span>@{post.authorUsername}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>
                  {(() => {
                    const diffMs = Date.now() - new Date(post.createdAt).getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    if (diffHours < 1) return 'Agora';
                    if (diffHours < 24) return `${diffHours} h`;
                    return new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                  })()}
                </span>
                <Globe className="w-3 h-3 text-[#A5B2A9]" />
              </span>
            </div>
          </div>
        </div>

        {/* Category tag & menu */}
        <div className="flex items-center gap-2 relative">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#15291F] border border-[#263B30] text-[#E8CC76] font-semibold">
            {post.category}
          </span>

          {currentUser?.role === 'admin' && (
            <button
              onClick={handleDeletePost}
              className="p-1 rounded-lg text-[#D94B4B] hover:bg-[#2a1414] transition cursor-pointer"
              title="Excluir Publicação (Poder Admin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-[#102019] border border-[#263B30] rounded-xl shadow-xl z-30 p-1.5 text-xs">
                <button
                  onClick={() => {
                    handleShare();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#F5F5F0] hover:bg-[#15291F] text-left"
                >
                  <Share2 className="w-3.5 h-3.5" /> Compartilhar Link
                </button>

                <button
                  onClick={() => {
                    handleSave();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#F5F5F0] hover:bg-[#15291F] text-left"
                >
                  <Bookmark className="w-3.5 h-3.5" /> {isSaved ? 'Remover dos Salvos' : 'Salvar Publicação'}
                </button>

                <button
                  onClick={() => {
                    onOpenReport(post);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#A5B2A9] hover:bg-[#15291F] hover:text-[#D4AF37] text-left"
                >
                  <Flag className="w-3.5 h-3.5" /> Denunciar Post
                </button>

                {canDelete && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#D94B4B] hover:bg-[#2e1515] text-left font-semibold border-t border-[#263B30] mt-1 pt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Publicação
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT TEXT */}
      <div className="text-xs sm:text-sm text-[#F5F5F0] leading-relaxed whitespace-pre-wrap mb-3.5 font-normal">
        {post.content}
      </div>

      {/* MEDIA ATTACHMENT */}
      {(() => {
        const ytFromContent = extractYouTubeId(post.content || '');
        const twFromContent = extractTwitterInfo(post.content || '');
        const twFromMedia = extractTwitterInfo(post.mediaUrl || '');
        const twFromProp = post.twitterId ? {
          id: post.twitterId,
          username: post.authorUsername,
          url: post.twitterUrl || `https://x.com/i/status/${post.twitterId}`,
          embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${post.twitterId}&theme=dark`,
          directVideoUrl: `https://d.fxtwitter.com/i/status/${post.twitterId}`,
          isVideo: true
        } : null;

        const socialLinksFromContent = detectSocialLinks(post.content || '');
        const socialLinksFromMedia = post.mediaUrl ? detectSocialLinks(post.mediaUrl) : [];
        const socialLinks = [...socialLinksFromContent, ...socialLinksFromMedia];

        const twitterSocial = socialLinks.find(l => l.platform === 'twitter');
        const twitterInfo = twFromMedia || twFromContent || twFromProp || (twitterSocial && twitterSocial.id ? {
          id: twitterSocial.id,
          username: twitterSocial.username,
          url: twitterSocial.url,
          embedUrl: twitterSocial.embedUrl || `https://platform.twitter.com/embed/Tweet.html?id=${twitterSocial.id}&theme=dark`,
          directVideoUrl: twitterSocial.directVideoUrl || `https://d.fxtwitter.com/${twitterSocial.username || 'i'}/status/${twitterSocial.id}`,
          isVideo: true
        } : null);

        const isTwitter = post.mediaType === 'twitter' || Boolean(twitterInfo);
        const ytId = post.youtubeId || ytFromContent || extractYouTubeId(post.youtubeUrl || '');
        const isYt = !isTwitter && (post.mediaType === 'youtube' || Boolean(post.youtubeId || ytFromContent));

        const nonTwitterSocialLinks = socialLinks.filter(l => l.platform !== 'twitter');
        const hasMedia = Boolean(post.mediaUrl || post.youtubeId || ytFromContent || isTwitter || socialLinks.length > 0);
        if (!hasMedia) return null;

        const isDirectVideoFile = post.mediaUrl && (
          post.mediaUrl.startsWith('data:video') || 
          post.mediaUrl.startsWith('blob:') ||
          /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(post.mediaUrl)
        );
        const isVideo = !isTwitter && !isYt && !nonTwitterSocialLinks.length && Boolean(isDirectVideoFile);

        const imageLinks = nonTwitterSocialLinks.filter(l => l.platform === 'image');
        const otherSocialLinks = nonTwitterSocialLinks.filter(l => l.platform !== 'image');
        const firstSocial = otherSocialLinks[0];
        const firstImage = imageLinks[0];

        return (
          <div className={`mb-3.5 rounded-2xl overflow-hidden border border-[#263B30] bg-[#07140F] ${isTwitter ? 'max-h-[640px]' : isYt ? 'aspect-video max-h-[460px]' : 'max-h-96'}`}>
            {isTwitter && twitterInfo ? (
              <TwitterEmbed
                tweetId={twitterInfo.id}
                username={twitterInfo.username}
                originalUrl={twitterInfo.url}
              />
            ) : isYt ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <iframe
                  src={getYouTubeEmbedUrl(ytId || '', true)}
                  title="Vídeo do YouTube"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : isVideo ? (
              <video
                src={post.mediaUrl}
                autoPlay
                playsInline
                muted
                controls
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Se falhar o carregamento do vídeo, não deixa tela preta
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'p-4 text-center text-xs text-[#A5B2A9] flex flex-col items-center justify-center min-h-[160px]';
                    fallback.innerHTML = `<span class="text-[#E8CC76] font-bold mb-1">Vídeo indisponível diretamente</span><a href="${post.mediaUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-[#1DA1F2] underline mt-1">Abrir link da mídia</a>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : firstSocial ? (
              <div className="w-full h-full bg-[#07140F] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-[#263B30]">
                  {firstSocial.platform === 'instagram' ? (
                    <div className="w-10 h-10 rounded-full bg-conic-gradient from-[#833AB4] via-[#FD1D1D] via-[#FCB045] to-[#833AB4] flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  ) : firstSocial.platform === 'tiktok' ? (
                    <div className="w-10 h-10 rounded-full bg-[#000000] flex items-center justify-center text-[#FE2C55]">
                      <Music className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                      <Share2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-[#D4AF37] mb-1 uppercase tracking-wider">
                  Conteúdo na {firstSocial.platform.charAt(0).toUpperCase() + firstSocial.platform.slice(1)}
                </span>
                <a
                  href={firstSocial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174D32] hover:bg-[#1f6341] text-[#E8CC76] text-xs font-bold transition border border-[#263B30] shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir na rede social</span>
                </a>
                <p className="text-[10px] text-[#A5B2A9] mt-2 truncate max-w-[200px]">{firstSocial.url}</p>
              </div>
            ) : firstImage ? (
              <img
                src={firstImage.url}
                alt="Imagem compartilhada"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
                }}
                className="w-full h-full object-cover hover:scale-101 transition-transform"
              />
            ) : (
              <img
                src={post.mediaUrl?.replace('/src/assets/', '/assets/')}
                alt="Mídia da publicação"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
                }}
                className="w-full h-full object-cover hover:scale-101 transition-transform"
              />
            )}
          </div>
        );
      })()}

      {/* INTERACTIVE POLL */}
      {post.poll && (
        <div className="mb-3.5 p-3 sm:p-4 rounded-2xl bg-[#15291F] border border-[#263B30] space-y-2">
          <div className="text-xs font-bold text-[#E8CC76] flex items-center justify-between mb-1">
            <span>Enquete Popular</span>
            <span className="text-[10px] text-[#A5B2A9]">
              {post.poll.totalVotes.toLocaleString('pt-BR')} votos
            </span>
          </div>

          <div className="space-y-2">
            {post.poll.options.map((opt) => {
              const isVoted = currentUser ? opt.votedUserIds.includes(currentUser.id) : false;
              const percent = post.poll!.totalVotes > 0 
                ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                : 0;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleVotePoll(opt.id)}
                  className={`relative w-full text-left p-2.5 rounded-xl border text-xs font-medium transition overflow-hidden ${
                    isVoted 
                      ? 'border-[#D4AF37] bg-[#174D32]/80 text-[#F5F5F0]' 
                      : 'border-[#263B30] bg-[#102019] text-[#F5F5F0] hover:border-[#D4AF37]/50'
                  }`}
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                      isVoted ? 'bg-[#D4AF37]/25' : 'bg-[#223d2e]/40'
                    }`}
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate">
                      {isVoted && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                      <span className="truncate">{opt.text}</span>
                    </span>
                    <span className="font-bold text-[11px] text-[#E8CC76] shrink-0">
                      {percent}% ({opt.votes})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="pt-2 border-t border-[#263B30] flex items-center justify-between text-xs text-[#A5B2A9]">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 p-1 rounded-lg transition group ${
              isLiked ? 'text-[#D4AF37]' : 'hover:text-[#D4AF37]'
            }`}
          >
            <Heart className={`w-4 h-4 transition ${isLiked ? 'fill-[#D4AF37] text-[#D4AF37] scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-semibold text-xs">{post.likesCount}</span>
          </button>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:text-[#F5F5F0] transition group"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="font-semibold text-xs">{post.commentsCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:text-[#F5F5F0] transition"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{post.sharesCount}</span>
          </button>
        </div>

        {/* Bookmark save */}
        <button
          onClick={handleSave}
          className={`p-1.5 rounded-lg transition ${
            isSaved ? 'text-[#D4AF37]' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
          }`}
          title={isSaved ? 'Remover dos salvos' : 'Salvar publicação'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#D4AF37]' : ''}`} />
        </button>
      </div>

      {/* COMMENT SECTION */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-[#263B30]/60 space-y-3">
          {/* New comment input */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário cívico respeitoso..."
                className="flex-1 bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="p-2 bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] rounded-xl border border-[#D4AF37]/30 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-[#A5B2A9]">
              <button onClick={onOpenAuth} className="text-[#D4AF37] font-semibold underline">
                Entre na sua conta
              </button>{' '}
              para comentar nesta publicação.
            </div>
          )}

          {/* Existing comments list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comm) => (
                <div key={comm.id} className="p-2.5 rounded-xl bg-[#15291F]/70 border border-[#263B30]/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div 
                      onClick={() => onNavigateToUser(comm.authorUsername)}
                      className="flex items-center gap-1.5 cursor-pointer hover:underline flex-wrap"
                    >
                      <img src={comm.authorAvatar} alt={comm.authorName} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-[#F5F5F0]">{comm.authorName}</span>
                      <RankBadge rank={comm.authorRank} size="xs" />
                      <span className="text-[10px] text-[#A5B2A9]">@{comm.authorUsername}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#A5B2A9]">
                        {new Date(comm.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {(currentUser?.role === 'admin' || currentUser?.id === comm.authorId) && (
                        <button
                          onClick={() => handleDeleteComment(comm.id)}
                          className="p-1 rounded text-[#A5B2A9] hover:text-[#D94B4B] hover:bg-[#2e1515] transition cursor-pointer"
                          title="Excluir Comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[#F5F5F0] pl-6 leading-relaxed">{comm.content}</p>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-[#A5B2A9] text-center py-2">
                Nenhum comentário ainda. Seja o primeiro a debater!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
