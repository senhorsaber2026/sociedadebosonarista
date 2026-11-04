import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  User as UserIcon,
  AlertCircle,
  Shield,
  Clock,
  Trash2,
  Flag,
  Video,
} from 'lucide-react';
import { User } from '../types';
import { showToast } from './Toast';
import { storageService } from '../services/storageService';

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface LiveChatProps {
  session: any;
  currentUser: User | null;
  visitorId?: string;
  messages: any[];
  onSend: (e: React.FormEvent) => void;
  onReport: (messageId: string, reason: string) => void;
  isHost: boolean;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  session,
  currentUser,
  visitorId,
  messages,
  onSend,
  onReport,
  isHost,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportedMessage, setReportedMessage] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const REASONS = ['Spam', 'Assédio', 'Ameaça', 'Discurso de ódio', 'Desinformação', 'Conteúdo ilegal', 'Outro'];

  const isAdminOrMod = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  const handleDeleteMessage = async (messageId: string) => {
    if (!isAdminOrMod) return;
    if (!confirm('Deseja realmente excluir esta mensagem?')) return;
    try {
      await fetch(`${API_BASE}/api/live-chat/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          moderatorUserId: currentUser!.id,
          liveSessionId: session?.id,
        }),
      });
      showToast('Mensagem excluída.');
    } catch (e) {
      console.error('Erro ao excluir:', e);
      showToast('Erro ao excluir mensagem.', 'error');
    }
  };

  const handleBlockParticipant = async (identity: string) => {
    if (!isAdminOrMod) return;
    if (!confirm(`Bloquear participante ${identity}?`)) return;
    try {
      await fetch(`${API_BASE}/api/live-sessions/${session?.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIdentity: identity,
          action: 'block',
          reason: 'Violação das regras da transmissão',
          moderatorUserId: currentUser!.id,
        }),
      });
      showToast('Participante bloqueado.');
    } catch (e) {
      console.error('Erro ao bloquear:', e);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(e);
  };

  const isSystemMessage = (msg: any) => msg.messageType === 'system';
  const isHostMessage = (msg: any) => msg.senderUserId === session?.hostUserId;

  return (
    <div className="bg-[#102019] border border-[#263B30] rounded-3xl shadow-xl flex flex-col h-full">
      <div className="p-4 border-b border-[#263B30] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-bold text-[#F5F5F0]">Chat ao Vivo</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
          {messages.length} mensagens
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-[11px] text-[#A5B2A9]">
            <div className="w-10 h-10 rounded-full bg-[#15291F] border border-[#263B30] flex items-center justify-center mx-auto mb-3 text-[#A5B2A9]">
              <Video className="w-5 h-5" />
            </div>
            <p>Bate-papo ao vivo. Seja o primeiro a comentar!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const deleted = msg.is_deleted;
            const showDelete = isAdminOrMod && !deleted;
            const showBlock = isAdminOrMod && msg.visitor_id && !deleted;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 animate-fade-in ${
                  isHostMessage(msg) ? 'border-l-2 border-[#D4AF37]/50 pl-2' : ''
                }`}
              >
                {!deleted && (
                  <>
                    <div className="w-6 h-6 rounded-full bg-[#174D32] flex items-center justify-center text-[10px] font-bold shrink-0 text-[#E8CC76]">
                      {msg.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-xs font-bold ${
                          isHostMessage(msg) ? 'text-[#D4AF37]' : 'text-[#F5F5F0]'
                        }`}>
                          {msg.display_name}
                        </span>
                        {isHostMessage(msg) && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                            APRESENTADOR
                          </span>
                        )}
                        {isSystemMessage(msg) && <span className="text-[9px] text-[#A5B2A9]/60 italic">sistema</span>}
                        <span className="text-[9px] text-[#A5B2A9]/60">{formatTime(msg.created_at)}</span>
                      </div>
                      <div className="text-[11px] text-[#F5F5F0] break-words leading-relaxed">
                        {deleted ? '[Mensagem removida]' : msg.message}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px]">
                        {showDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-[#D94B4B] hover:text-[#FF4D4D] underline hover:underline"
                            title="Excluir mensagem"
                          >
                            <Trash2 className="w-3 h-3" /> Excluir
                          </button>
                        )}
                        {showBlock && (
                          <button
                            onClick={() => handleBlockParticipant(msg.visitor_id)}
                            className="text-[#D94B4B] hover:text-[#FF4D4D] underline hover:underline"
                            title="Bloquear participante"
                          >
                            <Flag className="w-3 h-3" /> Bloquear
                          </button>
                        )}
                        {!currentUser && !msg.senderUserId && (
                          <button
                            onClick={() => {
                              setReportedMessage(msg.id);
                            }}
                            className="text-[#A5B2A9] hover:text-[#F5F5F0] underline hover:underline"
                            title="Denunciar"
                          >
                            <Flag className="w-3 h-3" /> Denunciar
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {deleted && (
                  <div className="flex items-center justify-center p-2 text-[10px] text-[#A5B2A9]/50 italic">
                    Mensagem removida pela moderação
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {reportedMessage && (
        <div className="p-3 border-t border-[#263B30] bg-[#0b1712]">
          <div className="mb-2">
            <label className="block text-[10px] text-[#A5B2A9] mb-1">Motivo da denúncia</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[#15291F] text-[11px] text-[#F5F5F0] px-2 py-1.5 rounded border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="">Selecione um motivo</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (reportReason && reportedMessage) {
                  onReport(reportedMessage, reportReason);
                  setReportedMessage(null);
                  setReportReason('');
                }
              }}
              disabled={!reportReason}
              className="flex-1 py-1.5 rounded bg-[#174D32] text-[11px] text-[#E8CC76] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f6643] transition"
            >
              Enviar Denúncia
            </button>
            <button
              onClick={() => setReportedMessage(null)}
              className="px-2 py-1.5 rounded bg-[#2a1414] text-[11px] text-[#D94B4B] hover:bg-[#3d1818] transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-[#263B30] p-3 bg-[#0b1712]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escreva uma mensagem..."
            disabled={!session || session.status !== 'live'}
            className={`flex-1 bg-[#15291F] text-[11px] text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none ${
              !session || session.status !== 'live' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || !session || session.status !== 'live' || isSubmitting}
            className="px-3 py-2 rounded-xl bg-[#174D32] text-[#E8CC76] font-bold text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f6643] transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        {!currentUser && !visitorId && (
          <p className="text-[10px] text-[#A5B2A9] mt-1 text-center">
            Conecte-se para participar do chat
          </p>
        )}
      </div>
    </div>
  );
};
