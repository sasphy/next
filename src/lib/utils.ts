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
