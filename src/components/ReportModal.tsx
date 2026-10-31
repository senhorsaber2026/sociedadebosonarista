import React, { useState } from 'react';
import { Flag, X, AlertCircle } from 'lucide-react';
import { User, ReportReason } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface ReportModalProps {
  isOpen: boolean;
  item: any; // Post, comment, user, etc.
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

const REPORT_REASONS: ReportReason[] = [
  'Spam',
  'Assédio',
  'Ameaça',
  'Discurso de ódio',
  'Desinformação',
  'Conteúdo ilegal',
  'Violação de privacidade',
  'Outro'
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  item,
  currentUser,
  onClose,
  onOpenAuth
}) => {
  const [reason, setReason] = useState<ReportReason>('Spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    storageService.createReport({
      reporter: currentUser,
      contentType: 'post',
      contentId: item.id || 'item',
      contentSnippet: item.content || item.title || 'Conteúdo reportado',
      reason,
      details: details.trim() || undefined
    });

    setIsSubmitting(false);
    showToast('Denúncia enviada à Moderação da Sociedade Bosonarista para análise.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#263B30] mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5F0]">
            <Flag className="w-4 h-4 text-[#D94B4B]" />
            <span>Denunciar Conteúdo à Moderação</span>
          </div>
          <button onClick={onClose} className="text-[#A5B2A9] hover:text-[#F5F5F0]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#15291F] border border-[#263B30] text-xs text-[#A5B2A9]">
            <span className="font-semibold text-[#F5F5F0] block mb-1">Item a ser denunciado:</span>
            <p className="line-clamp-2 italic">"{item.content || item.title || 'Publicação'}"</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
              Motivo Principal da Denúncia *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              {REPORT_REASONS.map(r => (
                <option key={r} value={r} className="bg-[#102019] text-[#F5F5F0]">{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
              Detalhes Adicionais (Opcional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descreva por que este conteúdo viola as regras de convivência da comunidade..."
              className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#263B30]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#15291F] text-xs text-[#F5F5F0]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#D94B4B] hover:bg-[#b03535] text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              Enviar Denúncia
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
