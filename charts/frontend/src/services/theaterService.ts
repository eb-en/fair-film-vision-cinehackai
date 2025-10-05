import type { TheaterSearchResult } from '@/types';

interface TheaterSearchResponse {
  meta: {
    time: number;
    srch_cat: Array<{
      name: string;
      type: string;
    }>;
    ti: string;
  };
  hits: Array<{
    ST: string;
    CC: string;
    GRP: string;
    GROUP_TITLE: string;
    L_URL: string;
    WEB_REDIRECT_URL: string;
    REGION_SLUG: string;
    REGION: string;
    SLUG: string;
    TITLE: string;
    ID: string;
    TYPE: string;
    TYPE_NAME: string;
    CAT: string;
    IS_STREAM: boolean;
    IS_ONLINE: boolean;
    IS_NLP_RESPONSE: boolean;
    TAG_TEXT: string;
    RATINGS_META_URL: string;
    POSTER_URL: string;
  }>;
}

export const searchTheaters = async (
  query: string,
  signal?: AbortSignal
): Promise<TheaterSearchResult[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const url = `${API_BASE_URL}/bms/search-theatres?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, { signal });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search theaters: ${response.status} - ${errorText}`);
    }

    const data: TheaterSearchResponse = await response.json();

    // Filter for venues only and map to our interface
    return data.hits
      .filter(hit => hit.CAT === 'VN') // Only venues
      .map(hit => ({
        id: hit.ID,
        title: hit.TITLE,
        region: hit.REGION,
        slug: hit.SLUG,
        groupTitle: hit.GROUP_TITLE,
      }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    return [];
  }
};