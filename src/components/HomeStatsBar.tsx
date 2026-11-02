import React from 'react';
import { Activity } from 'lucide-react';
import { storageService } from '../services/storageService';

interface HomeStatsBarProps {
  onNavigate?: (view: string) => void;
}

export const HomeStatsBar: React.FC<HomeStatsBarProps> = ({ onNavigate }) => {
  const stats = storageService.getAdminStats();

  return (
    <div className="mb-4 bg-[#0a1812] border border-[#263B30] rounded-2xl p-3 sm:p-3.5 shadow-lg">
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
