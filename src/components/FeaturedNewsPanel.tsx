import React from 'react';
import { Star, Calendar, Eye, ArrowRight, ChevronRight } from 'lucide-react';
import { NewsItem } from '../types';

interface FeaturedNewsPanelProps {
  news: NewsItem[];
  onOpenArticle: (newsItem: NewsItem) => void;
  onViewAllNews: () => void;
}

export const FeaturedNewsPanel: React.FC<FeaturedNewsPanelProps> = ({
  news,
  onOpenArticle,
  onViewAllNews
}) => {
  // Find featured or first item as main, and the next 3 items as side stack
  const mainArticle = news.find(n => n.id === 'news_congresso') || news[0];
  const sideArticles = news
    .filter(n => n.id !== mainArticle?.id)
    .slice(0, 3);

  if (!mainArticle) return null;

  return (
    <div className="mb-5">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#E5AC24] fill-[#E5AC24]" />
          <h2 className="text-xs sm:text-sm font-extrabold text-[#E5AC24] tracking-wider uppercase font-serif-patriotic">
            DESTAQUES DO BRASIL
          </h2>
        </div>

        <button
          onClick={onViewAllNews}
          className="text-xs font-semibold text-[#E5AC24] hover:text-[#FFF5D0] flex items-center gap-1 transition"
        >
          <span>Ver todas as notícias</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-COLUMN NEWS GRID MATCHING REFERENCE SCREENSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LEFT COLUMN: LARGE FEATURED NEWS CARD (~58%) */}
        <div
          onClick={() => onOpenArticle(mainArticle)}
          className="lg:col-span-7 bg-[#102019] rounded-2xl border border-[#263B30] overflow-hidden shadow-lg group cursor-pointer flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all duration-300"
        >
          {/* Main Photo with Category Tag */}
          <div className="relative h-44 sm:h-52 overflow-hidden bg-[#07140F]">
            <img
              src={mainArticle.imageUrl?.replace('/src/assets/', '/assets/') || '/assets/images/brasil_hero_banner_1793411883121.jpg'}
              alt={mainArticle.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/brasil_hero_banner_1793411883121.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#E5AC24] text-[#07140F] font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              {mainArticle.category || 'POLÍTICA'}
            </div>
          </div>

          {/* Article Info & Meta */}
          <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#F5F5F0] group-hover:text-[#E8CC76] transition-colors leading-snug line-clamp-2 mb-2 font-serif-patriotic">
                {mainArticle.title}
              </h3>

              <p className="text-xs text-[#A5B2A9] line-clamp-2 leading-relaxed mb-3">
                {mainArticle.summary || mainArticle.subtitle}
              </p>
            </div>

            {/* Footer with Date, Views, and Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#263B30]/60 text-[11px] text-[#A5B2A9]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E5AC24]" />
                  {new Date(mainArticle.publishedAt).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#E5AC24]" />
                  {((mainArticle.viewsCount || 24500) / 1000).toFixed(1)} mil
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenArticle(mainArticle);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E5AC24] to-[#C99818] hover:brightness-110 text-[#07140F] font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
              >
                <span>Ler notícia</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 STACKED COMPACT NEWS CARDS (~42%) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 justify-between">
          {sideArticles.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenArticle(item)}
              className="bg-[#102019] rounded-2xl border border-[#263B30] p-2.5 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-pointer flex items-center gap-3 shadow-md flex-1"
            >
              {/* Thumbnail */}
              <div className="w-24 sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-[#07140F] border border-[#263B30]">
                <img
                  src={item.imageUrl?.replace('/src/assets/', '/assets/')}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/brasil_bandeira_card_1793411895078.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Title & Category & Date */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <div>
                  <span className="text-[10px] font-bold text-[#E5AC24] tracking-wider uppercase block mb-0.5">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#F5F5F0] group-hover:text-[#E8CC76] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#A5B2A9] mt-1">
                  <Calendar className="w-3 h-3 text-[#E5AC24]" />
                  <span>{new Date(item.publishedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
