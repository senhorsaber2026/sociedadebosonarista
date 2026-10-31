import React, { useState } from 'react';
import { 
  Newspaper, 
  Search, 
  Plus, 
  Calendar, 
  Eye, 
  ExternalLink, 
  Star, 
  Trash2, 
  Edit3,
  Shield,
  ArrowRight,
  Filter
} from 'lucide-react';
import { NewsItem, NewsCategory, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface NewsViewProps {
  currentUser: User | null;
  onOpenArticle: (newsItem: NewsItem) => void;
  onRefresh: () => void;
}

const CATEGORIES: ('Todas' | NewsCategory)[] = [
  'Todas',
  'Política',
  'Brasil',
  'Economia',
  'Congresso',
  'Judiciário',
  'Segurança Pública',
  'Educação',
  'Saúde',
  'Internacional',
  'Opinião'
];

export const NewsView: React.FC<NewsViewProps> = ({
  currentUser,
  onOpenArticle,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating news
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<NewsCategory>('Política');
  const [sourceOriginal, setSourceOriginal] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOpinion, setIsOpinion] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const news = storageService.getNews({
    category: selectedCategory === 'Todas' ? undefined : selectedCategory,
    query: searchQuery
  });

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAdmin) return;

    if (!title.trim() || !summary.trim() || !content.trim() || !imageUrl.trim() || !sourceOriginal.trim()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    storageService.createNews({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      summary: summary.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim(),
      category,
      authorId: currentUser.id,
      authorName: currentUser.name,
      sourceOriginal: sourceOriginal.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      isFeatured,
      isOpinion
    }, currentUser);

    showToast('Notícia cadastrada e publicada com sucesso!');
    setShowCreateModal(false);
    // Reset form
    setTitle('');
    setSubtitle('');
    setSummary('');
    setContent('');
    setImageUrl('');
    setSourceOriginal('');
    setSourceUrl('');
    setIsFeatured(false);
    onRefresh();
  };

  const handleToggleFeatured = (newsItem: NewsItem) => {
    if (!currentUser || !isAdmin) return;
    const res = storageService.toggleFeaturedNews(newsItem.id, currentUser);
    showToast(res ? 'Notícia fixada em destaque!' : 'Destaque removido.');
    onRefresh();
  };

  const handleDeleteNews = (newsItem: NewsItem) => {
    if (!currentUser || !isAdmin) return;
    if (confirm(`Tem certeza que deseja excluir a notícia "${newsItem.title}"?`)) {
      storageService.deleteNews(newsItem.id, currentUser);
      showToast('Notícia excluída do portal.');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
            <Newspaper className="w-4 h-4" />
            <span>Portal de Notícias Patrióticas</span>
          </div>
          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            Fatos, Economia e Bastidores da República
          </h2>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Acompanhe a cobertura verídica dos acontecimentos com checagem de fontes e sem censura.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] hover:brightness-110 text-[#07140F] font-bold text-xs sm:text-sm shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Notícia</span>
          </button>
        )}
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas notícias..."
            className="w-full bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Categories scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
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

      {/* NEWS GRID */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenArticle(item)}
              className="group bg-[#102019] rounded-2xl border border-[#263B30] hover:border-[#D4AF37]/40 overflow-hidden cursor-pointer transition flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#07140F]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#174D32]/90 backdrop-blur-sm border border-[#D4AF37]/40 text-[10px] font-bold text-[#E8CC76]">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#D4AF37] text-[10px] font-extrabold text-[#07140F]">
                        DESTAQUE
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="absolute top-3 right-3 flex items-center gap-1 bg-[#102019]/90 backdrop-blur-sm p-1 rounded-lg border border-[#263B30]"
                    >
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1 rounded hover:bg-[#15291F] transition ${item.isFeatured ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'}`}
                        title={item.isFeatured ? 'Remover destaque' : 'Tornar destaque'}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item)}
                        className="p-1 rounded text-[#D94B4B] hover:bg-[#2b1414] transition"
                        title="Excluir notícia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#A5B2A9] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D4AF37]" />
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span className="truncate">Fonte: {item.sourceOriginal}</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F5F5F0] group-hover:text-[#E8CC76] transition line-clamp-2 mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#A5B2A9] line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs text-[#A5B2A9] border-t border-[#263B30]/40 mt-2">
                <span className="text-[11px]">
                  Por <strong>{item.authorName}</strong>
                </span>
                <span className="text-[#E8CC76] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ler matéria completa <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30]">
          <Newspaper className="w-10 h-10 text-[#A5B2A9] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#F5F5F0]">Nenhuma notícia encontrada</h4>
          <p className="text-xs text-[#A5B2A9] mt-1">
            Tente selecionar outra categoria ou limpar a busca.
          </p>
        </div>
      )}

      {/* CREATE NEWS MODAL (ADMIN ONLY) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-5 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F0]">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Cadastrar Notícia no Portal</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#A5B2A9] hover:text-[#F5F5F0]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNews} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Título da Notícia *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Balança comercial do Agronegócio registra recorde..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Subtítulo / Linha fina
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Safra histórica impulsiona superávit da balança nacional..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NewsCategory)}
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    URL da Imagem de Capa *
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Fonte Original Auditada *
                  </label>
                  <input
                    type="text"
                    required
                    value={sourceOriginal}
                    onChange={(e) => setSourceOriginal(e.target.value)}
                    placeholder="Ex: Agência Câmara de Notícias"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Link da Fonte (Opcional)
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Resumo da Notícia *
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Breve resumo para exibição nos cartões da página inicial..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Conteúdo Completo da Matéria *
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Texto completo da notícia. Utilize parágrafos para estruturar o texto..."
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-[#F5F5F0]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#D4AF37] focus:ring-0"
                  />
                  <span>Destacar na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpinion}
                    onChange={(e) => setIsOpinion(e.target.checked)}
                    className="rounded text-[#D4AF37] focus:ring-0"
                  />
                  <span>Artigo de Opinião</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#263B30]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#15291F] text-xs text-[#F5F5F0] hover:bg-[#223d2e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-xs font-bold text-[#07140F] shadow hover:brightness-110"
                >
                  Publicar Notícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
