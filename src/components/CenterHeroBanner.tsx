import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { showToast } from './Toast';

import { User } from '../types';

interface CenterHeroBannerProps {
  currentUser?: User | null;
  onNavigate: (view: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth?: () => void;
}

export const CenterHeroBanner: React.FC<CenterHeroBannerProps> = ({
  currentUser,
  onNavigate,
  onOpenCreatePost,
  onOpenAuth
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'SOCIEDADE BOSONARISTA',
      subtitle: 'Uma comunidade para debater, compartilhar e participar.',
      ctaText: currentUser ? 'Explorar Comunidades' : 'Faça parte desta família',
      action: () => {
        if (currentUser) {
          onNavigate('groups');
        } else {
          onNavigate('register');
        }
      }
    },
    {
      id: 1,
      title: 'DEUS, PÁTRIA & FAMÍLIA',
      subtitle: 'A união dos patriotas em defesa da soberania e dos valores cristãos.',
      ctaText: 'Participar dos Debates',
      action: () => onNavigate('debates')
    },
    {
      id: 2,
      title: 'INFORMAÇÃO INDEPENDENTE',
      subtitle: 'Notícias diárias, análises e fatos com transparência e liberdade.',
      ctaText: 'Ler Destaques',
      action: () => onNavigate('news')
    },
    {
      id: 3,
      title: 'FORÇA DO AGRONEGÓCIO',
      subtitle: 'O alimento do mundo e o motor produtivo da nossa pátria verde e amarela.',
      ctaText: 'Explorar Comunidades',
      action: () => onNavigate('groups')
    }
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#263B30] shadow-2xl mb-5 group select-none h-44 sm:h-52 md:h-60 bg-[#07140F]">
      
      {/* BACKGROUND IMAGE WITH CINEMATIC LIGHTING */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/brasil_hero_banner_1793411883121.jpg"
          alt="Brasília ao pôr do sol com o Congresso Nacional"
          className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {/* Dark green & golden vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07140F]/90 via-[#07140F]/45 to-[#07140F]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07140F] via-transparent to-black/30" />
      </div>

      {/* LEFT PORTRAIT CUTOUT OF BOLSONARO WITH BRAZILIAN FLAG EMBLEM */}
      <div className="absolute -left-2 sm:left-4 bottom-0 top-0 z-10 flex items-end pointer-events-none w-44 sm:w-56 md:w-64">
        <img
          src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png"
          alt="Retrato Patriótico"
          className="h-full object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] opacity-95 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* CAROUSEL ARROW BUTTON - LEFT */}
      <button
        onClick={handlePrev}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F5F0] hover:text-[#D4AF37] border border-white/20 flex items-center justify-center transition active:scale-90"
        title="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* CAROUSEL ARROW BUTTON - RIGHT */}
      <button
        onClick={handleNext}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F5F0] hover:text-[#D4AF37] border border-white/20 flex items-center justify-center transition active:scale-90"
        title="Próximo slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* MAIN BANNER CONTENT (CENTER-RIGHT ALIGNED EXACTLY AS IN THE MOCK) */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center pl-24 sm:pl-36 md:pl-44 pr-8 sm:pr-12">
        <h1 className="font-serif-patriotic text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D0] via-[#E5AC24] to-[#C99818] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-tight uppercase mb-1 sm:mb-1.5">
          {active.title}
        </h1>

        <p className="text-xs sm:text-sm md:text-base font-medium text-[#F5F5F0] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] mb-3 sm:mb-4 max-w-lg line-clamp-2">
          {active.subtitle}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={active.action}
            className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 text-[#07140F] font-extrabold text-xs sm:text-sm shadow-[0_4px_16px_rgba(229,172,36,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Users className="w-4 h-4 fill-current" />
            <span>{active.ctaText}</span>
          </button>

          <button
            onClick={() => onOpenAuth ? onOpenAuth('register') : onNavigate('register')}
            className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#07140F]/85 hover:bg-[#15291F] text-[#E8CC76] border border-[#D4AF37]/70 hover:border-[#D4AF37] font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Cadastrar com Google, WhatsApp, Instagram ou CPF"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Fazer Cadastro Real</span>
          </button>
        </div>
      </div>

      {/* CAROUSEL PAGINATION DOTS */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === idx
                ? 'w-6 h-1.5 bg-[#E5AC24]'
                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
