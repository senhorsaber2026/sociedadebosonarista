import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Award, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Flag,
  Copy
} from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface PatrioticManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onPledgeAffirmed?: () => void;
  onOpenAuth: () => void;
}

export const PatrioticManifestoModal: React.FC<PatrioticManifestoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPledgeAffirmed,
  onOpenAuth
}) => {
  const [hasAffirmed, setHasAffirmed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const manifestoText = `MANIFESTO CÍVICO — SOCIEDADE BOSONARISTA

"Brasil acima de tudo, Deus acima de todos!"

1. DEFESA DA SOBERANIA NACIONAL
Zelo absoluto pela integridade territorial, riqueza dos nossos recursos e autonomia da nação brasileira.

2. LIBERDADE DE PENSAMENTO E EXPRESSÃO
Nenhum brasileiro será cerceado em seu direito fundamental de manifestar sua fé, sua opinião e seus valores.

3. VALORIZAÇÃO DA FAMÍLIA E DOS VALORES CRISTÃOS
A instituição familiar é a coluna vertebral moral que sustenta a ordem e o futuro das próximas gerações.

4. RESPEITO AO TRABALHADOR E AO AGRONEGÓCIO
Reconhecimento inequívoco dos produtores que alimentam nosso país e o mundo com trabalho digno no campo e na cidade.

5. SEGURANÇA PÚBLICA E ORDEM CONSTITUCIONAL
Apoio integral aos agentes de segurança e combate implacável à criminalidade que ameaça a paz dos lares brasileiros.`;

  const handleCopyManifesto = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(manifestoText);
        setIsCopied(true);
        showToast('Manifesto Patriótico copiado com sucesso!');
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      showToast('Texto preparado para cópia!');
    }
  };

  const handleAffirmPledge = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!hasAffirmed) {
      storageService.addHonorPoints(currentUser.id, 25, 'Compromisso cívico com a Pátria firmado');
      setHasAffirmed(true);
      showToast('Compromisso firmado com honra! +25 Pontos de Carreira atribuídos.');
      if (onPledgeAffirmed) onPledgeAffirmed();
    }
  };

  const handlePlayFanfare = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 brass fanfare chords
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.45);
      });
      showToast('Hino tocado com orgulho patriótico! 🇧🇷');
    } catch (e) {
      showToast('Voz da Pátria ecoando! 🇧🇷');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#102019] border-2 border-[#D4AF37]/60 rounded-3xl shadow-[0_0_35px_rgba(212,175,55,0.25)] overflow-hidden my-auto flex flex-col">
        
        {/* HERO IMAGE HEADER */}
        <div className="relative h-44 overflow-hidden bg-[#07140F]">
          <img
            src="/src/assets/images/brasil_bandeira_card_1793411895078.jpg"
            alt="Bandeira Nacional"
            className="w-full h-full object-cover filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102019] via-transparent to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-[#F5F5F0] flex items-center justify-center transition border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5AC24] px-2 py-0.5 rounded bg-[#174D32] border border-[#D4AF37]/30">
              MANIFESTO DA COMUNIDADE
            </span>
            <h2 className="font-serif-patriotic text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D0] via-[#E5AC24] to-[#C99818] uppercase tracking-wide drop-shadow-md mt-1">
              JUNTOS POR UM BRASIL AINDA MELHOR
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Motto Banner */}
          <div className="p-3 bg-[#15291F] rounded-2xl border border-[#D4AF37]/40 text-center">
            <h3 className="font-serif-patriotic font-bold text-sm sm:text-base text-[#E8CC76]">
              "BRASIL ACIMA DE TUDO, DEUS ACIMA DE TODOS!"
            </h3>
            <p className="text-[11px] text-[#A5B2A9] mt-0.5">
              Princípio fundamental de união, fé, justiça e respeito à nossa gente.
            </p>
          </div>

          {/* Pillars List */}
          <div className="space-y-2.5 text-xs text-[#F5F5F0]">
            <div className="p-3 rounded-xl bg-[#0b1712] border border-[#263B30] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E5AC24] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#E8CC76] block mb-0.5">1. Defesa da Soberania Nacional</strong>
                Zelo irrestrito pelas fronteiras, recursos estratégicos e independência de nossa nação.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b1712] border border-[#263B30] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E5AC24] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#E8CC76] block mb-0.5">2. Liberdade de Pensamento e Expressão</strong>
                Garantia constitucional para o cidadão opinar, debater e manifestar seus valores com segurança.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b1712] border border-[#263B30] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E5AC24] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#E8CC76] block mb-0.5">3. Família e Tradições</strong>
                Preservação da estrutura familiar e dos valores éticos e cristãos herdados com honra.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b1712] border border-[#263B30] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E5AC24] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#E8CC76] block mb-0.5">4. Valorização do Agronegócio e do Trabalho</strong>
                Reconhecimento aos que produzem, geram riqueza e levam o nome do Brasil ao topo do mundo.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-[#0b1712] border-t border-[#263B30] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayFanfare}
              className="p-2 rounded-xl bg-[#15291F] hover:bg-[#1f3d2e] text-[#E8CC76] border border-[#263B30] transition flex items-center gap-1.5 text-xs font-semibold"
              title="Tocar Fanfarra Patriótica"
            >
              <Volume2 className="w-4 h-4 text-[#E5AC24]" />
              <span className="hidden sm:inline">Toque Cívico</span>
            </button>

            <button
              onClick={handleCopyManifesto}
              className="p-2 rounded-xl bg-[#15291F] hover:bg-[#1f3d2e] text-[#F5F5F0] border border-[#263B30] transition flex items-center gap-1.5 text-xs font-semibold"
              title="Copiar texto do manifesto"
            >
              {isCopied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4 text-[#A5B2A9]" />}
              <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAffirmPledge}
              disabled={hasAffirmed}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                hasAffirmed
                  ? 'bg-[#15291F] text-[#22C55E] border border-[#22C55E]/40'
                  : 'bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 text-[#07140F] active:scale-95'
              }`}
            >
              {hasAffirmed ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Compromisso Cívico Firmado</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Firmar Compromisso (+25 pts)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
