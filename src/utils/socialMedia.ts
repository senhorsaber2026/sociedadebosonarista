/**
 * Detecta links de redes sociais em um texto e retorna metadados para embed/preview
 */
export type SocialPlatform = 'youtube' | 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'unknown';

export interface SocialLink {
  platform: SocialPlatform;
  id?: string;
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
}

export function detectSocialLinks(text: string): SocialLink[] {
  const links: SocialLink[] = [];
  const urlRegex = /https?:\/\/[^\s<>"'()]+/g;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];

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

    // X / Twitter
    const twMatch = url.match(/(?:twitter\.com|x\.com)\/(?:i\/)?status\/(\d+)/);
    if (twMatch?.[1]) {
      links.push({
        platform: 'twitter',
        id: twMatch[1],
        url,
        embedUrl: `https://twitter.com/i/status/${twMatch[1]}`
      });
      continue;
    }

    // Instagram
    const igMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/);
    if (igMatch?.[1]) {
      links.push({
        platform: 'instagram',
        id: igMatch[1],
        url
      });
      continue;
    }

    // TikTok
    const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
    if (ttMatch?.[1]) {
      links.push({
        platform: 'tiktok',
        id: ttMatch[1],
        url
      });
      continue;
    }

    // Facebook
    const fbMatch = url.match(/facebook\.com\/(?:[\w.]+\/videos\/|\/watch\/?\?v=)(\d+)/);
    if (fbMatch?.[1]) {
      links.push({
        platform: 'facebook',
        id: fbMatch[1],
        url
      });
      continue;
    }
  }

  return links;
}
