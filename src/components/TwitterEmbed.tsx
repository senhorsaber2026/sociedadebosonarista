import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, Play, Film } from 'lucide-react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, any>
        ) => Promise<HTMLElement | undefined>;
        load?: () => void;
      };
    };
  }
}

interface TwitterEmbedProps {
  tweetId: string;
  username?: string;
  originalUrl?: string;
  className?: string;
  compact?: boolean;
}

export const TwitterEmbed: React.FC<TwitterEmbedProps> = ({
  tweetId,
  username,
  originalUrl,
  className = '',
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [useDirectVideo, setUseDirectVideo] = useState(false);
  const [directVideoError, setDirectVideoError] = useState(false);

  const cleanUrl = originalUrl || (username 
    ? `https://x.com/${username}/status/${tweetId}`
    : `https://x.com/i/status/${tweetId}`);

  const directVideoUrl = `https://d.fxtwitter.com/${username || 'i'}/status/${tweetId}`;
  const iframeEmbedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&dnt=true&lang=pt`;

  // Tenta carregar o widget oficial do Twitter
  useEffect(() => {
    let isMounted = true;
    let timeoutId: any = null;

    if (useIframeFallback || useDirectVideo) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const initWidget = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';

      if (window.twttr && window.twttr.widgets && window.twttr.widgets.createTweet) {
        window.twttr.widgets
          .createTweet(tweetId, containerRef.current, {
            theme: 'dark',
            align: 'center',
            dnt: true,
            conversation: 'none',
            lang: 'pt'
          })
          .then((el) => {
            if (!isMounted) return;
            if (el) {
              setLoading(false);
              setError(false);
            } else {
              // Se createTweet retornar undefined (comum em adblockers ou se o tweet não foi indexado no widget)
              // recorrer ao iframe direto do Tweet.html
              setUseIframeFallback(true);
              setLoading(false);
            }
          })
          .catch(() => {
            if (!isMounted) return;
            setUseIframeFallback(true);
            setLoading(false);
          });
      } else {
        // Injeta script caso não exista
        let script = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          script.charset = 'utf-8';
          document.body.appendChild(script);
        }

        const checkInterval = setInterval(() => {
          if (window.twttr && window.twttr.widgets) {
            clearInterval(checkInterval);
            if (isMounted) initWidget();
          }
        }, 150);

        // Se após 3 segundos o script não carregou (ex: bloqueado por adblock/extensão), chaveia para iframe
        timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          if (isMounted && loading) {
            setUseIframeFallback(true);
            setLoading(false);
          }
        }, 2500);
      }
    };

    initWidget();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tweetId, useIframeFallback, useDirectVideo]);

  return (
    <div className={`w-full bg-[#07140F] rounded-2xl border border-[#263B30] overflow-hidden flex flex-col ${className}`}>
      {/* HEADER DA MÍDIA X / TWITTER */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1d17] border-b border-[#263B30]/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-black border border-[#263B30] flex items-center justify-center shrink-0">
            {/* Ícone oficial do X */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-[#F5F5F0]">
              {username ? `@${username}` : 'X / Twitter'}
            </span>
            <span className="text-[10px] text-[#A5B2A9] ml-1.5 font-medium hidden sm:inline">
              • Vídeo incorporado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Alternador de player para garantir que sempre abra */}
          <button
            type="button"
            onClick={() => {
              setUseDirectVideo(!useDirectVideo);
              setDirectVideoError(false);
            }}
            title={useDirectVideo ? "Alternar para player completo do X" : "Alternar para vídeo direto"}
            className="text-[10px] text-[#A5B2A9] hover:text-[#E8CC76] px-2 py-1 rounded bg-[#15291F] border border-[#263B30] transition flex items-center gap-1"
          >
            {useDirectVideo ? (
              <>
                <Film className="w-3 h-3 text-[#E5AC24]" />
                <span className="hidden sm:inline">Ver no Feed do X</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#22C55E]" />
                <span className="hidden sm:inline">Vídeo Direto</span>
              </>
            )}
          </button>

          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E5AC24] hover:text-[#F3C448] transition px-2 py-1 rounded bg-[#174D32]/60 hover:bg-[#174D32] border border-[#263B30]"
            title="Abrir no X (Twitter)"
          >
            <span>Abrir no X</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ÁREA DE EXIBIÇÃO DO VÍDEO / TWEET */}
      <div className="relative w-full min-h-[380px] max-h-[620px] overflow-y-auto bg-black flex flex-col items-center justify-center p-1 sm:p-2">
        {/* MODO 1: VÍDEO DIRETO VIA REDIRECIONAMENTO DE MÍDIA FXTWITTER */}
        {useDirectVideo ? (
          <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-black">
            {!directVideoError ? (
              <video
                src={directVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[520px] rounded-lg object-contain bg-black"
                onError={() => setDirectVideoError(true)}
              />
            ) : (
              <div className="p-6 text-center max-w-sm">
                <AlertCircle className="w-10 h-10 text-[#D94B4B] mx-auto mb-2" />
                <p className="text-xs text-[#F5F5F0] mb-2 font-semibold">
                  O vídeo direto não respondeu neste momento.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUseDirectVideo(false);
                    setUseIframeFallback(true);
                  }}
                  className="px-3 py-1.5 bg-[#174D32] text-[#E8CC76] text-xs font-bold rounded-lg border border-[#263B30] hover:brightness-110 mb-2"
                >
                  Carregar pelo Player do X
                </button>
                <div className="mt-2">
                  <a
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1DA1F2] underline hover:text-[#71c9f8]"
                  >
                    Assistir diretamente no site do X
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : useIframeFallback ? (
          /* MODO 2: IFRAME OFICIAL DO TWEET.HTML DO TWITTER (Resiliente a adblockers de JS) */
          <div className="w-full h-full min-h-[420px] flex items-center justify-center bg-black">
            <iframe
              src={iframeEmbedUrl}
              title={`Tweet de ${username || 'usuário'}`}
              className="w-full min-h-[420px] max-h-[580px] border-0 rounded-xl"
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          /* MODO 3: WIDGET JS OFICIAL DO TWITTER */
          <div className="w-full flex justify-center py-1">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="w-6 h-6 text-[#E5AC24] animate-spin" />
                <span className="text-xs text-[#A5B2A9]">Carregando vídeo do X...</span>
              </div>
            )}
            <div 
              ref={containerRef} 
              className={`w-full max-w-[550px] flex justify-center [&_iframe]:!my-0 [&_iframe]:!mx-auto ${loading ? 'hidden' : 'block'}`} 
            />
          </div>
        )}

        {/* MODO DE ERRO TOTAL (FALLBACK DEFINITIVO) */}
        {error && (
          <div className="p-6 text-center max-w-md bg-[#102019] rounded-xl border border-[#263B30] m-4">
            <AlertCircle className="w-10 h-10 text-[#D94B4B] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#F5F5F0] mb-1">
              Publicação de @{username || 'usuário'}
            </h4>
            <p className="text-xs text-[#A5B2A9] mb-4">
              Não foi possível exibir o vídeo incorporado no seu navegador. Você pode assisti-lo diretamente no X.
            </p>
            <div className="flex items-center justify-center gap-2">
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#174D32] hover:bg-[#1f6341] text-[#E8CC76] text-xs font-bold transition border border-[#263B30] flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Assistir Vídeo no X</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setUseDirectVideo(true);
                  setError(false);
                }}
                className="px-3 py-2 rounded-xl bg-[#15291F] hover:bg-[#1a3327] text-[#A5B2A9] text-xs font-bold transition border border-[#263B30]"
              >
                Vídeo Direto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="px-3.5 py-1.5 bg-[#0b1712] border-t border-[#263B30]/60 flex items-center justify-between text-[10px] text-[#A5B2A9]">
        <span>Fonte: X (antigo Twitter)</span>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E8CC76] hover:underline flex items-center gap-1"
        >
          <span>Post #{tweetId}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};

