import React from 'react';
import { Store, Plus, ArrowRight, MessageCircle, MapPin, Tag } from 'lucide-react';
import { Company, User } from '../types';
import { storageService } from '../services/storageService';

interface FeaturedCompaniesSectionProps {
  onNavigateToCompanies: () => void;
  onOpenCreateCompany: () => void;
  currentUser: User | null;
}

export const FeaturedCompaniesSection: React.FC<FeaturedCompaniesSectionProps> = ({
  onNavigateToCompanies,
  onOpenCreateCompany,
  currentUser
}) => {
  const companies = storageService.getCompanies().slice(0, 3);

  if (companies.length === 0) return null;

  return (
    <div className="mb-4 bg-[#0a1812] border border-[#263B30] rounded-3xl p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#263B30]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#174D32] border border-[#D4AF37]/40 flex items-center justify-center text-[#E8CC76]">
            <Store className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-[#F5F5F0] tracking-tight flex items-center gap-2">
              <span>Vitrine de Empresas Patriotas</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold hidden sm:inline">
                Compre do Patriota
              </span>
            </div>
            <div className="text-[11px] text-[#A5B2A9]">
              Apoie o comércio e os serviços de membros da nossa comunidade
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateCompany}
            className="px-3 py-1.5 rounded-xl bg-[#174D32] hover:bg-[#1f6643] text-[#E8CC76] border border-[#D4AF37]/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Divulgar Empresa</span>
          </button>
          <button
            onClick={onNavigateToCompanies}
            className="p-1.5 rounded-xl hover:bg-[#15291F] text-[#A5B2A9] hover:text-[#F5F5F0] transition"
            title="Ver todas as empresas"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Featured Companies Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {companies.map((comp) => {
          const cleanWhatsapp = comp.whatsapp ? comp.whatsapp.replace(/\D/g, '') : '';
          const waNumber = cleanWhatsapp.startsWith('55') ? cleanWhatsapp : `55${cleanWhatsapp}`;

          return (
            <div
              key={comp.id}
              className="bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/50 rounded-2xl p-3 flex flex-col justify-between transition group shadow-sm"
            >
              <div>
                <div className="relative h-24 rounded-xl overflow-hidden mb-2 bg-[#07140F]">
                  <img
                    src={comp.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[#07140F]/90 text-[9px] font-bold text-[#E8CC76]">
                    {comp.category}
                  </div>
                  <div className="absolute bottom-1.5 left-2 right-2 text-xs font-bold text-[#F5F5F0] truncate">
                    {comp.name}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#A5B2A9] mb-1.5">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>{comp.city} - {comp.state}</span>
                </div>

                <p className="text-[11px] text-[#A5B2A9] line-clamp-2 leading-snug mb-2">
                  {comp.description}
                </p>

                {comp.specialOffer && (
                  <div className="text-[10px] text-[#E8CC76] bg-[#15291F] px-2 py-1 rounded-lg border border-[#D4AF37]/20 truncate mb-2">
                    🏷️ {comp.specialOffer}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#263B30] flex items-center justify-between">
                {comp.whatsapp ? (
                  <a
                    href={`https://wa.me/${waNumber}?text=Ol%C3%A1!%20Vi%20sua%20empresa%20na%20Sociedade%20Bosonarista.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 rounded-lg bg-[#25D366] text-[#07140F] font-bold text-[11px] flex items-center justify-center gap-1 hover:brightness-110 transition"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    onClick={onNavigateToCompanies}
                    className="w-full py-1.5 rounded-lg bg-[#15291F] text-[#E8CC76] font-bold text-[11px] hover:bg-[#174D32] transition"
                  >
                    Ver Detalhes
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
