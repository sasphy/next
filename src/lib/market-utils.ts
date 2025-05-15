import { formatEther, parseEther } from 'viem';

/**
 * Types of bonding curves supported by the contract
 */
export enum BondingCurveType {
  LINEAR = 0,
  EXPONENTIAL = 1,
  LOGARITHMIC = 2,
  SIGMOID = 3
}

/**
 * Interface for bonding curve parameters
 */
export interface BondingCurveParams {
  initialPrice: bigint;
  finalPrice: bigint;
  maxSupply: bigint;
  curveType: BondingCurveType;
}

/**
 * Calculate the current price for a token based on the bonding curve
 * @param params Bonding curve parameters
 * @param currentSupply Current supply of the token
 * @returns Current price in wei
 */
export const calculateCurrentPrice = (
  params: BondingCurveParams,
  currentSupply: bigint
): bigint => {
  const { initialPrice, finalPrice, maxSupply, curveType } = params;
  
  if (currentSupply >= maxSupply) {
    return finalPrice;
  }
  
  // Normalize to [0, 10000] range (similar to contract's PRECISION)
  const t = (currentSupply * BigInt(10000)) / maxSupply;
  
  const priceDiff = finalPrice - initialPrice;
  
  switch (curveType) {
    case BondingCurveType.LINEAR:
      // Linear: p = p0 + t * (p1 - p0)
      return initialPrice + (t * priceDiff) / BigInt(10000);
      
    case BondingCurveType.EXPONENTIAL:
      // Exponential: p = p0 + t^2 * (p1 - p0)
      const tSquared = (t * t) / BigInt(10000);
      return initialPrice + (tSquared * priceDiff) / BigInt(10000);
      
    case BondingCurveType.LOGARITHMIC:
      // Logarithmic with Bezier approximation
      const logTSquared = (t * t) / BigInt(10000);
      const bezierT = (BigInt(2) * t - logTSquared) / BigInt(10000);
      return initialPrice + (bezierT * priceDiff) / BigInt(10000);
      
    case BondingCurveType.SIGMOID:
      // Sigmoid with cubic Bezier approximation
      const sigTSquared = (t * t) / BigInt(10000);
      const sigTCubed = (sigTSquared * t) / BigInt(10000);
      const bezierSig = ((BigInt(3) * sigTSquared) - (BigInt(2) * sigTCubed)) / BigInt(10000);
      return initialPrice + (bezierSig * priceDiff) / BigInt(10000);
      
    default:
      return initialPrice + (t * priceDiff) / BigInt(10000);
  }
};

/**
 * Calculate the estimated market cap based on current supply and price
 * @param currentPrice Current token price
 * @param totalSupply Total tokens in circulation
 * @returns Estimated market cap in ETH
 */
export const calculateMarketCap = (
  currentPrice: bigint,
  totalSupply: bigint
): bigint => {
  return currentPrice * totalSupply / BigInt(10000); // Normalize by PRECISION
};

/**
 * Generate data points for plotting the bonding curve
 * @param params Bonding curve parameters
 * @param numPoints Number of data points to generate
 * @returns Array of [supply, price] pairs
 */
export const generateBondingCurveData = (
  params: BondingCurveParams,
  numPoints = 100
): Array<[number, number]> => {
  const { maxSupply } = params;
  const dataPoints: Array<[number, number]> = [];
  
  for (let i = 0; i < numPoints; i++) {
    const supply = (BigInt(i) * maxSupply) / BigInt(numPoints - 1);
    const price = calculateCurrentPrice(params, supply);
    
    // Convert to human-readable format
    dataPoints.push([
      Number(supply),
      Number(formatEther(price))
    ]);
  }
  
  return dataPoints;
};

/**
 * Format price for display
 * @param price Price in wei
 * @param decimals Number of decimals to display
 * @returns Formatted price string with ETH symbol
 */
export const formatPrice = (price: bigint, decimals = 4): string => {
  const ethPrice = formatEther(price);
  
  // Parse the eth price to a number and format to specified decimals
  const formattedPrice = parseFloat(ethPrice).toFixed(decimals);
  
  return `${formattedPrice} ETH`;
};

/**
 * Calculate percentage of total supply
 * @param supply Current supply
 * @param maxSupply Maximum supply
 * @returns Percentage as a string with % symbol
 */
export const calculateSupplyPercentage = (
  supply: bigint,
  maxSupply: bigint
): string => {
  if (maxSupply === BigInt(0)) return '0%';
  
  const percentage = (Number(supply) / Number(maxSupply)) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Calculate the price impact of buying or selling tokens
 * @param params Bonding curve parameters
 * @param currentSupply Current supply of the token
 * @param amount Amount of tokens to buy or sell
 * @param isBuy Whether the operation is buy (true) or sell (false)
 * @returns Price impact percentage as a string with % symbol
 */
export const calculatePriceImpact = (
  params: BondingCurveParams,
  currentSupply: bigint,
  amount: bigint,
  isBuy: boolean
): string => {
  const currentPrice = calculateCurrentPrice(params, currentSupply);
  
  let newSupply: bigint;
  if (isBuy) {
    newSupply = currentSupply + amount;
  } else {
    newSupply = currentSupply - amount;
    if (newSupply < BigInt(0)) newSupply = BigInt(0);
  }
  
  const newPrice = calculateCurrentPrice(params, newSupply);
  
  let impact: number;
  if (isBuy) {
    impact = (Number(newPrice - currentPrice) / Number(currentPrice)) * 100;
  } else {
    impact = (Number(currentPrice - newPrice) / Number(currentPrice)) * 100;
  }
  
  return `${Math.abs(impact).toFixed(2)}%`;
};

/**
 * Calculate bonding curve progress
 * @param supply Current supply
 * @param maxSupply Maximum supply
 * @returns Progress percentage (0-100)
 */
export const calculateBondingCurveProgress = (
  supply: bigint,
  maxSupply: bigint
): number => {
  if (maxSupply === BigInt(0)) return 0;
  
  return (Number(supply) / Number(maxSupply)) * 100;
};
