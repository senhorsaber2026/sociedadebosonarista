import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  QrCode,
  Copy,
  Check,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { User, UserRank } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';
import { RANK_DEFINITIONS, getNextRank } from '../services/rankService';
import { RankBadge } from './RankBadge';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onDonationSuccess: (updatedUser?: User) => void;
  onOpenAuth: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDonationSuccess,
  onOpenAuth
}) => {
  const PIX_KEY = '81119119200';
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    newRank: UserRank;
    rankTitle: string;
    amount: number;
  } | null>(null);

  if (!isOpen) return null;

  const currentRank = currentUser?.rank || 'soldado';
  const nextRankDef = getNextRank(currentRank);
  const projectedRank = nextRankDef ? nextRankDef.id : currentRank;
  const projectedRankTitle = nextRankDef ? nextRankDef.title : RANK_DEFINITIONS[currentRank].title;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    showToast('Chave PIX copiada: 81119119200');
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedFinalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleConfirmDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFinalAmount <= 0) {
      showToast('Por favor, selecione ou informe um valor válido para a doação.');
      return;
    }

    const finalName = donorName.trim() || currentUser?.name || 'Patriota Apoiador';

    setIsSubmitting(true);
    try {
      const res = storageService.createDonation({
        donorId: currentUser?.id,
        donorName: finalName,
        donorUsername: currentUser?.username,
        donorAvatar: currentUser?.avatar,
        amount: selectedFinalAmount,
        message: message.trim() || 'Em defesa da liberdade e soberania nacional!',
        pixKey: PIX_KEY
      });

      setCelebrationData({
        newRank: res.donation.newRank,
        rankTitle: res.newRankTitle || projectedRankTitle,
        amount: selectedFinalAmount
      });

      onDonationSuccess(res.updatedUser);
      showToast('🎖️ Doação voluntária confirmada com sucesso! Você subiu de patente!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar doação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0a1812] border-2 border-[#D4AF37]/60 rounded-3xl p-4 sm:p-6 shadow-2xl text-[#F5F5F0] my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        {celebrationData ? (
          /* CONGRATULATIONS / RANK PROMOTION CELEBRATION VIEW */
          <div className="text-center py-4 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#D4AF37] to-[#AA8325] p-1 shadow-2xl animate-bounce">
              <div className="w-full h-full rounded-[22px] bg-[#07140F] flex items-center justify-center text-[#E8CC76]">
                <Award className="w-10 h-10" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/50 text-[#E8CC76] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Doação Registrada com Honra
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F0] font-serif-patriotic">
              Parabéns, Patriota Benfeitor!
            </h2>

            <p className="text-xs sm:text-sm text-[#A5B2A9] max-w-md mx-auto leading-relaxed">
              Sua doação voluntária de <strong className="text-[#E8CC76]">R$ {celebrationData.amount.toFixed(2)}</strong> via PIX fortalece os servidores e a soberania da plataforma!
            </p>

            <div className="p-4 bg-[#102019] border border-[#D4AF37]/40 rounded-2xl max-w-md mx-auto space-y-2">
              <div className="text-xs text-[#A5B2A9]">Sua nova patente cívica condecorada:</div>
              <div className="flex items-center justify-center gap-2">
                <RankBadge rank={celebrationData.newRank} size="md" />
                <span className="text-sm font-extrabold text-[#E8CC76]">
                  {celebrationData.rankTitle}
                </span>
              </div>
              <div className="text-[11px] text-[#34A853] font-semibold flex items-center justify-center gap-1 pt-1">
                <Check className="w-3.5 h-3.5" />
                Seu nome está agora em destaque no Mural de Gratidão na tela inicial!
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] text-[#07140F] font-extrabold text-sm shadow-xl hover:brightness-110 active:scale-98 transition"
              >
                Concluir & Ver Meu Destaque na Tela Inicial
              </button>
            </div>
          </div>
        ) : (
          /* DONATION FORM VIEW */
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-1.5 pr-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/50 text-[#E8CC76] text-[11px] font-bold">
                <HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />
                Doação Voluntária • Apoio Cívico Soberano
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F0] font-serif-patriotic tracking-tight">
                Apoie a Sociedade Bosonarista
              </h2>
              <p className="text-xs text-[#A5B2A9] leading-relaxed">
                Nossa rede é 100% independente, mantida por cidadãos livres. Qualquer contribuição via PIX nos ajuda a custear servidores de alta velocidade, segurança e novos recursos!
              </p>
            </div>

            {/* RANK UPGRADE HIGHLIGHT PROMISE */}
            <div className="p-3.5 bg-gradient-to-r from-[#102019] via-[#153424] to-[#102019] border border-[#D4AF37]/40 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#E8CC76] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                  <span>🎖️ Quem Doa Sobe de Patente Imediatamente!</span>
                </div>
                <div className="text-[11px] text-[#A5B2A9] mt-0.5">
                  {currentUser ? (
                    <span>
                      Você subirá de <strong className="text-[#F5F5F0]">{RANK_DEFINITIONS[currentRank]?.title}</strong> para <strong className="text-[#E8CC76]">{projectedRankTitle}</strong> e terá seu nome imortalizado no Mural da Tela Inicial.
                    </span>
                  ) : (
                    <span>
                      Patriotas doadores ganham condecoração de patente e lugar de honra no Mural de Gratidão na tela inicial.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PIX QR CODE SECTION - only QR code, no CPF visible */}
            <div className="bg-[#0e1d16] border border-[#263B30] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code centered */}
              <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0 shrink-0">
                <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center border-2 border-[#D4AF37]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=81119119200`}
                    alt="QR Code Pix - Escaneie para apoiar"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <QrCode className="w-3 h-3" /> Escaneie para apoiar via PIX
                  </span>
                </div>
              </div>

              {/* Instructions & Copy key */}
              <div className="flex-1 w-full space-y-2">
                <div className="text-[11px] text-[#A5B2A9] space-y-1.5 leading-relaxed bg-[#07140F]/60 p-3 rounded-xl border border-[#263B30]">
                  <div className="flex items-center gap-1.5 text-[#E8CC76] font-semibold">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Como doar:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Abra o app do seu banco.</li>
                    <li>Escolha <strong>PIX &gt; Ler QR Code</strong> e aponte a câmera.</li>
                    <li>Confirme o valor e finalize o apoio!</li>
                  </ol>
                </div>

                {/* Copy PIX key button */}
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                    copied
                      ? 'bg-[#34A853] text-[#F5F5F0]'
                      : 'bg-[#15291F] border border-[#D4AF37]/40 text-[#E8CC76] hover:bg-[#1f3d28]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Chave PIX Copiada!' : 'Copiar Chave PIX (sem QR Code)'}</span>
                </button>
              </div>
            </div>

            {/* CONFIRMATION FORM */}
            <form onSubmit={handleConfirmDonation} className="space-y-3.5 pt-1">
              {/* Quick Values Selector */}
              <div>
                <label className="text-xs font-bold text-[#E8CC76] block mb-1.5">
                  Valor da sua contribuição voluntária:
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[10, 25, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-extrabold transition border ${
                        amount === val && !customAmount
                          ? 'bg-[#D4AF37] text-[#07140F] border-[#D4AF37] shadow-md scale-102'
                          : 'bg-[#102019] text-[#A5B2A9] border-[#263B30] hover:text-[#F5F5F0]'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-[#A5B2A9] whitespace-nowrap">Ou outro valor (R$):</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Donor Name & Support Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#A5B2A9] block mb-1">
                    Seu Nome / Como quer aparecer no Mural:
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Ex: Coronel Carlos / Maria Silveira"
                    className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#A5B2A9] block mb-1">
                    Mensagem cívica de agradecimento:
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ex: Deus, Pátria e Família! Força patriotas!"
                    className="w-full px-3 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {!currentUser && (
                <div className="p-2.5 rounded-xl bg-[#15291F] border border-[#D4AF37]/30 text-xs text-[#E8CC76] flex items-center justify-between">
                  <span>Quer vincular essa promoção à sua conta de membro?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="underline font-bold text-[#F5F5F0] hover:text-[#D4AF37]"
                  >
                    Entrar ou Cadastrar
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8CC76] to-[#AA8325] text-[#07140F] font-black text-sm shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-[#07140F]" />
                <span>
                  Confirmar Apoio PIX (R$ {selectedFinalAmount.toFixed(2)}) & Subir de Patente
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
