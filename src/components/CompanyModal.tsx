import React, { useState } from 'react';
import {
  X,
  Store,
  Building2,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Tag,
  CheckCircle2,
  Upload,
  Sparkles
} from 'lucide-react';
import { Company, User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCompanyCreated: () => void;
  onOpenAuth: () => void;
}

const CATEGORIES = [
  'Agropecuária',
  'Alimentação & Gastronomia',
  'Comércio & Varejo',
  'Serviços & Consultoria',
  'Construção & Reformas',
  'Tecnologia & Inovação',
  'Moda & Vestuário',
  'Saúde & Bem-estar',
  'Educação & Cursos',
  'Veículos & Autopeças',
  'Outros Segmentos'
];

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCompanyCreated,
  onOpenAuth
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [specialOffer, setSpecialOffer] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-[#0a1812] border border-[#263B30] rounded-3xl p-6 text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#A5B2A9] hover:text-[#F5F5F0] rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-[#174D32] flex items-center justify-center mx-auto text-[#D4AF37]">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#F5F5F0]">Cadastre sua Empresa</h3>
          <p className="text-xs text-[#A5B2A9] leading-relaxed">
            Para cadastrar e divulgar seu empreendimento na Vitrine Patriota, você precisa estar conectado com a sua conta de membro.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs"
            >
              Fazer Login ou Cadastrar-se
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#15291F] text-[#A5B2A9] text-xs font-semibold hover:text-[#F5F5F0]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor, informe o nome da sua empresa.');
      return;
    }
    if (!description.trim()) {
      showToast('Por favor, informe uma descrição sobre a sua empresa.');
      return;
    }
    if (!city.trim()) {
      showToast('Por favor, informe a cidade da sua empresa.');
      return;
    }

    setIsSubmitting(true);
    try {
      storageService.addCompany(
        {
          name: name.trim(),
          category,
          description: description.trim(),
          city: city.trim(),
          state,
          whatsapp: whatsapp.replace(/\D/g, ''),
          phone: phone.trim(),
          website: website.trim(),
          instagram: instagram.trim(),
          specialOffer: specialOffer.trim(),
          logoUrl: logoUrl.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          ownerUsername: currentUser.username,
          ownerAvatar: currentUser.avatar,
          verified: true
        },
        currentUser
      );

      showToast('🎉 Sua empresa foi cadastrada com sucesso na Vitrine Patriota!');
      onCompanyCreated();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a1812] border-2 border-[#D4AF37]/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-[#F5F5F0] my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pr-6 pb-2 border-b border-[#263B30]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-[11px] font-extrabold uppercase">
            <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
            Vitrine Empresarial Patriota
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F0] font-serif-patriotic tracking-tight">
            Divulgue Sua Empresa ou Negócio
          </h2>
          <p className="text-xs text-[#A5B2A9] max-w-lg mx-auto leading-relaxed">
            Fortaleça a livre iniciativa e conecte seus produtos e serviços a milhares de patriotas em todo o Brasil. Compre do patriota!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Row 1: Company Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1">
                Nome da Empresa / Comércio *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: AgroForte Insumos Rurais"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1">
                Ramo de Atuação / Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-[#E8CC76] block mb-1">
              Descrição do Negócio (Serviços, diferenciais, compromisso cívico) *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que sua empresa oferece, diferenciais, tempo de atuação no mercado e como atende os clientes..."
              className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Goiânia, Curitiba, Ribeirão Preto"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1">
                Estado (UF) *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              >
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact: WhatsApp & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#34A853]" />
                <span>WhatsApp de Atendimento (com DDD):</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11999998888"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>Instagram Comercial:</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex: @minhaempresa"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Website & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Site ou Loja Virtual:</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://meusite.com.br"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#E8CC76] block mb-1 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Foto de Capa / Logotipo (URL da imagem):</span>
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... (ou deixe vazio para foto padrão)"
                className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Special discount / benefit for members */}
          <div>
            <label className="text-[11px] font-bold text-[#E8CC76] block mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Benefício ou Desconto Exclusivo para Membros da Sociedade Bosonarista:</span>
            </label>
            <input
              type="text"
              value={specialOffer}
              onChange={(e) => setSpecialOffer(e.target.value)}
              placeholder="Ex: 10% de desconto para patriotas / Frete grátis com o cupom PATRIOTA"
              className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#D4AF37]/40 text-xs text-[#E8CC76] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#15291F] text-[#A5B2A9] text-xs font-bold hover:text-[#F5F5F0] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] text-[#07140F] font-black text-xs shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#07140F]" />
              <span>Publicar Minha Empresa na Vitrine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
