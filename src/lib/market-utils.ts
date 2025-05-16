'use client';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BondingCurveType } from './types';

/**
 * Interface for bonding curve parameters
 */
export interface BondingCurveParams {
  curveType: BondingCurveType;
  initialPrice: number;
  delta: number;
  initialSupply?: number;
  maxSupply?: number;
}

/**
 * Calculate the current price for a token based on the bonding curve
 * @param params Bonding curve parameters
 * @param currentSupply Current supply of the token
 * @returns Current price in lamports
 */
export const calculateSolanaPrice = (
  params: BondingCurveParams,
  currentSupply: bigint
): bigint => {
  const { initialPrice, maxSupply, curveType } = params;
  
  if (maxSupply !== undefined && currentSupply >= BigInt(maxSupply)) {
    return BigInt(initialPrice * 2); // Double the initial price as a default final price
  }
  
  // For compatibility with the rest of the code, we'll implement a simplified version
  // that doesn't depend on finalPrice
  const effectiveMaxSupply = maxSupply !== undefined ? BigInt(maxSupply) : BigInt(10000);
  
  // Normalize to [0, 10000] range (similar to contract's PRECISION)
  const t = (currentSupply * BigInt(10000)) / effectiveMaxSupply;
  
  // Calculate price diff (for simplicity, we'll use 2x initialPrice as the max price)
  const priceDiff = BigInt(initialPrice) - BigInt(initialPrice);
  
  if (typeof curveType === 'string') {
    // Handle string-based curve types
    switch (curveType) {
      case 'LINEAR':
        return BigInt(initialPrice) + (BigInt(currentSupply) * BigInt(Math.floor(params.delta * 100))) / BigInt(100);
      case 'EXPONENTIAL':
        return BigInt(initialPrice) + (BigInt(currentSupply) * BigInt(currentSupply) * BigInt(Math.floor(params.delta * 100))) / BigInt(10000);
      case 'LOGARITHMIC':
        // Simplified logarithmic calculation
        return BigInt(initialPrice) + BigInt(Math.floor(Math.log(Number(currentSupply) + 1) * params.delta * 100)) / BigInt(100);
      case 'SIGMOID':
        // Simplified sigmoid calculation
        const x = 0.01 * (Number(currentSupply) - 500);
        const sigmoid = 1 / (1 + Math.exp(-x));
        return BigInt(initialPrice) + BigInt(Math.floor(sigmoid * params.delta * 100)) / BigInt(100);
      default:
        return BigInt(initialPrice);
    }
  } else {
    // Handle numeric enum-based curve types (from the original code)
    return BigInt(initialPrice);
  }
};

/**
 * Calculate the estimated market cap based on current supply and price
 * @param currentPrice Current token price in lamports
 * @param totalSupply Total tokens in circulation
 * @returns Estimated market cap in lamports
 */
export const calculateSolanaMarketCap = (
  currentPrice: bigint,
  totalSupply: bigint
): bigint => {
  return currentPrice * totalSupply / BigInt(10000); // Normalize by PRECISION
};

/**
 * Convert lamports to SOL
 * @param lamports Amount in lamports
 * @returns Amount in SOL as number
 */
export const lamportsToSol = (lamports: bigint): number => {
  return Number(lamports) / LAMPORTS_PER_SOL;
};

/**
 * Convert SOL to lamports
 * @param sol Amount in SOL
 * @returns Amount in lamports as bigint
 */
export const solToLamports = (sol: number): bigint => {
  return BigInt(Math.floor(sol * LAMPORTS_PER_SOL));
};

/**
 * Format price for display
 * @param price Price in lamports or direct SOL value
 * @param decimals Number of decimals to display
 * @returns Formatted price string with SOL symbol
 */
export const formatPrice = (price: bigint | number, decimals = 4): string => {
  const solPrice = typeof price === 'bigint' ? lamportsToSol(price) : price;
  
  // Format to specified decimals
  const formattedPrice = solPrice.toFixed(decimals);
  
  return `${formattedPrice} SOL`;
};

/**
 * Calculate percentage of total supply
 * @param supply Current supply
 * @param maxSupply Maximum supply
 * @returns Percentage as a string with % symbol
 */
export const calculateSupplyPercentage = (
  supply: bigint | number,
  maxSupply: bigint | number
): string => {
  const supplyNum = typeof supply === 'bigint' ? Number(supply) : supply;
  const maxSupplyNum = typeof maxSupply === 'bigint' ? Number(maxSupply) : maxSupply;
  
  if (maxSupplyNum === 0) return '0%';
  
  const percentage = (supplyNum / maxSupplyNum) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Calculate the current price based on the supply and bonding curve parameters
 * This is the JavaScript implementation for frontend calculations
 */
export function calculateCurrentPrice({
  initialPrice,
  currentSupply,
  curveType,
  delta,
}: {
  initialPrice: number;
  currentSupply: number;
  curveType: BondingCurveType;
  delta: number;
}): number {
  if (currentSupply <= 0) {
    return initialPrice;
  }

  switch (curveType) {
    case 'LINEAR':
      // P = initialPrice + (supply * delta)
      return initialPrice + currentSupply * delta;

    case 'EXPONENTIAL':
      // P = initialPrice + (supply^2 * delta / 10000)
      return initialPrice + (Math.pow(currentSupply, 2) * delta) / 10000;

    case 'LOGARITHMIC':
      // P = initialPrice + (ln(supply + 1) * delta)
      return initialPrice + Math.log(currentSupply + 1) * delta;

    case 'SIGMOID':
      // P = initialPrice + (delta * (1 / (1 + e^(-0.01 * (supply - 500)))))
      const x = 0.01 * (currentSupply - 500);
      const sigmoid = 1 / (1 + Math.exp(-x));
      return initialPrice + delta * sigmoid;

    default:
      return initialPrice;
  }
}

/**
 * Calculate the price for buying a specific number of tokens
 */
export function calculateBuyPrice({
  initialPrice,
  currentSupply,
  amount,
  curveType,
  delta,
}: {
  initialPrice: number;
  currentSupply: number;
  amount: number;
  curveType: BondingCurveType;
  delta: number;
}): {
  startPrice: number;
  endPrice: number;
  totalPrice: number;
  priceImpact: number;
} {
  const startPrice = calculateCurrentPrice({
    initialPrice,
    currentSupply,
    curveType,
    delta,
  });

  const endPrice = calculateCurrentPrice({
    initialPrice,
    currentSupply: currentSupply + amount,
    curveType,
    delta,
  });

  let totalPrice = 0;

  // For each token being purchased, we add its price to the total
  for (let i = 0; i < amount; i++) {
    const price = calculateCurrentPrice({
      initialPrice,
      currentSupply: currentSupply + i,
      curveType,
      delta,
    });
    totalPrice += price;
  }

  // Calculate price impact as a percentage increase from start to end
  const priceImpact = ((endPrice - startPrice) / startPrice) * 100;

  return {
    startPrice,
    endPrice,
    totalPrice,
    priceImpact,
  };
}

/**
 * Calculate the price for selling a specific number of tokens
 */
export function calculateSellPrice({
  initialPrice,
  currentSupply,
  amount,
  curveType,
  delta,
  slippage = 5, // 5% default slippage
}: {
  initialPrice: number;
  currentSupply: number;
  amount: number;
  curveType: BondingCurveType;
  delta: number;
  slippage?: number;
}): {
  startPrice: number;
  endPrice: number;
  totalReturn: number;
  priceImpact: number;
} {
  if (amount > currentSupply) {
    throw new Error('Cannot sell more tokens than the current supply');
  }

  const startPrice = calculateCurrentPrice({
    initialPrice,
    currentSupply,
    curveType,
    delta,
  });

  const endPrice = calculateCurrentPrice({
    initialPrice,
    currentSupply: currentSupply - amount,
    curveType,
    delta,
  });

  let totalReturn = 0;

  // For each token being sold, we add its price to the total
  for (let i = 1; i <= amount; i++) {
    const price = calculateCurrentPrice({
      initialPrice,
      currentSupply: currentSupply - i,
      curveType,
      delta,
    });
    totalReturn += price;
  }

  // Apply slippage to the total return
  totalReturn = totalReturn * (1 - slippage / 100);

  // Calculate price impact as a percentage decrease from start to end
  const priceImpact = ((startPrice - endPrice) / startPrice) * 100;

  return {
    startPrice,
    endPrice,
    totalReturn,
    priceImpact,
  };
}

/**
 * Calculate the bonding curve progress as a percentage
 */
export function calculateBondingCurveProgress({
  currentSupply,
  maxSupply,
}: {
  currentSupply: number;
  maxSupply?: number;
}): number {
  if (!maxSupply || maxSupply <= 0) {
    // If no max supply, use logarithmic scale for visual representation
    // Return a percentage that starts high but slows down as supply increases
    return Math.min(100, Math.log10(currentSupply + 1) * 33.3);
  }

  return Math.min(100, (currentSupply / maxSupply) * 100);
}

/**
 * Calculate the market cap of a token
 */
export function calculateMarketCap({
  currentPrice,
  totalSupply,
}: {
  currentPrice: number;
  totalSupply: number;
}): number {
  return currentPrice * totalSupply;
}

/**
 * Get human-readable description of a bonding curve type
 */
export function getBondingCurveDescription(curveType: BondingCurveType): string {
  switch (curveType) {
    case 'LINEAR':
      return 'Price increases linearly with supply';
    case 'EXPONENTIAL':
      return 'Price increases exponentially, accelerating as supply grows';
    case 'LOGARITHMIC':
      return 'Price increases quickly at first, then growth slows down';
    case 'SIGMOID':
      return 'S-curve pricing with slow start, quick middle growth, then plateau';
    default:
      return 'Custom pricing curve';
  }
}

/**
 * Generate data points for a bonding curve chart
 */
export function generateBondingCurveData({
  curveType,
  initialPrice,
  delta,
  maxPoints = 50,
  maxSupply,
}: {
  curveType: BondingCurveType;
  initialPrice: number;
  delta: number;
  maxPoints?: number;
  maxSupply?: number;
}): { supply: number; price: number }[] {
  const data: { supply: number; price: number }[] = [];
  const effectiveMaxSupply = maxSupply || 1000;
  const step = effectiveMaxSupply / maxPoints;

  for (let supply = 0; supply <= effectiveMaxSupply; supply += step) {
    const price = calculateCurrentPrice({
      initialPrice,
      currentSupply: supply,
      curveType,
      delta,
    });
    data.push({ supply, price });
  }

  return data;
}

/**
 * Market utilities for bonding curve calculations and token economics
 * Provides functions for calculating token prices based on different curve types
 */

// Curve types
export enum CurveType {
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
  LOGARITHMIC = 'LOGARITHMIC',
  SIGMOID = 'SIGMOID',
}

// Constants for curve calculations
const PRECISION = 10000;

/**
 * Calculate token price based on supply and curve parameters
 * @param curveType Type of bonding curve
 * @param initialPrice Initial price in SOL units (e.g., 0.1)
 * @param currentSupply Current supply of tokens
 * @param delta Price change parameter
 * @returns Price in SOL units
 */
export function calculateTokenPrice(
  curveType: CurveType,
  initialPrice: number,
  currentSupply: number,
  delta: number = 0.01
): number {
  // Safety check
  if (initialPrice < 0) {
    throw new Error("Initial price cannot be negative");
  }
  
  // Bonding curve calculations
  switch (curveType) {
    case CurveType.LINEAR:
      // Linear: price = initialPrice + supply * delta
      return initialPrice + currentSupply * delta;
      
    case CurveType.EXPONENTIAL:
      // Exponential: price = initialPrice + (supply² * delta / PRECISION)
      // We divide by precision to keep numbers manageable
      return initialPrice + (Math.pow(currentSupply, 2) * delta / PRECISION);
      
    case CurveType.LOGARITHMIC:
      // Logarithmic: price = initialPrice + (delta * log(supply + 1))
      // Add 1 to avoid log(0)
      return initialPrice + (delta * Math.log(currentSupply + 1));
      
    case CurveType.SIGMOID:
      // Sigmoid: price follows S-curve (slow start, rapid middle growth, plateau)
      // sigmoid(x) = 1 / (1 + e^(-k * (x - x0)))
      const midpoint = 100; // Supply at inflection point
      const steepness = 0.05; // Controls steepness of curve
      const sigmoid = 1 / (1 + Math.exp(-steepness * (currentSupply - midpoint)));
      return initialPrice + delta * sigmoid * 10; // Scale to reasonable range
      
    default:
      // Default to linear pricing
      return initialPrice + currentSupply * delta;
  }
}

/**
 * Calculate the price impact of buying/selling a given amount of tokens
 * @param curveType Type of bonding curve
 * @param initialPrice Initial price in SOL units
 * @param currentSupply Current supply of tokens
 * @param amount Amount of tokens to buy/sell (positive for buy, negative for sell)
 * @param delta Price change parameter
 * @returns Object with prices and costs
 */
export function calculatePriceImpact(
  curveType: CurveType,
  initialPrice: number,
  currentSupply: number,
  amount: number,
  delta: number = 0.01
): {
  currentPrice: number;
  newPrice: number;
  averagePrice: number;
  totalCost: number;
  priceImpactPercent: number;
} {
  // Validate parameters
  if (amount === 0) {
    throw new Error("Amount cannot be zero");
  }
  
  if (amount < 0 && Math.abs(amount) > currentSupply) {
    throw new Error("Cannot sell more tokens than current supply");
  }
  
  const currentPrice = calculateTokenPrice(curveType, initialPrice, currentSupply, delta);
  const newSupply = currentSupply + amount;
  const newPrice = calculateTokenPrice(curveType, initialPrice, newSupply, delta);
  
  // For accurate cost calculation, we need to integrate the price curve
  // For simplicity, we'll use a discrete sum approximation
  let totalCost = 0;
  const steps = Math.abs(amount);
  const stepSize = amount / steps;
  
  for (let i = 0; i < steps; i++) {
    const supplyAtStep = currentSupply + i * stepSize;
    const priceAtStep = calculateTokenPrice(curveType, initialPrice, supplyAtStep, delta);
    totalCost += priceAtStep * stepSize;
  }
  
  // Calculate average price
  const averagePrice = Math.abs(totalCost / amount);
  
  // Calculate price impact percentage
  const priceImpactPercent = ((newPrice - currentPrice) / currentPrice) * 100;
  
  return {
    currentPrice,
    newPrice,
    averagePrice,
    totalCost,
    priceImpactPercent
  };
}

/**
 * Calculate the market capitalization of a token
 * @param curveType Bonding curve type
 * @param initialPrice Initial price in SOL units
 * @param currentSupply Current supply of tokens
 * @param delta Price change parameter
 * @returns Market cap in SOL units
 */
export function calculateCurveMarketCap(
  curveType: CurveType,
  initialPrice: number,
  currentSupply: number,
  delta: number = 0.01
): number {
  // Market cap is the area under the price curve from 0 to currentSupply
  // For simplicity, we'll use a discrete sum approximation
  let marketCap = 0;
  const steps = currentSupply;
  
  for (let i = 0; i < steps; i++) {
    const priceAtStep = calculateTokenPrice(curveType, initialPrice, i, delta);
    marketCap += priceAtStep;
  }
  
  return marketCap;
}

/**
 * Calculate the position in the bonding curve
 * Useful for visualizing where in the curve a token is
 * @param curveType Bonding curve type
 * @param currentSupply Current supply
 * @param maxSupply Maximum possible supply (if applicable)
 * @returns Percentage position in the curve (0-100)
 */
export function calculateCurveProgress(
  curveType: CurveType,
  currentSupply: number,
  maxSupply: number = 1000
): number {
  // Ensure we don't divide by zero
  if (maxSupply <= 0) {
    throw new Error("Max supply must be positive");
  }
  
  // Calculate progress percentage
  const progress = (currentSupply / maxSupply) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, progress));
}

/**
 * Generate price points for a bonding curve visualization
 * @param curveType Type of bonding curve
 * @param initialPrice Initial price in SOL units
 * @param maxSupply Maximum supply for visualization
 * @param delta Price change parameter
 * @param points Number of data points to generate
 * @returns Array of [supply, price] pairs
 */
export function generateCurvePoints(
  curveType: CurveType,
  initialPrice: number,
  maxSupply: number = 1000,
  delta: number = 0.01,
  points: number = 100
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  const step = maxSupply / points;
  
  for (let i = 0; i <= points; i++) {
    const supply = i * step;
    const price = calculateTokenPrice(curveType, initialPrice, supply, delta);
    result.push([supply, price]);
  }
  
  return result;
}

/**
 * Convert curve type from string to enum
 * @param curveTypeStr String representation of curve type
 * @returns CurveType enum value
 */
export function parseCurveType(curveTypeStr: string): CurveType {
  const upperCase = curveTypeStr.toUpperCase();
  
  switch (upperCase) {
    case 'LINEAR':
      return CurveType.LINEAR;
    case 'EXPONENTIAL':
      return CurveType.EXPONENTIAL;
    case 'LOGARITHMIC':
      return CurveType.LOGARITHMIC;
    case 'SIGMOID':
      return CurveType.SIGMOID;
    default:
      // Default to LINEAR if unknown
      console.warn(`Unknown curve type: ${curveTypeStr}. Defaulting to LINEAR.`);
      return CurveType.LINEAR;
  }
}

/**
 * Calculate the slippage for a transaction
 * @param expectedPrice Expected price
 * @param actualPrice Actual price
 * @returns Slippage percentage
 */
export function calculateSlippage(expectedPrice: number, actualPrice: number): number {
  if (expectedPrice <= 0) {
    throw new Error("Expected price must be positive");
  }
  
  return ((actualPrice - expectedPrice) / expectedPrice) * 100;
}
