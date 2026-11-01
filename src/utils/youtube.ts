/**
 * Utility functions for YouTube URL detection, ID extraction and thumbnail generation
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  const autoParam = autoplay ? 'autoplay=1&' : '';
  return `https://www.youtube-nocookie.com/embed/${videoId}?${autoParam}rel=0&modestbranding=1`;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
