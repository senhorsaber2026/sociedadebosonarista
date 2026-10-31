import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Search, 
  Check, 
  CheckCheck, 
  User as UserIcon,
  Shield,
  X,
  ArrowLeft,
  Smile,
  ExternalLink
} from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface MessagesViewProps {
  currentUser: User | null;
  initialRecipientId?: string;
  onOpenAuth: () => void;
  onRefresh: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  initialRecipientId,
  onOpenAuth,
  onRefresh
}) => {
  if (!currentUser) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#102019] border border-[#263B30] shadow-xl">
        <MessageSquare className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <h3 className="font-serif-patriotic text-lg font-bold text-[#F5F5F0]">
          Mensagens Privadas Criptografadas
        </h3>
        <p className="text-xs text-[#A5B2A9] max-w-md mx-auto mt-2 mb-4">
          Conecte-se diretamente com outros membros e lideranças da comunidade em um canal direto e seguro.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs rounded-xl shadow transition hover:brightness-110 cursor-pointer"
        >
          Entrar para Acessar Mensagens
        </button>
      </div>
    );
  }

  const allUsers = storageService.getUsers().filter(u => u.id !== currentUser.id);
  
  // Set default recipient to initialRecipientId, or first user
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(() => {
    if (initialRecipientId && allUsers.some(u => u.id === initialRecipientId)) {
      return initialRecipientId;
    }
    return allUsers[0]?.id || '';
  });

  // Mobile state: 'list' (viewing contacts) or 'chat' (viewing conversation)
  const [mobilePane, setMobilePane] = useState<'list' | 'chat'>('list');

  const [messageInput, setMessageInput] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaField, setShowMediaField] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const selectedUser = allUsers.find(u => u.id === selectedRecipientId);
  const userMessages = storageService.getMessagesForUser(currentUser.id);

  // Update recipient if initialRecipientId changes
  useEffect(() => {
    if (initialRecipientId && allUsers.some(u => u.id === initialRecipientId)) {
      setSelectedRecipientId(initialRecipientId);
      setMobilePane('chat');
    }
  }, [initialRecipientId]);

  // Mark conversation read on select
  useEffect(() => {
    if (selectedRecipientId) {
      storageService.markConversationRead(currentUser.id, selectedRecipientId);
    }
  }, [selectedRecipientId, currentUser.id, userMessages.length]);

  // Messages between currentUser and selectedUser
  const conversationMessages = userMessages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedRecipientId) ||
    (m.senderId === selectedRecipientId && m.receiverId === currentUser.id)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, selectedRecipientId]);

  const handleSelectContact = (userId: string) => {
    setSelectedRecipientId(userId);
    setMobilePane('chat');
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 150);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRecipientId) return;

    storageService.sendMessage(
      currentUser.id, 
      selectedRecipientId, 
      messageInput.trim(), 
      mediaUrlInput.trim() || undefined
    );

    setMessageInput('');
    setMediaUrlInput('');
    setShowMediaField(false);
    setShowEmojis(false);
    onRefresh();

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInsertEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    chatInputRef.current?.focus();
  };

  const filteredContacts = allUsers.filter(u => 
    u.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const QUICK_EMOJIS = ['🇧🇷', '💚', '💛', '👍', '🤝', '👏', '⭐', '🕊️'];

  return (
    <div className="bg-[#102019] rounded-3xl border border-[#263B30] overflow-hidden shadow-2xl h-[calc(100vh-7.5rem)] md:h-[660px] max-h-[800px] min-h-[500px] flex flex-col md:flex-row relative">
      
      {/* LEFT PANE: CONTACTS & CHAT LIST */}
      <div className={`w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#263B30] flex flex-col bg-[#0b1712] ${
        mobilePane === 'chat' ? 'hidden md:flex' : 'flex'
      } h-full`}>
        
        {/* Top search & header */}
        <div className="p-3 border-b border-[#263B30] shrink-0 bg-[#07140F]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#E5AC24]" />
              <span className="font-serif-patriotic text-xs font-bold text-[#F5F5F0]">
                Conversas Privadas
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#174D32] text-[#E8CC76] font-bold">
              {filteredContacts.length} contatos
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A5B2A9]" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Buscar por nome ou usuário..."
              className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-8 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition shadow-inner"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#263B30]/40">
          {filteredContacts.map(user => {
            const isSelected = user.id === selectedRecipientId;
            const lastMsg = userMessages.filter(m => 
              (m.senderId === currentUser.id && m.receiverId === user.id) ||
              (m.senderId === user.id && m.receiverId === currentUser.id)
            ).pop();

            const unread = userMessages.some(m => m.senderId === user.id && m.receiverId === currentUser.id && !m.read);

            return (
              <div
                key={user.id}
                onClick={() => handleSelectContact(user.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer transition select-none ${
                  isSelected ? 'bg-[#15291F] border-l-4 border-[#D4AF37]' : 'hover:bg-[#13241b]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#263B30]"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#102019]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#F5F5F0] truncate flex items-center gap-1">
                      {user.name}
                      {user.role === 'admin' && <Shield className="w-3 h-3 text-[#D4AF37]" />}
                    </h5>
                    {lastMsg && (
                      <span className="text-[10px] text-[#A5B2A9] shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#A5B2A9] truncate mt-0.5">
                    {lastMsg ? lastMsg.content : `@${user.username}`}
                  </p>
                </div>

                {unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5AC24] shadow-[0_0_8px_rgba(229,172,36,0.6)] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-[#102019] h-full ${
        mobilePane === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedUser ? (
          <>
            {/* Chat header (Always pinned at top, shrink-0) */}
            <div className="p-3 sm:p-3.5 border-b border-[#263B30] flex items-center justify-between bg-[#0b1712] shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-2.5">
                {/* Back button for mobile */}
                <button
                  onClick={() => setMobilePane('list')}
                  className="md:hidden p-1.5 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
                  title="Voltar aos contatos"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F0] flex items-center gap-1.5 truncate">
                    {selectedUser.name}
                    {selectedUser.role === 'admin' && (
                      <span className="text-[9px] px-1.5 bg-[#D4AF37] text-[#07140F] font-bold rounded">
                        ADMIN
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-[#22C55E] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span>Online agora</span>
                    <span className="text-[#A5B2A9]"> • @{selectedUser.username}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#A5B2A9] hidden sm:inline px-2 py-1 rounded-lg bg-[#15291F]">
                  Canal Criptografado 🔒
                </span>
              </div>
            </div>

            {/* Messages scroll body (flex-1 min-h-0 allows smooth scroll without cutting footer) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#07140F]/40">
              {conversationMessages.length > 0 ? (
                conversationMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-[#174D32] text-[#F5F5F0] border border-[#D4AF37]/40 rounded-br-xs'
                            : 'bg-[#15291F] text-[#F5F5F0] border border-[#263B30] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {msg.mediaUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden max-h-48 border border-black/30">
                            <img 
                              src={msg.mediaUrl} 
                              alt="Anexo" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] text-[#A5B2A9] mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <CheckCheck className="w-3 h-3 text-[#E5AC24]" />}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-[#A5B2A9] px-4">
                  <div className="w-12 h-12 rounded-full bg-[#15291F] border border-[#263B30] flex items-center justify-center mx-auto mb-2 text-[#E5AC24]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p>Início de conversa com <strong>{selectedUser.name}</strong>.</p>
                  <p className="text-[11px] text-[#A5B2A9]/70 mt-1">
                    Envie uma mensagem patriótica para começar o diálogo!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Media input drawer */}
            {showMediaField && (
              <div className="p-2.5 border-t border-[#263B30] bg-[#15291F] flex items-center gap-2 shrink-0 animate-fade-in">
                <input
                  type="url"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="Cole o link da imagem (JPG, PNG, GIF)..."
                  className="flex-1 bg-[#102019] text-xs text-[#F5F5F0] px-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaField(false);
                    setMediaUrlInput('');
                  }}
                  className="p-1.5 text-[#A5B2A9] hover:text-[#D94B4B] rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Emojis strip */}
            {showEmojis && (
              <div className="px-3 py-1.5 bg-[#0b1712] border-t border-[#263B30] flex items-center gap-2 overflow-x-auto shrink-0 animate-fade-in">
                <span className="text-[10px] text-[#A5B2A9] shrink-0 font-semibold">Reações:</span>
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleInsertEmoji(em)}
                    className="p-1 hover:scale-125 transition text-sm cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* WRITING INPUT AREA: FIRMLY PINNED AT BOTTOM WITH shrink-0 */}
            <div className="border-t border-[#263B30] bg-[#0b1712] p-2.5 sm:p-3 shrink-0 sticky bottom-0 z-20 shadow-lg">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Emoji toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    showEmojis ? 'bg-[#174D32] border-[#D4AF37] text-[#E8CC76]' : 'text-[#A5B2A9] border-[#263B30] hover:text-[#F5F5F0]'
                  }`}
                  title="Inserir Emojis"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Attach image toggle */}
                <button
                  type="button"
                  onClick={() => setShowMediaField(!showMediaField)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    showMediaField ? 'bg-[#174D32] border-[#D4AF37] text-[#E8CC76]' : 'text-[#A5B2A9] border-[#263B30] hover:text-[#F5F5F0]'
                  }`}
                  title="Anexar link de imagem"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Main text input */}
                <input
                  ref={chatInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Mensagem para @${selectedUser.username}...`}
                  className="flex-1 bg-[#15291F] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] px-3.5 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition shadow-inner"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] text-[#07140F] font-extrabold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 transition active:scale-95 cursor-pointer hover:brightness-110 shrink-0"
                  title="Enviar mensagem (Enter)"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#A5B2A9]">
            <MessageSquare className="w-10 h-10 text-[#263B30] mb-2" />
            <p className="font-semibold text-[#F5F5F0]">Nenhuma conversa selecionada</p>
            <p className="text-[11px] mt-1">Selecione um contato na lista à esquerda para conversar.</p>
          </div>
        )}
      </div>

    </div>
  );
};
