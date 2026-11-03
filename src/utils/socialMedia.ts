import { extractTwitterInfo } from './twitter';

/**
 * Detecta links de redes sociais e imagens diretas em um texto e retorna metadados para embed/preview
 */
export type SocialPlatform = 'youtube' | 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'image' | 'unknown';

export interface SocialLink {
  platform: SocialPlatform;
  id?: string;
  username?: string;
  isVideo?: boolean;
  url: string;
  embedUrl?: string;
  directVideoUrl?: string;
  thumbnailUrl?: string;
}

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|#|$)/i;

export function detectSocialLinks(text: string): SocialLink[] {
  const links: SocialLink[] = [];
  const urlRegex = /https?:\/\/[^\s<>"'()]+/g;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];

    // Imagem direta
    if (IMAGE_EXTENSIONS.test(url)) {
      links.push({
        platform: 'image',
        url,
        thumbnailUrl: url
      });
      continue;
    }

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch?.[1]) {
      links.push({
        platform: 'youtube',
        id: ytMatch[1],
        url,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
      });
      continue;
    }

    // X / Twitter (suporta links com usuário, /video/, etc.)
    const twInfo = extractTwitterInfo(url);
    if (twInfo) {
      links.push({
        platform: 'twitter',
        id: twInfo.id,
        username: twInfo.username,
        isVideo: twInfo.isVideo,
        url: twInfo.url,
        embedUrl: twInfo.embedUrl,
        directVideoUrl: twInfo.directVideoUrl,
        thumbnailUrl: undefined
      });
      continue;
    }

    // Instagram
    const igMatch = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/);
    if (igMatch?.[1]) {
      const isReel = /\/reel(?:s)?\//.test(url);
      links.push({
        platform: 'instagram',
        id: igMatch[1],
        url,
        embedUrl: `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${igMatch[1]}/embed/captioned/`,
        thumbnailUrl: undefined
      });
      continue;
    }

    // TikTok
    const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
    if (ttMatch?.[1]) {
      links.push({
        platform: 'tiktok',
        id: ttMatch[1],
        url,
        embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`,
        thumbnailUrl: undefined
      });
      continue;
    }

    // Facebook
    const fbMatch = url.match(/facebook\.com\/(?:[\w.]+\/videos\/|\/watch\/?\?v=|[\w.]+\/posts\/|\/photo\?fbid=)(\d+)/);
    if (fbMatch?.[1]) {
      links.push({
        platform: 'facebook',
        id: fbMatch[1],
        url,
        embedUrl: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500&height=280`,
        thumbnailUrl: undefined
      });
      continue;
    }
  }

  return links;
}
