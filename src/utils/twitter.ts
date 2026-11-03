/**
 * Utilitários para detecção, extração de IDs e geração de URLs de embed do X (antigo Twitter)
 */

export interface TwitterInfo {
  id: string;
  username?: string;
  url: string;
  embedUrl: string;
  directVideoUrl: string;
  isVideo: boolean;
}

// Regex abrangente que suporta x.com, twitter.com, fxtwitter.com, fixupx.com, vxtwitter.com
// formatos suportados:
// - https://x.com/MichelcSales/status/2117662266531230038/video/1
// - https://x.com/MichelcSales/status/2117662266531230038
// - https://twitter.com/MichelcSales/status/2117662266531230038
// - https://x.com/i/status/2117662266531230038
// - https://twitter.com/i/status/2117662266531230038
// - https://mobile.twitter.com/user/status/2117662266531230038
// - https://x.com/status/2117662266531230038
export const TWITTER_URL_REGEX = /(?:https?:\/\/)?(?:(?:www\.|mobile\.)?(?:twitter|x|fixupx|fxtwitter|vxtwitter)\.com)\/(?:([a-zA-Z0-9_]+)\/)?(?:status|statuses)\/(\d+)(?:\/video\/\d+)?(?:\S*)?/i;

export function extractTwitterInfo(textOrUrl: string): TwitterInfo | null {
  if (!textOrUrl) return null;
  const match = textOrUrl.match(TWITTER_URL_REGEX);
  if (!match || !match[2]) return null;

  const rawUser = match[1];
  const id = match[2];
  const username = rawUser && rawUser.toLowerCase() !== 'i' && rawUser.toLowerCase() !== 'status' ? rawUser : undefined;
  const isVideo = textOrUrl.toLowerCase().includes('/video/') || Boolean(textOrUrl.match(/\/video\/\d+/i));

  const cleanUrl = username 
    ? `https://x.com/${username}/status/${id}`
    : `https://x.com/i/status/${id}`;

  const embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=dark&dnt=true`;
  const directVideoUrl = `https://d.fxtwitter.com/${username || 'i'}/status/${id}`;

  return {
    id,
    username,
    url: cleanUrl,
    embedUrl,
    directVideoUrl,
    isVideo
  };
}

export function extractTwitterId(textOrUrl: string): string | null {
  const info = extractTwitterInfo(textOrUrl);
  return info ? info.id : null;
}

export function getTwitterEmbedUrl(id: string): string {
  return `https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=dark&dnt=true`;
}

export function getTwitterDirectVideoUrl(id: string, username?: string): string {
  return `https://d.fxtwitter.com/${username || 'i'}/status/${id}`;
}

