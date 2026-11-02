export interface VideoOutlierItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  viewsFormatted: string;
  duration?: number | null;
  durationFormatted?: string | null;
  videoUrl?: string | null;
  multiplier?: number;
  publishDate?: string | null;
  channelId?: string;
  channelTitle?: string;
  channelHandle?: string;
  channelThumbnail?: string | null;
  channelSubs?: number;
  channelSubsFormatted?: string;
  format?: 'avatar' | 'faceless' | 'documentary';
  category?: string;
  categories?: string[];
  tags?: string[];
}

export interface Channel {
  id: string;
  slug?: string;
  title: string;
  handle: string;
  ytChannelId?: string | null;
  youtubeUrl?: string | null;
  thumbnail: string | null;
  subscribers: number;
  avgViews: number;
  totalViews: number;
  totalVideos: number;
  format?: 'avatar' | 'faceless' | 'documentary';
  avatarStyle?: string | null;
  avatarMotion?: string | null;
  gender?: string | null;
  monetization: boolean;
  estimatedRpm: {
    min: number;
    max: number;
    avg: number;
  };
  estimatedMonthlyRevenueUsd?: number | null;
  categories: string[];
  tags: string[];
  sells?: string;
  offers?: { title: string; type: string }[];
  medianLengthSeconds?: number | null;
  medianLengthFormatted?: string | null;
  uploadsPerWeek?: number | null;
  titlePatterns?: string[];
  whyItWorks?: string[];
  popularVideos: {
    videoId: string;
    title: string;
    thumbnail: string;
    views?: number;
    viewsFormatted?: string;
    duration?: number | null;
    durationFormatted?: string | null;
    videoUrl?: string | null;
    publishDate?: string | null;
  }[];
  deepAnalysis?: {
    targetAudience?: string | null;
    whyItWorks?: string[];
    contentPillars?: string[];
    titlePatterns?: string[];
    avatarDetails?: any;
    persona?: any;
    videoFormat?: string | null;
  } | null;
}

export interface Niche {
  name: string;
  slug: string;
  channelCount: number;
  avgViews: number;
  rpm: {
    min: number;
    max: number;
    avg: number;
  };
  saturation: 'Low' | 'Medium' | 'High';
  demandScore: number;
  formatRecommendation: string;
  topTitleFormulas: string[];
  summary: string;
}

export interface SwipeVideo extends VideoOutlierItem {}

export interface FilterState {
  search: string;
  niche: string;
  subs: string;
  format: string; // 'all' | 'avatar' | 'faceless'
  monetized: string;
  sort: 'subscribers' | 'views' | 'revenue' | 'rpm';
  viewMode: 'grid' | 'table';
  categoryChip: string;
}
