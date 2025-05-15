import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return '';
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
}

export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '0 SOL';
  }
  
  return `${numericPrice.toLocaleString(undefined, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 9
  })} SOL`;
}

export function formatTimeFromSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  return formatTimeFromSeconds(seconds);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getExplorerUrl(txId: string, cluster = 'devnet'): string {
  return `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`;
}

export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateEVScore(discoveryTimestamp: Date, popularity: number): number {
  // Simple EV score calculation:
  // Earlier discovery (older timestamp) + higher popularity = higher score
  const now = new Date();
  const discoveryTimeAgo = now.getTime() - discoveryTimestamp.getTime();
  const discoveryDays = discoveryTimeAgo / (1000 * 60 * 60 * 24);
  
  // Earlier discovery gives more points (max 100 points for discovery over 100 days ago)
  const discoveryScore = Math.min(100, discoveryDays);
  
  // Popularity bonus (0-100 scale)
  const popularityScore = popularity * 3;
  
  return Math.round(discoveryScore + popularityScore);
}

export function calculateInfluenceScore(userStats: {
  likedTracks: number;
  discoveries: number;
  avgEarlyness: number;
  followers: number;
}): number {
  const { likedTracks, discoveries, avgEarlyness, followers } = userStats;
  
  // Weight factors
  const likedWeight = 0.1;
  const discoveriesWeight = 0.4;
  const earlinessWeight = 0.3;
  const followersWeight = 0.2;
  
  // Calculate normalized scores (0-100)
  const likedScore = Math.min(100, likedTracks / 2);
  const discoveriesScore = Math.min(100, discoveries * 5);
  const earlinessScore = Math.min(100, avgEarlyness);
  const followersScore = Math.min(100, followers / 10);
  
  // Calculate weighted score
  const influenceScore = (
    likedScore * likedWeight +
    discoveriesScore * discoveriesWeight +
    earlinessScore * earlinessWeight +
    followersScore * followersWeight
  );
  
  return Math.round(influenceScore);
}

export function generateRandomId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
