import { VideoSnippet } from '../types';

export const youtubeService = {
  async searchVideos(tags: string[]): Promise<VideoSnippet[]> {
    if (!tags.length) return [];

    const query = `${tags.join(' ')} cognitive behavioral therapy`;
    const url = `/api/youtube-search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        console.error('YouTube search failed:', errData.error || response.statusText);
        return [];
      }
      const data = await response.json();
      return (data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        tagName: tags[0] || 'Therapy'
      }));
    } catch (error) {
      console.error('YouTube service error:', error);
      return [];
    }
  }
};
