import React, { useState } from 'react';
import {
  Heart,
  QrCode,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Shield,
  Award
} from 'lucide-react';
import { Donation, User } from '../types';
import { storageService } from '../services/storageService';
import { RankBadge } from './RankBadge';
import { RANK_DEFINITIONS } from '../services/rankService';
import { showToast } from './Toast';

interface DonationGratitudeBannerProps {
  onOpenDonationModal: () => void;
  currentUser: User | null;
}

export const DonationGratitudeBanner: React.FC<DonationGratitudeBannerProps> = ({
  onOpenDonationModal,
  currentUser
}) => {
  const PIX_KEY = '81119119200';
  const [copied, setCopied] = useState(false);
  const donations = storageService.getDonations();

  const handleCopyPix = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    showToast('Código PIX copiado com sucesso!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mb-4 bg-gradient-to-br from-[#0c2016] via-[#10271c] to-[#08150f] border-2 border-[#D4AF37]/50 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#263B30]">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-[11px] font-extrabold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            Destaque de Agradecimento • Benfeitores da Pátria
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#F5F5F0] font-serif-patriotic tracking-tight flex items-center gap-2">
            <span>Mural de Gratidão aos Apoiadores da Plataforma</span>
            <Sparkles className="w-4 h-4 text-[#E8CC76] hidden sm:inline" />
          </h3>
          <p className="text-xs text-[#A5B2A9] leading-relaxed">
            Agradecemos a cada cidadão que contribui voluntariamente para manter a Sociedade Bosonarista no ar, soberana e veloz.{' '}
            <strong className="text-[#E8CC76]">
              Quem doa sobe de patente militar cívica e ganha condecoração perpétua aqui!
            </strong>
          </p>
        </div>

        {/* PIX Action Buttons - No CPF visible */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* Open QR Code modal */}
          <button
            onClick={onOpenDonationModal}
            className="px-4 py-2.5 bg-[#07140F] border border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#E8CC76] hover:text-[#FFF5D0] hover:bg-[#15291F] transition shadow-md cursor-pointer"
            title="Abrir QR Code para doação via PIX"
          >
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            <span>Ver QR Code PIX</span>
          </button>

          {/* Donate and Rank Up CTA */}
          <button
            onClick={onOpenDonationModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] text-[#07140F] font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 text-[#07140F]" />
            <span>Apoiar via PIX & Subir Patente</span>
          </button>
        </div>
      </div>

      {/* RECENT DONORS SHOWCASE ROW */}
      <div className="relative z-10 pt-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#E8CC76] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            Patriotas Condecorados Recentemente
          </span>
          <span className="text-[10px] text-[#A5B2A9]">
            {donations.length} apoios registrados
          </span>
        </div>

        {/* Scrollable Donors Cards */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {donations.map((d) => {
            const rankDef = RANK_DEFINITIONS[d.newRank] || RANK_DEFINITIONS['cabo'];
            return (
              <div
                key={d.id}
                className="shrink-0 w-64 bg-[#0a1812]/90 border border-[#263B30] hover:border-[#D4AF37]/50 rounded-2xl p-3 transition shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={d.donorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                      alt={d.donorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#F5F5F0] truncate flex items-center gap-1">
                        <span className="truncate">{d.donorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RankBadge rank={d.newRank} size="xs" />
                        <span className="text-[10px] text-[#E8CC76] font-semibold truncate">
                          {rankDef.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {d.message && (
                    <p className="text-[11px] text-[#A5B2A9] italic line-clamp-2 leading-relaxed bg-[#102019] p-2 rounded-xl border border-[#263B30]/60">
                      "{d.message}"
                    </p>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#263B30] flex items-center justify-between text-[10px]">
                  <span className="text-[#34A853] font-bold">
                    Apoio: R$ {d.amount.toFixed(2)}
                  </span>
                  <span className="text-[#A5B2A9]">
                    {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
