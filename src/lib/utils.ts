import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string, currency = 'SOL'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return `0 ${currency}`;
  }
  
  return `${numPrice.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} ${currency}`;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function truncateAddress(address: string, startLength = 4, endLength = 4): string {
  if (!address) return '';
  
  if (address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // Less than a month
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }
  
  // Less than a year
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }
  
  // More than a year
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function getExplorerUrl(address: string, cluster = 'mainnet-beta'): string {
  const baseUrl = 'https://solscan.io';
  
  // Check if address is a transaction signature (usually 88+ characters)
  if (address.length >= 88) {
    return `${baseUrl}/tx/${address}?cluster=${cluster}`;
  }
  
  // Otherwise assume it's a wallet or token address
  return `${baseUrl}/account/${address}?cluster=${cluster}`;
}
