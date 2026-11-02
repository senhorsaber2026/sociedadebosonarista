import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Tag,
  Trash2,
  ExternalLink,
  MessageCircle,
  Building2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Company, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface CompaniesViewProps {
  currentUser: User | null;
  onOpenCreateCompany: () => void;
  onRefresh: () => void;
  onNavigateToUser: (user: User) => void;
}

const CATEGORIES = [
  'Todas',
  'Agropecuária',
  'Alimentação & Gastronomia',
  'Comércio & Varejo',
  'Serviços & Consultoria',
  'Construção & Reformas',
  'Tecnologia & Inovação',
  'Moda & Vestuário',
  'Saúde & Bem-estar',
  'Educação & Cursos',
  'Veículos & Autopeças'
];

const BRAZILIAN_STATES = [
  'Todos',
  'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'GO', 'MT', 'MS', 'DF',
  'BA', 'CE', 'PE', 'ES', 'PA', 'AM', 'RO', 'TO', 'MA', 'PB',
  'RN', 'AL', 'SE', 'PI', 'AC', 'AP', 'RR'
];

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  currentUser,
  onOpenCreateCompany,
  onRefresh,
  onNavigateToUser
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedState, setSelectedState] = useState('Todos');

  const companies = storageService.getCompanies({
    category: selectedCategory,
    state: selectedState,
    search
  });

  const handleDeleteCompany = (comp: Company) => {
    if (!currentUser) return;
    if (window.confirm(`Deseja realmente remover a empresa "${comp.name}"?`)) {
      const ok = storageService.deleteCompany(comp.id, currentUser.id, currentUser.role === 'admin');
      if (ok) {
        showToast('Empresa removida com sucesso.');
        onRefresh();
      } else {
        showToast('Permissão negada para excluir esta empresa.');
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0c2016] via-[#153424] to-[#0c2016] border border-[#263B30] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
              Livre Iniciativa • Compre do Patriota
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F0] font-serif-patriotic tracking-tight">
              Vitrine de Empresas & Negócios Patriotas
            </h1>
            <p className="text-xs sm:text-sm text-[#A5B2A9] leading-relaxed">
              Descubra e apoie negócios criados por membros da Sociedade Bosonarista. Aqui os cidadãos de bem encontram produtos, serviços e descontos exclusivos de quem defende a pátria e a família!
            </p>
          </div>

          <button
            onClick={onOpenCreateCompany}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] text-[#07140F] font-black text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Divulgar Minha Empresa</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-[#102019] border border-[#263B30] rounded-2xl p-3 sm:p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A5B2A9] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome da empresa, ramo, cidade ou palavra-chave..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] placeholder-[#A5B2A9]/60 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* State filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#A5B2A9] whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              Estado:
            </span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf === 'Todos' ? 'Todos os Estados' : uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                  : 'bg-[#15291F] text-[#A5B2A9] hover:text-[#F5F5F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* COMPANIES GRID */}
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((comp) => {
            const isOwner = currentUser?.id === comp.ownerId || currentUser?.role === 'admin';
            const cleanWhatsapp = comp.whatsapp ? comp.whatsapp.replace(/\D/g, '') : '';
            const waNumber = cleanWhatsapp.startsWith('55') ? cleanWhatsapp : `55${cleanWhatsapp}`;

            return (
              <div
                key={comp.id}
                className="bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/50 rounded-3xl p-4 sm:p-5 shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  {/* Company Top Bar & Image */}
                  <div className="relative mb-3.5 rounded-2xl overflow-hidden h-40 bg-[#07140F]">
                    <img
                      src={comp.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'}
                      alt={comp.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07140F] via-transparent to-black/40" />

                    {/* Category badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#07140F]/90 backdrop-blur-sm border border-[#263B30] text-[10px] font-extrabold text-[#E8CC76]">
                      {comp.category}
                    </div>

                    {/* Location badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#174D32]/90 backdrop-blur-sm border border-[#D4AF37]/40 text-[10px] font-bold text-[#F5F5F0] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      <span>{comp.city} - {comp.state}</span>
                    </div>

                    {/* Title in image overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-base sm:text-lg font-black text-[#F5F5F0] tracking-tight truncate drop-shadow-md">
                        {comp.name}
                      </h3>
                    </div>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center justify-between text-xs text-[#A5B2A9] mb-2 px-1">
                    <span className="flex items-center gap-1 truncate">
                      <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Divulgado por</span>
                      <strong className="text-[#F5F5F0]">@{comp.ownerUsername}</strong>
                    </span>
                    {comp.verified && (
                      <span className="text-[10px] text-[#34A853] font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#A5B2A9] leading-relaxed line-clamp-3 mb-3 px-1">
                    {comp.description}
                  </p>

                  {/* Exclusive Member Discount / Offer */}
                  {comp.specialOffer && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#174D32]/80 to-[#102019] border border-[#D4AF37]/40 text-xs text-[#E8CC76] flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div className="truncate">
                        <span className="font-extrabold text-[#F5F5F0]">Benefício Patriota: </span>
                        <span>{comp.specialOffer}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#263B30] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* WhatsApp */}
                    {comp.whatsapp && (
                      <a
                        href={`https://wa.me/${waNumber}?text=Ol%C3%A1!%20Encontrei%20sua%20empresa%20na%20Sociedade%20Bosonarista.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] text-[#07140F] font-bold text-xs flex items-center gap-1 hover:brightness-110 transition shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Website */}
                    {comp.website && (
                      <a
                        href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-[#15291F] hover:bg-[#174D32] text-[#E8CC76] font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Site</span>
                      </a>
                    )}

                    {/* Instagram */}
                    {comp.instagram && (
                      <a
                        href={`https://instagram.com/${comp.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-[#15291F] hover:bg-[#174D32] text-[#A5B2A9] hover:text-[#F5F5F0] font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                        <span>{comp.instagram}</span>
                      </a>
                    )}
                  </div>

                  {/* Delete button for owner or admin */}
                  {(isOwner || currentUser?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteCompany(comp)}
                      className="p-1.5 rounded-lg text-[#A5B2A9] hover:text-[#D94B4B] hover:bg-[#2a1414] transition cursor-pointer"
                      title={currentUser?.role === 'admin' && !isOwner ? "Excluir empresa (Poder Admin)" : "Excluir empresa"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] space-y-3">
          <Store className="w-12 h-12 text-[#A5B2A9] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#F5F5F0]">Nenhuma empresa encontrada</h3>
          <p className="text-xs text-[#A5B2A9] max-w-sm mx-auto">
            Não encontramos empresas nesta categoria ou estado. Seja o primeiro patriota a cadastrar sua empresa aqui!
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenCreateCompany}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#07140F] font-bold text-xs"
            >
              Cadastrar Minha Empresa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
