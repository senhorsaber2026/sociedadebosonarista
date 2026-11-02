import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface CenterHeroBannerProps {
  currentUser?: User | null;
  onNavigate: (view: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
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
      subtitle: 'Uma comunidade patriota para debater, compartilhar e participar.',
      ctaText: currentUser ? 'Explorar Comunidades' : 'Faça Parte da Nossa Família',
      action: () => {
        if (currentUser) {
          onNavigate('groups');
        } else if (onOpenAuth) {
          onOpenAuth('register');
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
      ctaText: 'Ler Notícias em Destaque',
      action: () => onNavigate('news')
    },
    {
      id: 3,
      title: 'FORÇA DO AGRONEGÓCIO',
      subtitle: 'O alimento do mundo e o motor produtivo da nossa pátria verde e amarela.',
      ctaText: 'Ver Comunidades Rurais',
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
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#263B30] shadow-2xl mb-5 group select-none min-h-[220px] sm:min-h-[240px] md:min-h-[250px] bg-[#07140F] flex items-center">
      
      {/* BACKGROUND IMAGE WITH CINEMATIC LIGHTING */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/images/brasil_hero_banner_1793411883121.jpg"
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/images/brasil_bandeira_card_1793411895078.jpg';
          }}
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {/* Dark green & golden vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07140F]/95 via-[#07140F]/65 to-[#07140F]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07140F]/90 via-transparent to-black/40" />
      </div>

      {/* LEFT PORTRAIT CUTOUT OF BOLSONARO WITH BRAZILIAN FLAG EMBLEM */}
      <div className="absolute -left-2 sm:left-2 bottom-0 top-0 z-10 flex items-end pointer-events-none w-32 sm:w-44 md:w-52">
        <img
          src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png"
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/memorial/bolsonaro.jpg';
          }}
          className="h-full object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] opacity-95 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* CAROUSEL ARROW BUTTON - LEFT */}
      <button
        onClick={handlePrev}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F5F0] hover:text-[#D4AF37] border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer"
        title="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* CAROUSEL ARROW BUTTON - RIGHT */}
      <button
        onClick={handleNext}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F5F0] hover:text-[#D4AF37] border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer"
        title="Próximo slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* MAIN BANNER CONTENT (CENTER-RIGHT ALIGNED WITH CLEAR PADDING) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center pl-28 sm:pl-44 md:pl-56 pr-10 sm:pr-14 pt-4 pb-11">
        <h2 className="font-serif-patriotic text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D0] via-[#E5AC24] to-[#C99818] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-tight uppercase mb-1.5 max-w-xl">
          {active.title}
        </h2>

        <p className="text-xs sm:text-sm font-medium text-[#F5F5F0] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] mb-3.5 max-w-lg leading-relaxed">
          {active.subtitle}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {currentUser ? (
            <button
              onClick={active.action}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 text-[#07140F] font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Users className="w-4 h-4 fill-current" />
              <span>{active.ctaText}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('register') : onNavigate('register')}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 text-[#07140F] font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                title="Cadastre-se na Sociedade Bosonarista"
              >
                <ShieldCheck className="w-4 h-4 fill-current" />
                <span>Fazer Cadastro de Membro</span>
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : onNavigate('home')}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#07140F]/85 hover:bg-[#15291F] text-[#E8CC76] border border-[#D4AF37]/60 hover:border-[#D4AF37] font-extrabold text-xs sm:text-sm shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                title="Entrar na sua conta"
              >
                <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Já sou Membro</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* CAROUSEL PAGINATION DOTS (CLEAN BOTTOM PILL WITH ZERO OVERLAP) */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-[#263B30] shadow-md backdrop-blur-xs">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
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
