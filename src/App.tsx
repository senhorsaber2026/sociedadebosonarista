/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { User, Post, NewsItem, DebateTopic, Group } from './types';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { CenterHeroBanner } from './components/CenterHeroBanner';
import { StoriesBar } from './components/StoriesBar';
import { FeaturedNewsPanel } from './components/FeaturedNewsPanel';
import { CreatePostCard } from './components/CreatePostCard';
import { PostCard } from './components/PostCard';
import { NewsView } from './components/NewsView';
import { NewsModal } from './components/NewsModal';
import { DebatesView } from './components/DebatesView';
import { GroupsView } from './components/GroupsView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { ExploreView } from './components/ExploreView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { RegisterView } from './components/RegisterView';
import { FriendsView } from './components/FriendsView';
import { MemorialView } from './components/MemorialView';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { RankSystemModal } from './components/RankSystemModal';
import { PatrioticManifestoModal } from './components/PatrioticManifestoModal';
import { MobileNav } from './components/MobileNav';
import { ToastContainer, showToast } from './components/Toast';
import { Flame, Clock, BarChart2, Filter, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [debates, setDebates] = useState<DebateTopic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  // Feed Filter states
  const [feedSort, setFeedSort] = useState<'recent' | 'popular'>('recent');
  const [feedCategory, setFeedCategory] = useState<string>('Todos');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsItem | null>(null);
  const [reportingItem, setReportingItem] = useState<any | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    storageService.init();
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    setPosts(storageService.getPosts({ 
      category: feedCategory === 'Todos' ? undefined : feedCategory,
      sortBy: feedSort 
    }));
    setNews(storageService.getNews());
    setDebates(storageService.getDebates());
    setGroups(storageService.getGroups());
    setSuggestedUsers(storageService.getUsers());
  };

  useEffect(() => {
    setPosts(storageService.getPosts({ 
      category: feedCategory === 'Todos' ? undefined : feedCategory,
      sortBy: feedSort 
    }));
  }, [feedSort, feedCategory]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (initialTab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleOpenReport = (item: any) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setReportingItem(item);
  };

  const handlePostCreated = (newPost: Post) => {
    refreshAllData();
    setIsCreatePostModalOpen(false);
  };

  const CATEGORIES = ['Todos', 'Política', 'Brasil', 'Economia', 'Congresso', 'Agronegócio', 'Liberdade'];

  return (
    <div className="min-h-screen bg-[#07140F] text-[#F5F5F0] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#07140F]">
      
      {/* GLOBAL TOAST ALERTS */}
      <ToastContainer />

      {/* TOP FIXED NAVBAR */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenRanksModal={() => setIsRankModalOpen(true)}
        currentView={currentView}
      />

      {/* MAIN CONTAINER: THREE-COLUMN LAYOUT */}
      {/* Only show right sidebar on feed views — full-page views (memorial, profile, settings, etc.) expand to full width */}
      {(() => {
        const isFeedView = ['home', 'explore', 'saved'].includes(currentView);
        return (
      <div className={`flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 py-2 sm:py-6 flex gap-6 ${
        currentView === 'messages' ? 'pb-2 lg:pb-6' : 'pb-20 lg:pb-6'
      }`}>
        
        {/* LEFT COLUMN: NAVIGATION & PROFILE (250px) */}
        <SidebarLeft
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenRanksModal={() => setIsRankModalOpen(true)}
          onOpenManifesto={() => setIsManifestoOpen(true)}
          groups={groups}
        />

        {/* CENTER COLUMN: FEED OR SUB-VIEW (FLEXIBLE) */}
        <main className={`flex-1 min-w-0 w-full ${isFeedView ? 'max-w-3xl mx-auto' : 'max-w-5xl mx-auto'}`}>
          
          {/* HOME VIEW: HERO BANNER, FEATURED NEWS, CREATE POST & POSTS FEED */}
          {currentView === 'home' && (
            <div>
              {/* STORIES CAROUSEL BAR */}
              <StoriesBar
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />

              {/* CENTRAL HERO BANNER */}
              <CenterHeroBanner
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
                onOpenAuth={() => handleOpenAuth('login')}
              />

              {/* FEATURED NEWS CAROUSEL */}
              <FeaturedNewsPanel
                news={news}
                onOpenArticle={(item) => setSelectedNewsArticle(item)}
                onViewAllNews={() => handleNavigate('news')}
              />

              {/* CREATE PUBLICATION INLINE CARD */}
              <CreatePostCard
                currentUser={currentUser}
                onPostCreated={handlePostCreated}
                onOpenAuth={() => handleOpenAuth('login')}
              />

              {/* FEED CONTROLS: SORT & CATEGORIES */}
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#102019] p-3 rounded-2xl border border-[#263B30]">
                {/* Sort tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFeedSort('recent')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      feedSort === 'recent'
                        ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recentes</span>
                  </button>

                  <button
                    onClick={() => setFeedSort('popular')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      feedSort === 'popular'
                        ? 'bg-[#174D32] text-[#E8CC76] shadow-sm'
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Mais Relevantes</span>
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFeedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                        feedCategory === cat
                          ? 'bg-[#D4AF37] text-[#07140F] font-bold'
                          : 'bg-[#15291F] text-[#A5B2A9] hover:text-[#F5F5F0]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* POSTS FEED */}
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onPostUpdated={refreshAllData}
                      onOpenReport={handleOpenReport}
                      onNavigateToUser={(u) => handleNavigate('profile', u)}
                      onOpenAuth={() => handleOpenAuth('login')}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
                  Nenhuma publicação nesta categoria no momento. Seja o primeiro a publicar!
                </div>
              )}
            </div>
          )}

          {/* PORTAL DE NOTÍCIAS */}
          {currentView === 'news' && (
            <NewsView
              currentUser={currentUser}
              onOpenArticle={(item) => setSelectedNewsArticle(item)}
              onRefresh={refreshAllData}
            />
          )}

          {/* DEBATES POLÍTICOS */}
          {currentView === 'debates' && (
            <DebatesView
              currentUser={currentUser}
              activeDebateId={viewParam}
              onRefresh={refreshAllData}
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateToUser={(u) => handleNavigate('profile', u)}
            />
          )}

          {/* COMUNIDADES & GRUPOS */}
          {currentView === 'groups' && (
            <GroupsView
              currentUser={currentUser}
              activeGroupId={viewParam}
              onRefresh={refreshAllData}
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigateToExplore={(t) => handleNavigate('explore', t)}
            />
          )}

          {/* MENSAGENS PRIVADAS */}
          {currentView === 'messages' && (
            <MessagesView
              currentUser={currentUser}
              initialRecipientId={viewParam}
              onOpenAuth={() => handleOpenAuth('login')}
              onRefresh={refreshAllData}
            />
          )}

          {/* PERFIL DO USUÁRIO */}
          {currentView === 'profile' && (
            <ProfileView
              username={viewParam || currentUser?.username || 'coronel_silva'}
              currentUser={currentUser}
              onRefresh={refreshAllData}
              onOpenAuth={() => handleOpenAuth('login')}
              onOpenReport={handleOpenReport}
              onNavigateToUser={(u) => handleNavigate('profile', u)}
              onOpenRanksModal={() => setIsRankModalOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {/* EXPLORAR / BUSCA */}
          {currentView === 'explore' && (
            <ExploreView
              initialQuery={viewParam || ''}
              currentUser={currentUser}
              onRefresh={refreshAllData}
              onOpenArticle={(item) => setSelectedNewsArticle(item)}
              onNavigateToUser={(u) => handleNavigate('profile', u)}
              onNavigate={handleNavigate}
              onOpenReport={handleOpenReport}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          )}

          {/* PAINEL ADMINISTRATIVO */}
          {currentView === 'admin' && (
            <AdminView
              currentUser={currentUser}
              onRefresh={refreshAllData}
              onOpenArticle={(item) => setSelectedNewsArticle(item)}
            />
          )}

          {/* CONFIGURAÇÕES & PRIVACIDADE */}
          {currentView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onOpenAuth={() => handleOpenAuth('login')}
              onRefresh={refreshAllData}
            />
          )}

          {/* ÁREA DE CADASTRO PATRIÓTICO COM CPF */}
          {currentView === 'register' && (
            <RegisterView
              onSuccess={() => {
                refreshAllData();
                handleNavigate('home');
              }}
              onOpenLogin={() => handleOpenAuth('login')}
            />
          )}

          {/* REDE DE AMIGOS & PATRIOTAS */}
          {currentView === 'friends' && (
            <FriendsView
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          )}

          {/* ALA MEMORIAL — FILÓSOFOS E LÍDERES DA DIREITA */}
          {currentView === 'memorial' && (
            <MemorialView
              currentUser={currentUser}
              onOpenAuth={() => handleOpenAuth('login')}
              onNavigate={handleNavigate}
            />
          )}

          {/* PUBLICAÇÕES SALVAS */}
          {currentView === 'saved' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-[#102019] border border-[#263B30] mb-4">
                <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
                  Publicações Salvas
                </h2>
                <p className="text-xs text-[#A5B2A9] mt-1">
                  Seu arquivo particular de publicações e análises salvas para releitura.
                </p>
              </div>

              {posts.filter(p => currentUser && (p.savedUserIds || []).includes(currentUser.id)).length > 0 ? (
                posts
                  .filter(p => currentUser && (p.savedUserIds || []).includes(currentUser.id))
                  .map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onPostUpdated={refreshAllData}
                      onOpenReport={handleOpenReport}
                      onNavigateToUser={(u) => handleNavigate('profile', u)}
                      onOpenAuth={() => handleOpenAuth('login')}
                    />
                  ))
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
                  Você ainda não possui publicações salvas. Clique no ícone de marcador nas publicações para guardá-las aqui.
                </div>
              )}
            </div>
          )}

        </main>

        {/* RIGHT COLUMN: TRENDS, DEBATES, MEMBERS & GROUPS (310px) — only on feed views */}
        {isFeedView && (
          <SidebarRight
            currentUser={currentUser}
            debates={debates}
            groups={groups}
            suggestedUsers={suggestedUsers}
            onNavigate={handleNavigate}
            onRefresh={refreshAllData}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenManifesto={() => setIsManifestoOpen(true)}
          />
        )}

      </div>);
      })()}

      {/* MOBILE BOTTOM NAVIGATION */}
      {currentView !== 'messages' && (
        <MobileNav
          currentView={currentView}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      )}

      {/* MODAL: NOTÍCIA COMPLETA */}
      <NewsModal
        newsItem={selectedNewsArticle}
        onClose={() => setSelectedNewsArticle(null)}
      />

      {/* MODAL: AUTENTICAÇÃO (LOGIN & CADASTRO) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={refreshAllData}
      />

      {/* MODAL: DENUNCIAR CONTEÚDO */}
      <ReportModal
        isOpen={!!reportingItem}
        item={reportingItem}
        currentUser={currentUser}
        onClose={() => setReportingItem(null)}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* MODAL: PLANO DE CARREIRA CÍVICA & PATENTES */}
      <RankSystemModal
        isOpen={isRankModalOpen}
        currentUser={currentUser}
        onClose={() => setIsRankModalOpen(false)}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* MODAL: MANIFESTO CÍVICO PATRIÓTICO */}
      <PatrioticManifestoModal
        isOpen={isManifestoOpen}
        currentUser={currentUser}
        onClose={() => setIsManifestoOpen(false)}
        onPledgeAffirmed={refreshAllData}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* MODAL: CRIAR PUBLICAÇÃO AVULSA */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-5 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <span className="text-sm font-bold text-[#F5F5F0]">Nova Publicação</span>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="text-[#A5B2A9] hover:text-[#F5F5F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreatePostCard
              currentUser={currentUser}
              onPostCreated={handlePostCreated}
              onOpenAuth={() => handleOpenAuth('login')}
            />
          </div>
        </div>
      )}

    </div>
  );
}
