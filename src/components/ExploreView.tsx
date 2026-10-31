import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Users, 
  Flame, 
  Newspaper, 
  Bookmark, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { User, Post, NewsItem, DebateTopic, Group } from '../types';
import { storageService } from '../services/storageService';
import { PostCard } from './PostCard';

interface ExploreViewProps {
  initialQuery?: string;
  currentUser: User | null;
  onRefresh: () => void;
  onOpenArticle: (newsItem: NewsItem) => void;
  onNavigateToUser: (username: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenReport: (item: any) => void;
  onOpenAuth: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialQuery = '',
  currentUser,
  onRefresh,
  onOpenArticle,
  onNavigateToUser,
  onNavigate,
  onOpenReport,
  onOpenAuth
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'news' | 'debates' | 'groups'>('all');

  const users = storageService.getUsers().filter(u => 
    !query.trim() || 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  const posts = storageService.getPosts({ query: query.trim() || undefined });
  const news = storageService.getNews({ query: query.trim() || undefined });
  const debates = storageService.getDebates(undefined, query.trim() || undefined);
  const groups = storageService.getGroups(undefined, query.trim() || undefined);

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
          <Compass className="w-4 h-4" />
          <span>Explorar a Comunidade</span>
        </div>
        <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0]">
          Descubra Ideias, Notícias & Patriotas
        </h2>

        {/* Big search bar */}
        <div className="mt-4 relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por palavras, hashtags, tópicos ou patriotas..."
            className="w-full bg-[#15291F] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] pl-10 pr-4 py-3 rounded-2xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none shadow-inner"
          />
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-[#263B30] text-xs font-semibold overflow-x-auto pb-1 gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'all' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'posts' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Publicações ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'users' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Cidadãos ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'news' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Notícias ({news.length})
        </button>
        <button
          onClick={() => setActiveTab('debates')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'debates' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Debates ({debates.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-2 px-3.5 rounded-xl transition ${activeTab === 'groups' ? 'bg-[#174D32] text-[#E8CC76]' : 'text-[#A5B2A9]'}`}
        >
          Grupos ({groups.length})
        </button>
      </div>

      {/* TAB RESULTS */}
      {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#F5F5F0]">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Cidadãos Patriotas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users.slice(0, activeTab === 'all' ? 3 : undefined).map(u => (
              <div
                key={u.id}
                onClick={() => onNavigateToUser(u.username)}
                className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] hover:border-[#D4AF37]/40 cursor-pointer transition flex items-center gap-3"
              >
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-[#263B30]" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#F5F5F0] truncate">{u.name}</div>
                  <div className="text-[10px] text-[#A5B2A9]">@{u.username}</div>
                  <div className="text-[9px] text-[#E8CC76] mt-0.5">{u.followersCount} seguidores</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'news') && news.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#F5F5F0]">
            <span className="flex items-center gap-1.5"><Newspaper className="w-3.5 h-3.5 text-[#D4AF37]" /> Notícias Relevantes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {news.slice(0, activeTab === 'all' ? 2 : undefined).map(n => (
              <div
                key={n.id}
                onClick={() => onOpenArticle(n)}
                className="p-3 bg-[#102019] rounded-2xl border border-[#263B30] hover:border-[#D4AF37]/40 cursor-pointer transition flex items-center gap-3"
              >
                <img src={n.imageUrl} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#E8CC76] font-semibold">{n.category}</span>
                  <h5 className="font-bold text-xs text-[#F5F5F0] line-clamp-2">{n.title}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#F5F5F0]">
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#D4AF37]" /> Publicações</span>
          </div>
          {posts.slice(0, activeTab === 'all' ? 4 : undefined).map(p => (
            <PostCard
              key={p.id}
              post={p}
              currentUser={currentUser}
              onPostUpdated={onRefresh}
              onOpenReport={onOpenReport}
              onNavigateToUser={onNavigateToUser}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}

    </div>
  );
};
