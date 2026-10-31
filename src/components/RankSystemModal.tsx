import React from 'react';
import { 
  X, 
  Award, 
  Shield, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  Users, 
  Newspaper, 
  Sparkles,
  Zap
} from 'lucide-react';
import { User, UserRank } from '../types';
import { RANK_DEFINITIONS, RANKS_ORDER, getNextRank, getPointsToNextRank } from '../services/rankService';
import { RankBadge } from './RankBadge';

interface RankSystemModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const RankSystemModal: React.FC<RankSystemModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const currentRank: UserRank = currentUser?.rank || 'soldado';
  const honorPoints = currentUser?.honorPoints || 0;
  const currentDef = RANK_DEFINITIONS[currentRank];
  const nextDef = getNextRank(currentRank);
  const { needed, percent } = getPointsToNextRank(honorPoints, currentRank);

  const missions = [
    { title: 'Publicar análises cívicas no Feed', points: '+25 Pontos de Honra', icon: Flame },
    { title: 'Defender argumentos em Debates Políticos', points: '+35 Pontos de Honra', icon: Award },
    { title: 'Receber curtidas de outros patriotas', points: '+5 Pontos por curtida', icon: Star },
    { title: 'Comentar com ponderação em postagens', points: '+10 Pontos de Honra', icon: Sparkles },
    { title: 'Fundar ou liderar uma Comunidade/Grupo', points: '+50 Pontos de Honra', icon: Users },
    { title: 'Participar e votar em Enquetes Populares', points: '+10 Pontos de Honra', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#102019] border border-[#D4AF37]/50 rounded-3xl shadow-2xl overflow-hidden my-auto animate-fade-in max-h-[92vh] flex flex-col">
        
        {/* TOP BAR */}
        <div className="p-4 sm:p-5 border-b border-[#263B30] bg-[#0b1712] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#174D32] border border-[#D4AF37]/50 text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-patriotic text-base sm:text-lg font-bold text-[#F5F5F0]">
                Plano de Carreira Cívica & Patentes Militares
              </h2>
              <p className="text-xs text-[#A5B2A9]">
                Hierarquia cívica, insígnias de honra e critérios de promoção patriótica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT SCROLL */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* USER CURRENT PROGRESS CARD */}
          {currentUser ? (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#15291F] via-[#102019] to-[#0d1a14] border border-[#D4AF37]/40 shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <RankBadge rank={currentRank} size="xs" showTitle={false} />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#A5B2A9]">Seu Posto Atual na Comunidade:</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h3 className="font-serif-patriotic text-lg sm:text-xl font-bold text-[#F5F5F0]">
                        {currentDef.title}
                      </h3>
                      <RankBadge rank={currentRank} size="sm" />
                    </div>
                    <div className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                      Nível {currentDef.level} de 8 • {honorPoints.toLocaleString('pt-BR')} Pontos de Honra Patriótica
                    </div>
                  </div>
                </div>

                {nextDef ? (
                  <div className="sm:text-right bg-[#07140F]/80 p-3 rounded-2xl border border-[#263B30] min-w-[200px]">
                    <div className="text-[10px] text-[#A5B2A9] uppercase font-bold tracking-wider">
                      Próxima Patente:
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                      <span className="font-bold text-xs text-[#E8CC76]">{nextDef.title}</span>
                      <RankBadge rank={nextDef.id} size="xs" />
                    </div>
                    <div className="text-[11px] text-[#A5B2A9] mt-1">
                      Faltam <strong>{needed.toLocaleString('pt-BR')}</strong> pontos
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#D4AF37]/20 border border-[#D4AF37] p-3 rounded-2xl text-xs font-bold text-[#E8CC76]">
                    👑 Patente Máxima Atingida!
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {nextDef && (
                <div className="mt-4 pt-3 border-t border-[#263B30]">
                  <div className="flex items-center justify-between text-xs text-[#A5B2A9] mb-1.5">
                    <span>Progresso para promoção ({percent}%)</span>
                    <span>{honorPoints} / {nextDef.minPoints} pts</span>
                  </div>
                  <div className="w-full h-3 bg-[#07140F] rounded-full overflow-hidden border border-[#263B30] p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#174D32] via-[#D4AF37] to-[#E8CC76] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-[#15291F] border border-[#263B30] text-center">
              <h3 className="font-bold text-sm text-[#F5F5F0] mb-1">
                Cadastre-se para Ingressar com a Patente de Soldado
              </h3>
              <p className="text-xs text-[#A5B2A9] mb-3">
                Todos os novos membros iniciam como Soldado Patriota e sobem na hierarquia por suas contribuições cívicas.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs shadow hover:brightness-110"
              >
                Criar Minha Conta e Alistar-se
              </button>
            </div>
          )}

          {/* MISSIONS: COMO GANHAR PONTOS */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span>Como Subir de Patente (Missões & Ações Cívicas)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {missions.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#15291F]/70 border border-[#263B30] flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#174D32] text-[#D4AF37] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F5F5F0] leading-snug">{m.title}</div>
                      <div className="text-[11px] font-bold text-[#E8CC76] mt-1">{m.points}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABLE OF ALL 8 RANKS */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Hierarquia Completa das Patentes & Insígnias</span>
            </h4>

            <div className="space-y-3">
              {RANKS_ORDER.map((rankId) => {
                const def = RANK_DEFINITIONS[rankId];
                const isCurrent = currentRank === rankId;

                return (
                  <div
                    key={rankId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[#15291F] border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/50'
                        : 'bg-[#102019] border-[#263B30] hover:border-[#2f493b]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={rankId} size="md" />
                        <div>
                          <span className="font-bold text-sm text-[#F5F5F0] flex items-center gap-2">
                            {def.title}
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#07140F] font-black uppercase">
                                Sua Patente
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-[#A5B2A9]">Nível {def.level} de 8</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-[#E8CC76] bg-[#07140F] px-3 py-1 rounded-xl border border-[#263B30]">
                        {def.minPoints === 0 ? 'Patente Inicial (0 pts)' : `${def.minPoints.toLocaleString('pt-BR')} Pontos de Honra`}
                      </div>
                    </div>

                    <p className="text-xs text-[#A5B2A9] leading-relaxed mb-3">
                      {def.description}
                    </p>

                    <div className="pt-2 border-t border-[#263B30]/50">
                      <span className="text-[10px] font-bold uppercase text-[#D4AF37] block mb-1">
                        Privilégios & Vantagens:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#F5F5F0]">
                        {def.privileges.map((priv, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>{priv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CITATION ON MERIT & HONOR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#174D32]/80 to-[#102019] border border-[#D4AF37]/40 text-xs">
            <h5 className="font-bold text-[#E8CC76] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Promoção por Bravura & Reconhecimento Cívico</span>
            </h5>
            <p className="text-[#A5B2A9] leading-relaxed">
              Além da pontuação automática por engajamento, a <strong>Administração Central</strong> pode condecorar e promover membros diretamente por mérito extraordinário em defesa da soberania nacional, grandes mobilizações ou projetos de relevância pública.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-[#263B30] bg-[#0b1712] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] text-[#F5F5F0] text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
