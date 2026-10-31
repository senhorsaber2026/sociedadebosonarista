import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  BarChart2, 
  Send, 
  X, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { User, Post } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface CreatePostCardProps {
  currentUser: User | null;
  onPostCreated: (post: Post) => void;
  onOpenAuth: () => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  currentUser,
  onPostCreated,
  onOpenAuth
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Brasil');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="mb-4 p-4 rounded-2xl bg-[#102019] border border-[#263B30] text-center">
        <p className="text-xs text-[#A5B2A9] mb-2">
          Faça parte da comunidade para publicar fotos, vídeos e enquetes.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-4 py-2 bg-gradient-to-r from-[#E5AC24] to-[#C99818] text-[#07140F] font-bold text-xs rounded-xl shadow transition hover:brightness-110"
        >
          Entre ou Cadastre-se para Publicar
        </button>
      </div>
    );
  }

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handlePollChange = (text: string, idx: number) => {
    const updated = [...pollOptions];
    updated[idx] = text;
    setPollOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Por favor, escreva o texto da sua publicação.');
      return;
    }

    if (showPollCreator) {
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        setError('A enquete precisa de no mínimo duas alternativas preenchidas.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const newPost = storageService.createPost({
        author: currentUser,
        content: content.trim(),
        category,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType,
        pollOptions: showPollCreator ? pollOptions.filter(o => o.trim()) : undefined
      });

      setContent('');
      setMediaUrl('');
      setShowMediaInput(false);
      setShowPollCreator(false);
      setPollOptions(['', '']);
      showToast('Publicação compartilhada com sucesso com a comunidade!');
      onPostCreated(newPost);
    } catch (err) {
      setError('Erro ao salvar publicação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      {/* SECTION HEADER: COMUNIDADE EM DESTAQUE */}
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <MessageSquare className="w-4 h-4 text-[#E5AC24] fill-[#E5AC24]" />
        <h2 className="text-xs sm:text-sm font-extrabold text-[#E5AC24] tracking-wider uppercase font-serif-patriotic">
          COMUNIDADE EM DESTAQUE
        </h2>
      </div>

      {/* POST COMPOSER BOX MATCHING MOCKUP */}
      <div className="bg-[#102019] rounded-2xl border border-[#263B30] p-3 sm:p-4 shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Top Row: User Avatar + Rounded Input */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
            />
            <div className="flex-1">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="No que você está pensando?"
                className="w-full bg-[#0b1712] text-xs sm:text-sm text-[#F5F5F0] placeholder-[#A5B2A9] px-4 py-2.5 rounded-full border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 text-xs text-[#D94B4B] flex items-center gap-1.5 pl-12">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Expandable media input */}
          {showMediaInput && (
            <div className="mt-3 pl-12 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={mediaType === 'video' ? 'Cole a URL do vídeo (YouTube ou MP4)...' : 'Cole a URL da imagem (JPG, PNG)...'}
                  className="flex-1 bg-[#0b1712] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(false);
                    setMediaUrl('');
                  }}
                  className="p-1.5 text-[#A5B2A9] hover:text-[#D94B4B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {mediaUrl && mediaType === 'image' && (
                <div className="relative w-full max-h-40 rounded-xl overflow-hidden border border-[#263B30]">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Expandable poll input */}
          {showPollCreator && (
            <div className="mt-3 pl-12 p-3 bg-[#0b1712] rounded-2xl border border-[#263B30] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#E5AC24]">
                <span>Opções da Enquete Popular</span>
                <button
                  type="button"
                  onClick={() => setShowPollCreator(false)}
                  className="text-[#A5B2A9] hover:text-[#D94B4B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handlePollChange(e.target.value, idx)}
                    placeholder={`Opção ${idx + 1}...`}
                    maxLength={60}
                    className="flex-1 bg-[#102019] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] px-3 py-1.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      className="text-[#A5B2A9] hover:text-[#D94B4B] p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-[#E5AC24] hover:underline"
                >
                  + Adicionar alternativa
                </button>
              )}
            </div>
          )}

          {/* Bottom Action Row: Foto, Vídeo, Enquete, and Golden Publicar Button */}
          <div className="mt-3.5 pt-2 border-t border-[#263B30]/60 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 pl-1 sm:pl-2">
              {/* Foto Button */}
              <button
                type="button"
                onClick={() => {
                  setMediaType('image');
                  setShowMediaInput(true);
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  showMediaInput && mediaType === 'image'
                    ? 'text-[#E5AC24]'
                    : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                <Camera className="w-4 h-4 text-[#E5AC24]" />
                <span>Foto</span>
              </button>

              {/* Vídeo Button */}
              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setShowMediaInput(true);
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  showMediaInput && mediaType === 'video'
                    ? 'text-[#E5AC24]'
                    : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                <Video className="w-4 h-4 text-[#22C55E]" />
                <span>Vídeo</span>
              </button>

              {/* Enquete Button */}
              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                  showPollCreator
                    ? 'text-[#E5AC24]'
                    : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-[#EAB308]" />
                <span>Enquete</span>
              </button>
            </div>

            {/* Golden Publicar Button */}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5AC24] via-[#F3C448] to-[#D4AF37] hover:brightness-110 disabled:opacity-50 text-[#07140F] font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
