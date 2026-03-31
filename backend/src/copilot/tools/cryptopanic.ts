import dotenv from 'dotenv';
dotenv.config();

const CRYPTOPANIC_API_KEY = process.env.CRYPTOPANIC_API_KEY ;
const BASE_URL = 'https://cryptopanic.com/api/v1';

export interface NewsPost {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  votes: {
    positive: number;
    negative: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
  };
}

export interface SentimentResult {
  score: number;           // -1 to 1
  positiveCount: number;
  negativeCount: number;
}

// In-memory cache keyed by symbol+filter
const cache = new Map<string, { data: NewsPost[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): NewsPost[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  cache.delete(key);
  return null;
}

export async function getNews(
  symbol: string,
  filter: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' | 'saved' | 'lol' = 'hot'
): Promise<NewsPost[]> {
  const upper = symbol.toUpperCase();
  const cacheKey = `news:${upper}:${filter}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/posts/?auth_token=${CRYPTOPANIC_API_KEY}&currencies=${upper}&filter=${filter}&kind=news`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Oracle-Copilot/1.0',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.log(`[copilot][cryptopanic] Fetch failed: ${res.status} for ${upper} (${filter})`);
      return [];
    }

    const json = await res.json() as { results?: Array<Record<string, unknown>> };
    if (!Array.isArray(json.results)) return [];

    const posts: NewsPost[] = json.results.slice(0, 10).map((item: Record<string, unknown>) => {
      const votes = (item.votes as Record<string, unknown> | undefined) ?? {};
      return {
        id: Number(item.id ?? 0),
        title: String(item.title ?? ''),
        url: String(item.url ?? ''),
        publishedAt: String(item.published_at ?? new Date().toISOString()),
        votes: {
          positive: Number(votes.positive ?? 0),
          negative: Number(votes.negative ?? 0),
          important: Number(votes.important ?? 0),
          liked: Number(votes.liked ?? 0),
          disliked: Number(votes.disliked ?? 0),
          lol: Number(votes.lol ?? 0),
          toxic: Number(votes.toxic ?? 0),
          saved: Number(votes.saved ?? 0),
        },
      };
    });

    cache.set(cacheKey, { data: posts, expiresAt: Date.now() + CACHE_TTL_MS });
    return posts;
  } catch (err) {
    console.error(`[copilot][cryptopanic] getNews error for ${upper}:`, err);
    return [];
  }
}

export function getSentimentScore(posts: NewsPost[]): SentimentResult {
  if (posts.length === 0) {
    return { score: 0, positiveCount: 0, negativeCount: 0 };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  for (const post of posts) {
    const pos = post.votes.positive + post.votes.liked + post.votes.important * 0.5;
    const neg = post.votes.negative + post.votes.disliked + post.votes.toxic * 1.5;
    const weight = pos + neg + 1; // +1 to avoid zero weight

    const postScore = (pos - neg) / weight;
    weightedScore += postScore * weight;
    totalWeight += weight;

    if (pos > neg) positiveCount++;
    else if (neg > pos) negativeCount++;
  }

  const rawScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
  // Clamp to [-1, 1]
  const score = Math.max(-1, Math.min(1, rawScore));

  return { score, positiveCount, negativeCount };
}
