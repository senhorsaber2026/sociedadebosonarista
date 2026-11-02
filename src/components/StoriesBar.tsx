import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  Heart, 
  Send, 
  Sparkles, 
  Compass, 
  Play, 
  Pause, 
  Clock, 
  Upload, 
  Trash2, 
  Film,
  Youtube,
  ExternalLink,
  Activity
} from 'lucide-react';
import { StoryItem, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';
import { LiveAlert } from './LiveAlert';

interface StoriesBarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

interface UserStoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  isVerified?: boolean;
  badgeType?: 'verified' | 'flag' | 'star';
  stories: StoryItem[];
}

const STORY_DURATION_MS = 5000;

export const StoriesBar: React.FC<StoriesBarProps> = ({ currentUser, onOpenAuth }) => {
  const [stories, setStories] = useState<StoryItem[]>(() =>
    storageService.getStories().map(s => ({
      ...s,
      isLive: s.mediaType === 'video' || s.mediaType === 'youtube'
    }))
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndexInGroup, setActiveStoryIndexInGroup] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Add Story modal state
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [storyYoutubeUrl, setStoryYoutubeUrl] = useState('');
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video' | 'youtube'>('image');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyReply, setStoryReply] = useState('');
  const [hasLikedStory, setHasLikedStory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group stories by userId so each user has EXACTLY ONE circle
  const storyGroups: UserStoryGroup[] = useMemo(() => {
    const groups: UserStoryGroup[] = [];
    stories.forEach(story => {
      let g = groups.find(group => group.userId === story.userId);
      if (!g) {
        g = {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          isVerified: story.isVerified,
          badgeType: story.badgeType,
          stories: []
        };
        groups.push(g);
      }
      g.stories.push(story);
    });
    return groups;
  }, [stories]);

  // Listen for story updates
  useEffect(() => {
    const handleStoriesUpdated = () => {
      setStories(storageService.getStories().map(s => ({
        ...s,
        isLive: s.mediaType === 'video' || s.mediaType === 'youtube'
      })));
    };
    window.addEventListener('sb_stories_updated', handleStoriesUpdated);
    return () => window.removeEventListener('sb_stories_updated', handleStoriesUpdated);
  }, []);

  const currentGroup = activeGroupIndex !== null && storyGroups[activeGroupIndex] ? storyGroups[activeGroupIndex] : null;
  const activeStory = currentGroup && currentGroup.stories[activeStoryIndexInGroup] ? currentGroup.stories[activeStoryIndexInGroup] : null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCloseStory = useCallback(() => {
    setActiveGroupIndex(null);
    setActiveStoryIndexInGroup(0);
    progressRef.current = 0;
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleNextStory = useCallback(() => {
    progressRef.current = 0;
    setHasLikedStory(false);
    if (activeGroupIndex === null || !currentGroup) return;

    if (activeStoryIndexInGroup < currentGroup.stories.length - 1) {
      setActiveStoryIndexInGroup(prev => prev + 1);
    } else if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex(prev => (prev !== null ? prev + 1 : null));
      setActiveStoryIndexInGroup(0);
    } else {
      handleCloseStory();
    }
  }, [activeGroupIndex, activeStoryIndexInGroup, currentGroup, storyGroups.length, handleCloseStory]);

  const handlePrevStory = useCallback(() => {
    progressRef.current = 0;
    setHasLikedStory(false);
    if (activeGroupIndex === null) return;

    if (activeStoryIndexInGroup > 0) {
      setActiveStoryIndexInGroup(prev => prev - 1);
    } else if (activeGroupIndex > 0) {
      const prevIdx = activeGroupIndex - 1;
      setActiveGroupIndex(prevIdx);
      setActiveStoryIndexInGroup(storyGroups[prevIdx].stories.length - 1);
    }
  }, [activeGroupIndex, activeStoryIndexInGroup, storyGroups]);

  // 1. AUTO-PROGRESS TIMER - usa ref para não causar re-render
  useEffect(() => {
    const isYt = activeStory?.mediaType === 'youtube' || Boolean(activeStory?.youtubeId);
    if (activeStory === null || isPaused || isYt) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    progressRef.current = 0;
    const intervalTime = 200;
    const step = (intervalTime / STORY_DURATION_MS) * 100;

    timerRef.current = window.setInterval(() => {
      progressRef.current = Math.min(progressRef.current + step, 100);
      if (progressRef.current >= 100) {
        handleNextStory();
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [activeStory, isPaused, handleNextStory]);

  // 2. KEYBOARD LISTENERS & BODY SCROLL LOCK
  useEffect(() => {
    if (activeStory === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseStory();
      } else if (e.key === 'ArrowRight') {
        handleNextStory();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStory();
      } else if (e.key === ' ' && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeStory, handleCloseStory, handleNextStory, handlePrevStory]);

  const handleStoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showToast('O arquivo deve ter menos de 25MB.');
      return;
    }

    const isVideo = file.type.startsWith('video');
    setStoryMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setStoryImage(dataUrl);
      showToast(isVideo ? 'Vídeo selecionado com sucesso!' : 'Foto selecionada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const ytId = extractYouTubeId(storyYoutubeUrl);
    let finalMediaType = storyMediaType;
    let finalMediaUrl = storyImage.trim();
    let finalYoutubeUrl: string | undefined = undefined;
    let finalYoutubeId: string | undefined = undefined;

    if (ytId) {
      finalMediaType = 'youtube';
      finalYoutubeId = ytId;
      finalYoutubeUrl = storyYoutubeUrl.trim();
      finalMediaUrl = getYouTubeThumbnail(ytId);
    } else if (!finalMediaUrl) {
      finalMediaUrl = '/assets/images/brasil_hero_banner_1793411883121.jpg';
    }

    const newStory = storageService.addStory({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      hasUnseenStory: true,
      isVerified: currentUser.verified,
      isLive: finalMediaType === 'video' || finalMediaType === 'youtube',
      badgeType: 'verified',
      mediaUrl: finalMediaUrl,
      mediaType: finalMediaType,
      youtubeUrl: finalYoutubeUrl,
      youtubeId: finalYoutubeId,
      caption: storyCaption.trim() || 'Orgulho de ser brasileiro! 🇧🇷'
    });

    setStories(prev => [newStory, ...prev]);
    setIsAddingStory(false);
    setStoryImage('');
    setStoryYoutubeUrl('');
    setStoryCaption('');
    setStoryMediaType('image');
    showToast('Seu Story foi publicado com sucesso!');
  };

  const handleDeleteActiveStory = () => {
    if (!activeStory) return;
    if (confirm('Deseja excluir este Story?')) {
      storageService.deleteStory(activeStory.id);
      showToast('Story excluído com sucesso.');
      handleCloseStory();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyReply.trim() || !activeStory) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    storageService.sendMessage(
      currentUser.id,
      activeStory.userId,
      `[Resposta ao Story]: "${storyReply.trim()}"`
    );

    showToast(`Mensagem enviada com sucesso para ${activeStory.userName}!`);
    setStoryReply('');
    setIsPaused(false);
  };

  return (
    <div className="mb-4 bg-[#102019] rounded-2xl border border-[#263B30] p-3 shadow-md relative">
      {/* LIVE ALERT — SOM E LUZ VERMELHA QUANDO UM STORY DE VÍDEO ESTÁ AO VIVO */}
      {(activeGroupIndex !== null && activeStory && (activeStory.mediaType === 'video' || activeStory.mediaType === 'youtube')) && (
        <LiveAlert
          isLive={activeStory.isLive !== false}
          liveTitle={activeStory.caption}
          liveUser={activeStory.userName}
        />
      )}
      {/* Header with Title and Nav arrows */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#174D32] flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#E8CC76] tracking-wider">
            Stories
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-[#15291F] hover:bg-[#1f3d2e] border border-[#263B30] flex items-center justify-center text-[#A5B2A9] hover:text-[#F5F5F0] transition active:scale-95 cursor-pointer"
            aria-label="Stories anteriores"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-[#15291F] hover:bg-[#1f3d2e] border border-[#263B30] flex items-center justify-center text-[#A5B2A9] hover:text-[#F5F5F0] transition active:scale-95 cursor-pointer"
            aria-label="Próximos stories"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
      >
        {/* ADD STORY BUTTON */}
        <div 
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setIsAddingStory(true);
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none w-20"
        >
          <div className="relative w-14 h-14 rounded-full bg-[#174D32] hover:bg-[#1f6341] border-2 border-dashed border-[#D4AF37]/70 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#F5F5F0] text-center leading-tight line-clamp-2 group-hover:text-[#E8CC76] break-words">
            Adicionar Story
          </span>
        </div>

        {/* STORIES LIST - ONE CIRCLE PER USER */}
        {storyGroups.map((group, groupIdx) => {
          const latestStory = group.stories[0];
          const isYoutube = latestStory?.mediaType === 'youtube' || Boolean(latestStory?.youtubeId);
          const isVideo = !isYoutube && (latestStory?.mediaType === 'video' || latestStory?.mediaUrl?.startsWith('data:video') || latestStory?.mediaUrl?.endsWith('.mp4'));
          const storyMedia = latestStory?.mediaUrl || (isYoutube && latestStory?.youtubeId ? getYouTubeThumbnail(latestStory.youtubeId) : '/assets/images/brasil_hero_banner_1793411883121.jpg');

          return (
            <div
              key={group.userId}
              onClick={() => {
                setActiveGroupIndex(groupIdx);
                setActiveStoryIndexInGroup(0);
                progressRef.current = 0;
                setHasLikedStory(false);
                setIsPaused(false);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none w-20"
            >
              {/* Story Circle: Shows STORY PHOTO/VIDEO/YOUTUBE with gold ring */}
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] via-[#E8CC76] to-[#174D32] group-hover:scale-105 transition-transform duration-300 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden p-0.5 bg-[#102019] relative flex items-center justify-center">
                  {isYoutube ? (
                    <div className="w-full h-full relative rounded-full overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={storyMedia}
                        alt={group.userName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:brightness-110 transition"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-md">
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : isVideo ? (
                    <div className="w-full h-full relative rounded-full overflow-hidden bg-black flex items-center justify-center">
                      <video
                        src={storyMedia}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Film className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={storyMedia}
                      alt={group.userName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
                      }}
                      className="w-full h-full object-cover rounded-full group-hover:brightness-110 transition"
                    />
                  )}
                </div>

                {/* Mini User Avatar Badge in the bottom-right corner */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-[#102019] bg-[#102019] shadow">
                  <img
                    src={group.userAvatar}
                    alt={group.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className="text-[10px] sm:text-[11px] font-medium text-[#F5F5F0] text-center leading-tight line-clamp-2 w-full group-hover:text-[#E8CC76] break-words">
                {group.userName}
              </span>
            </div>
          );
        })}
      </div>

      {/* STORY VIEWER MODAL */}
      {currentGroup && activeStory && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseStory();
            }
          }}
        >
          {/* MOBILE PREVIOUS BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            disabled={activeGroupIndex === 0 && activeStoryIndexInGroup === 0}
            className="md:hidden ml-2 w-10 h-10 rounded-full bg-[#102019]/80 border border-[#263B30] hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-[#263B30] text-[#F5F5F0] hover:text-[#E8CC76] items-center justify-center transition cursor-pointer shadow-lg active:scale-95"
            title="Story anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* MAIN STORY CONTAINER */}
          <div 
            className="relative w-full max-w-[400px] max-h-[92vh] bg-[#07140F] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col justify-between"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Background Story Media (Photo, Video, or YouTube Player) */}
            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
              {activeStory.mediaType === 'youtube' || activeStory.youtubeId ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(activeStory.youtubeId || extractYouTubeId(activeStory.youtubeUrl || '') || '', true)}
                    title={activeStory.caption || 'Vídeo do YouTube'}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : activeStory.mediaType === 'video' || activeStory.mediaUrl?.startsWith('data:video') || activeStory.mediaUrl?.endsWith('.mp4') ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  playsInline
                  controls={false}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl || '/assets/images/brasil_hero_banner_1793411883121.jpg'}
                  alt="Story"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
                  }}
                  className="w-full h-full object-contain"
                />
              )}
              {/* Subtle gradient overlay to guarantee text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/70 pointer-events-none" />
            </div>

            {/* Top Navigation & Info Header */}
            <div className="relative z-20 p-3 pt-3">
              {/* Segmented Progress Bars */}
              <div className="flex items-center gap-1.5 w-full mb-3">
                {currentGroup.stories.map((s, idx) => (
                  <div 
                    key={s.id} 
                    className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStoryIndexInGroup(idx);
                      progressRef.current = 0;
                    }}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-[#E5AC24] to-[#F3C448] transition-all duration-75"
                      style={{
                        width: idx < activeStoryIndexInGroup 
                          ? '100%' 
                          : idx === activeStoryIndexInGroup 
                            ? `${Math.min(progressRef.current, 100)}%` 
                            : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* User Avatar + Name + Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.userAvatar}
                    alt={activeStory.userName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white drop-shadow">
                        {activeStory.userName}
                      </span>
                      {activeStory.isVerified && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/80 drop-shadow flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E5AC24]" />
                      Recente • Sociedade Bosonarista
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {(currentUser?.id === activeStory.userId || currentUser?.role === 'admin') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActiveStory();
                      }}
                      className="w-8 h-8 rounded-full bg-black/60 text-white hover:text-[#D94B4B] hover:bg-black/80 flex items-center justify-center transition border border-white/20 cursor-pointer"
                      title="Excluir este Story"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPaused(!isPaused);
                    }}
                    className="w-8 h-8 rounded-full bg-black/60 text-white hover:text-[#E8CC76] hover:bg-black/80 flex items-center justify-center transition border border-white/20 cursor-pointer"
                    title={isPaused ? 'Continuar (Espaço)' : 'Pausar (Espaço)'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseStory();
                    }}
                    className="w-8 h-8 rounded-full bg-black/60 text-white hover:text-[#D94B4B] hover:bg-black/80 flex items-center justify-center transition border border-white/20 cursor-pointer"
                    title="Fechar story (Esc)"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tap zones for left / right navigation */}
            <div className={`relative z-10 flex-1 flex ${activeStory.mediaType === 'youtube' || activeStory.youtubeId ? 'pointer-events-none' : ''}`}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
                className={`w-1/3 h-full cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-80 transition-opacity ${activeStory.mediaType === 'youtube' || activeStory.youtubeId ? 'pointer-events-auto' : ''}`}
                title="Story anterior"
              >
                <div className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center border border-white/20">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(prev => !prev);
                }}
                className={`w-1/3 h-full ${activeStory.mediaType === 'youtube' || activeStory.youtubeId ? 'pointer-events-none' : 'cursor-pointer'}`}
                title="Pressione para pausar"
              />
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStory();
                }}
                className={`w-1/3 h-full cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-80 transition-opacity ${activeStory.mediaType === 'youtube' || activeStory.youtubeId ? 'pointer-events-auto' : ''}`}
                title="Próximo story"
              >
                <div className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center border border-white/20">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bottom Caption & Interactive Reply Bar */}
            <div className="relative z-20 p-3.5 space-y-2.5 bg-gradient-to-t from-black via-black/85 to-transparent">
              {(activeStory.mediaType === 'youtube' || activeStory.youtubeId) && (
                <div className="flex items-center justify-between">
                  <a
                    href={activeStory.youtubeUrl || getYouTubeWatchUrl(activeStory.youtubeId!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
                  >
                    <Youtube className="w-4 h-4 fill-current" />
                    <span>Assistir no YouTube</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  <span className="text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-full border border-white/20 font-medium">
                    YouTube Vídeo
                  </span>
                </div>
              )}

              {activeStory.caption && (
                <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 text-xs sm:text-sm font-semibold text-white leading-relaxed shadow-lg">
                  {activeStory.caption}
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={storyReply}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  onChange={(e) => setStoryReply(e.target.value)}
                  placeholder={`Responder para ${activeStory.userName}...`}
                  className="flex-1 bg-black/70 border border-white/30 text-xs text-white placeholder-white/60 px-3.5 py-2.5 rounded-full focus:outline-none focus:border-[#D4AF37] transition shadow-inner"
                />
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasLikedStory(!hasLikedStory);
                    showToast(hasLikedStory ? 'Curtida removida' : 'Você curtiu o Story! 💚');
                  }}
                  className={`p-2.5 rounded-full transition cursor-pointer ${
                    hasLikedStory ? 'bg-[#D94B4B] text-white scale-110' : 'bg-black/60 text-white hover:text-[#D94B4B] border border-white/20'
                  }`}
                  title="Curtir story"
                >
                  <Heart className={`w-4 h-4 ${hasLikedStory ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-gradient-to-r from-[#174D32] to-[#206341] hover:brightness-110 text-[#E8CC76] transition cursor-pointer shadow border border-[#D4AF37]/30"
                  title="Enviar mensagem privada"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* MOBILE NEXT BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            disabled={activeGroupIndex === storyGroups.length - 1 && activeStoryIndexInGroup === currentGroup.stories.length - 1}
            className="md:hidden mr-2 w-10 h-10 rounded-full bg-[#102019]/80 border border-[#263B30] hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-[#263B30] text-[#F5F5F0] hover:text-[#E8CC76] items-center justify-center transition cursor-pointer shadow-lg active:scale-95"
            title="Próximo story"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* DESKTOP PREVIOUS BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            disabled={activeGroupIndex === 0 && activeStoryIndexInGroup === 0}
            className="hidden md:flex ml-4 w-11 h-11 rounded-full bg-[#102019]/80 border border-[#263B30] hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-[#263B30] text-[#F5F5F0] hover:text-[#E8CC76] items-center justify-center transition cursor-pointer shadow-lg active:scale-95"
            title="Story anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* DESKTOP NEXT BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            disabled={activeGroupIndex === storyGroups.length - 1 && activeStoryIndexInGroup === currentGroup.stories.length - 1}
            className="hidden md:flex ml-4 w-11 h-11 rounded-full bg-[#102019]/80 border border-[#263B30] hover:border-[#D4AF37] disabled:opacity-30 disabled:hover:border-[#263B30] text-[#F5F5F0] hover:text-[#E8CC76] items-center justify-center transition cursor-pointer shadow-lg active:scale-95"
            title="Próximo story (Seta direita)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ADD STORY MODAL */}
      {isAddingStory && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddingStory(false);
          }}
        >
          <div className="relative w-full max-w-md bg-[#102019] rounded-3xl border border-[#263B30] p-5 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F0] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Publicar Novo Story
              </h3>
              <button
                onClick={() => setIsAddingStory(false)}
                className="text-[#A5B2A9] hover:text-[#F5F5F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#A5B2A9] mb-1">
                  Legenda do Story (opcional)
                </label>
                <input
                  type="text"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  placeholder="Ex: Juntos pelo Brasil e pela liberdade! 🇧🇷"
                  maxLength={280}
                  className="w-full bg-[#15291F] border border-[#263B30] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5F5F0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Direct file upload from device */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#A5B2A9] mb-1.5">
                  Foto ou Vídeo do Story (Celular ou Computador)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleStoryFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 sm:py-4 px-4 rounded-2xl border border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] bg-[#15291F] hover:bg-[#1b3829] text-[#E8CC76] transition flex items-center justify-center gap-2 text-xs sm:text-sm font-bold cursor-pointer shadow-sm active:scale-98"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span>Escolher Foto ou Vídeo do seu Aparelho</span>
                </button>
              </div>

              {/* Selected Photo or Video Preview */}
              {storyImage && (
                <div className="relative rounded-2xl overflow-hidden h-32 sm:h-40 border-2 border-[#D4AF37]/50 bg-black/60 shadow-inner flex items-center justify-center">
                  {storyMediaType === 'video' ? (
                    <>
                      <video src={storyImage} className="w-full h-full object-contain" muted autoPlay playsInline />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D94B4B]/90 border border-[#D4AF37] text-[#FFF5D0] font-black text-[10px] uppercase tracking-wider shadow-lg">
                          <Activity className="w-3 h-3 fill-current animate-pulse" />
                          AO VIVO
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={storyImage} alt="Prévia" className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setStoryImage('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-[#D94B4B] text-white flex items-center justify-center text-xs transition cursor-pointer shadow"
                    title="Remover mídia"
                  >
                    ✕
                  </button>
                  <span className={`absolute bottom-2 left-3 text-[10px] font-bold ${storyMediaType === 'video' ? 'text-[#D94B4B]' : 'text-[#E8CC76]'}`}>
                    {storyMediaType === 'video' ? '🔴 VÍDEO AO VIVO' : '✓ Mídia pronta para o Story'}
                  </span>
                </div>
              )}

              {/* YouTube Video Link Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#A5B2A9] mb-1.5 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" />
                  <span>Link de Vídeo do YouTube (Vídeo normal ou Shorts)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={storyYoutubeUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStoryYoutubeUrl(val);
                      const yId = extractYouTubeId(val);
                      if (yId) {
                        setStoryMediaType('youtube');
                        setStoryImage(getYouTubeThumbnail(yId));
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=... ou youtu.be/..."
                    className="w-full bg-[#15291F] border border-[#263B30] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5F5F0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                {extractYouTubeId(storyYoutubeUrl) && (
                  <div className="mt-2 flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-[#FF0000]/40">
                    <img
                      src={getYouTubeThumbnail(extractYouTubeId(storyYoutubeUrl)!)}
                      alt="YouTube preview"
                      className="w-16 h-10 object-cover rounded-lg border border-[#FF0000]/30 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <Youtube className="w-3.5 h-3.5 text-[#FF0000]" /> Vídeo do YouTube Detectado
                      </span>
                      <span className="text-[10px] text-[#A5B2A9] truncate block">
                        ID: {extractYouTubeId(storyYoutubeUrl)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#A5B2A9] mb-1">
                  Ou cole a URL de uma Imagem
                </label>
                <input
                  type="url"
                  value={storyImage}
                  onChange={(e) => {
                    setStoryImage(e.target.value);
                    setStoryMediaType('image');
                  }}
                  placeholder="https://..."
                  className="w-full bg-[#15291F] border border-[#263B30] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5F5F0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Quick image choices */}
              <div>
                <span className="text-[11px] text-[#A5B2A9] block mb-1.5">Ou escolha uma sugestão oficial:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => {
                      setStoryImage('/assets/images/brasil_hero_banner_1793411883121.jpg');
                      setStoryMediaType('image');
                    }}
                    className="h-16 rounded-lg overflow-hidden border border-[#263B30] hover:border-[#D4AF37] cursor-pointer group/item relative"
                  >
                    <img src="/assets/images/brasil_hero_banner_1793411883121.jpg" alt="Brasília" className="w-full h-full object-cover group-hover/item:scale-105 transition" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5">Brasília</span>
                  </div>
                  <div
                    onClick={() => {
                      setStoryImage('/assets/images/brasil_bandeira_card_1793411895078.jpg');
                      setStoryMediaType('image');
                    }}
                    className="h-16 rounded-lg overflow-hidden border border-[#263B30] hover:border-[#D4AF37] cursor-pointer group/item relative"
                  >
                    <img src="/assets/images/brasil_bandeira_card_1793411895078.jpg" alt="Bandeira" className="w-full h-full object-cover group-hover/item:scale-105 transition" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5">Bandeira</span>
                  </div>
                  <div
                    onClick={() => {
                      setStoryImage('/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png');
                      setStoryMediaType('image');
                    }}
                    className="h-16 rounded-lg overflow-hidden border border-[#263B30] hover:border-[#D4AF37] cursor-pointer group/item relative"
                  >
                    <img src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png" alt="Emblema" className="w-full h-full object-cover group-hover/item:scale-105 transition" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5">Emblema</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStory(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#15291F] text-xs sm:text-sm text-[#A5B2A9] hover:text-[#F5F5F0] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#D94B4B] via-[#b52828] to-[#8a1a1a] text-xs sm:text-sm font-black text-[#FFF5D0] hover:brightness-110 shadow-[0_0_20px_rgba(217,75,75,0.5)] transition cursor-pointer flex items-center justify-center gap-1.5`}
                >
                  {storyMediaType === 'video' ? (
                    <>
                      <Activity className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current animate-pulse" />
                      <span>Publicar STORY AO VIVO</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
                      <span>Publicar Story</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
