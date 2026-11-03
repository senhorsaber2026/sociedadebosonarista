import React from 'react';
import { Home, Compass, PlusCircle, Flame, User as UserIcon, ShieldCheck, Video } from 'lucide-react';
import { User } from '../types';

interface MobileNavProps {
  currentView: string;
  currentUser: User | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  currentUser,
  onNavigate,
  onOpenCreatePost,
  onOpenAuth
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07140F]/95 backdrop-blur-md border-t border-[#263B30] px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 transition ${
          currentView === 'home' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Início</span>
      </button>

      <button
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center gap-1 transition ${
          currentView === 'explore' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Explorar</span>
      </button>

      {/* Center Create Post button */}
      <button
        onClick={() => {
          if (!currentUser) onOpenAuth();
          else onOpenCreatePost();
        }}
        className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg active:scale-95 transition"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button
        onClick={() => onNavigate('debates')}
        className={`flex flex-col items-center gap-1 transition ${
          currentView === 'debates' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Debates</span>
      </button>

      <button
        onClick={() => onNavigate('live')}
        className={`flex flex-col items-center gap-1 transition ${
          currentView === 'live' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
        }`}
      >
        <Video className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Lives</span>
      </button>

      <button
        onClick={() => onNavigate('register')}
        className={`flex flex-col items-center gap-1 transition ${
          currentView === 'register' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
        <span className="text-[10px] font-semibold text-[#E8CC76]">Cadastro</span>
      </button>

      {currentUser && (
        <button
          onClick={() => onNavigate('profile', currentUser.username)}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'profile' ? 'text-[#D4AF37]' : 'text-[#A5B2A9]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Perfil</span>
        </button>
      )}
    </nav>
  );
};
