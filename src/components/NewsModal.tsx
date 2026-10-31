import React from 'react';
import { X, Calendar, User, ExternalLink, Share2, Eye, ShieldCheck, Tag } from 'lucide-react';
import { NewsItem } from '../types';
import { showToast } from './Toast';

interface NewsModalProps {
  newsItem: NewsItem | null;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ newsItem, onClose }) => {
  if (!newsItem) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link da notícia copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl overflow-hidden my-auto animate-fade-in max-h-[90vh] flex flex-col">
        
        {/* TOP BAR */}
        <div className="p-4 border-b border-[#263B30] flex items-center justify-between bg-[#0b1712]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#174D32] border border-[#D4AF37]/30 text-xs font-bold text-[#E8CC76]">
              {newsItem.category}
            </span>
            {newsItem.isFeatured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#07140F] font-extrabold">
                DESTAQUE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition"
              title="Compartilhar notícia"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT SCROLL */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Headline */}
          <h2 className="font-serif-patriotic text-xl sm:text-2xl font-bold text-[#F5F5F0] leading-snug">
            {newsItem.title}
          </h2>

          {newsItem.subtitle && (
            <h4 className="text-sm font-medium text-[#E8CC76] leading-relaxed">
              {newsItem.subtitle}
            </h4>
          )}

          {/* Meta header */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#A5B2A9] py-2 border-y border-[#263B30]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              {new Date(newsItem.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              Por {newsItem.authorName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#A5B2A9]" />
              {newsItem.viewsCount} visualizações
            </span>
          </div>

          {/* Cover image */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#263B30]">
            <img
              src={newsItem.imageUrl}
              alt={newsItem.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lead Summary */}
          <div className="p-3.5 rounded-2xl bg-[#15291F] border-l-4 border-[#D4AF37] text-xs sm:text-sm text-[#F5F5F0] font-semibold leading-relaxed">
            {newsItem.summary}
          </div>

          {/* Full body */}
          <div className="text-xs sm:text-sm text-[#F5F5F0] leading-relaxed whitespace-pre-wrap space-y-3 font-normal pt-2">
            {newsItem.content}
          </div>

          {/* Source Box */}
          <div className="p-4 rounded-2xl bg-[#0b1712] border border-[#263B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <span className="font-bold text-[#F5F5F0]">Fonte Original Auditada: </span>
                <span className="text-[#A5B2A9]">{newsItem.sourceOriginal}</span>
              </div>
            </div>

            {newsItem.sourceUrl && (
              <a
                href={newsItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] font-semibold border border-[#D4AF37]/30 transition"
              >
                <span>Acessar fonte externa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-[#263B30] bg-[#0b1712] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#15291F] hover:bg-[#223d2e] text-[#F5F5F0] text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
