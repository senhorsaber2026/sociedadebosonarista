import React from 'react';
import { Activity } from 'lucide-react';
import { storageService } from '../services/storageService';
import { StoryItem } from '../types';
import { LiveAlert } from './LiveAlert';

interface HomeStatsBarProps {
  onNavigate?: (view: string) => void;
}

export const HomeStatsBar: React.FC<HomeStatsBarProps> = ({ onNavigate }) => {
  const stats = storageService.getAdminStats();
  const allStories: StoryItem[] = storageService.getStories();
  const liveStories = allStories.filter(s => s.isLive && s.mediaType === 'video');

  return (
    <div className="mb-4 bg-[#0a1812] border border-[#263B30] rounded-2xl p-3 sm:p-3.5 shadow-lg">
      {/* LIVE ALERT BANNER — LUZ VERMELHA E SOM QUANDO HOUVER LIVE ATIVA */}
      {liveStories.length > 0 && (
        <div className="mb-3 px-3 py-2.5 rounded-xl border-2 border-[#D94B4B]/50 bg-[#2a1414]/40 flex items-center gap-3 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#D94B4B]/10 to-transparent pointer-events-none" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D94B4B] shadow-[0_0_15px_rgba(217,75,75,0.9)] animate-ping shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Activity className="w-4 h-4 text-[#D94B4B] animate-pulse" />
            <span className="text-xs font-black text-[#FFF5D0] tracking-wider uppercase">AO VIVO AGORA</span>
          </div>
          <div className="flex-1 min-w-0 ml-2">
            {liveStories.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 mb-1 last:mb-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D94B4B] animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-[#F5F5F0] truncate">
                  {s.userName}
                </span>
                <span className="text-[9px] text-[#A5B2A9] truncate max-w-xs">{s.caption || 'Transmissão ao vivo'}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate?.('home')}
            className="px-3 py-1.5 rounded-lg bg-[#D94B4B] text-[#FFF5D0] font-bold text-xs hover:bg-[#b52828] transition shadow"
          >
            ASSISTIR AGORA
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34A853]"></span>
          </span>
          <span className="text-[11px] font-bold text-[#E8CC76] tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
            Status da Rede em Tempo Real
          </span>
        </div>
        <span className="text-[10px] text-[#A5B2A9] font-medium hidden sm:inline-block">
          Atualização contínua • Sociedade Bosonarista
        </span>
      </div>

      {/* 7 STATS TILES MATCHING EXACT SCREENSHOT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
        {/* 1. Patriotas */}
        <div
          onClick={() => onNavigate?.('explore')}
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#D4AF37]/40 cursor-pointer group"
          title="Ver cidadãos patriotas cadastrados"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#F5F5F0] transition">
            Patriotas
          </span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5 tracking-tight">
            {stats.totalUsers.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* 2. Ativos Hoje */}
        <div
          onClick={() => onNavigate?.('debates')}
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#E8CC76]/50 cursor-pointer group"
          title="Membros engajados nas últimas 24 horas"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#E8CC76] transition">
            Ativos Hoje
          </span>
          <div className="text-base sm:text-lg font-bold text-[#E8CC76] mt-0.5 tracking-tight">
            {stats.activeUsers.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* 3. Publicações */}
        <div
          onClick={() => onNavigate?.('home')}
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#D4AF37]/40 cursor-pointer group"
          title="Publicações realizadas no feed cívico"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#F5F5F0] transition">
            Publicações
          </span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5 tracking-tight">
            {stats.totalPosts.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* 4. Comentários */}
        <div
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#D4AF37]/40 group"
          title="Total de manifestações e comentários nos debates"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#F5F5F0] transition">
            Comentários
          </span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5 tracking-tight">
            {stats.totalComments.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* 5. Comunidades */}
        <div
          onClick={() => onNavigate?.('groups')}
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#D4AF37]/40 cursor-pointer group"
          title="Grupos e núcleos regionais patriotas"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#F5F5F0] transition">
            Comunidades
          </span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5 tracking-tight">
            {stats.totalGroups}
          </div>
        </div>

        {/* 6. Notícias */}
        <div
          onClick={() => onNavigate?.('news')}
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center transition hover:border-[#D4AF37]/40 cursor-pointer group"
          title="Notícias checadas e pautas informativas"
        >
          <span className="text-[10px] sm:text-[11px] text-[#A5B2A9] block font-medium group-hover:text-[#F5F5F0] transition">
            Notícias
          </span>
          <div className="text-base sm:text-lg font-bold text-[#F5F5F0] mt-0.5 tracking-tight">
            {stats.totalNews}
          </div>
        </div>

        {/* 7. Denúncias */}
        <div
          className="p-2.5 sm:p-3 bg-[#102019] rounded-2xl border border-[#263B30] text-center col-span-2 sm:col-span-1 transition hover:border-[#D94B4B]/50 group"
          title="Moderação e filtro ativo contra desinformação e ataques"
        >
          <span className="text-[10px] sm:text-[11px] text-[#D94B4B] block font-semibold group-hover:brightness-125 transition">
            Denúncias
          </span>
          <div className="text-base sm:text-lg font-bold text-[#D94B4B] mt-0.5 tracking-tight">
            {stats.pendingReports}
          </div>
        </div>
      </div>
    </div>
  );
};
