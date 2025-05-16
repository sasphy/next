import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, 
  Users, 
  Activity,
  Timer,
  ChevronRight
} from 'lucide-react';
import { Track } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { calculateCurrentPrice } from '@/lib/market-utils';

interface TokenRowProps {
  token: Track;
  rank: number;
  index: number;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, rank, index }) => {
  // Mock data - in production this would come from the blockchain
  const priceChange = Math.random() * 20 - 5; // Random number between -5 and 15
  const isPositive = priceChange > 0;
  const holders = Math.floor(Math.random() * 100) + 10;
  const supply = Math.floor(Math.random() * 1000) + 100;
  const currentPrice = calculateCurrentPrice({
    initialPrice: token.initialPrice || 0.01,
    currentSupply: supply,
    curveType: token.bondingCurve?.curveType || 'LINEAR',
    delta: token.bondingCurve?.delta || 0.01
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="group rounded-xl border border-border/40 bg-card/30 hover:bg-card/60 backdrop-blur-sm transition-all duration-300"
    >
      <Link href={`/token-factory/tokens/${token.id}`} className="grid grid-cols-12 items-center p-4 gap-2">
        <div className="col-span-1 text-muted-foreground font-medium">{rank}</div>
        
        <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-md">
            <Image 
              src={token.coverImage || '/fallback-images/track-cover.jpg'} 
              alt={token.title} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base line-clamp-1">{token.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {typeof token.artist === 'string' ? token.artist : token.artist.name}
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex col-span-2 items-center justify-start gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{holders}</span>
        </div>
        
        <div className="col-span-3 sm:col-span-2 flex items-center justify-start">
          <span className="font-medium text-right text-sm sm:text-base">{formatPrice(currentPrice)}</span>
        </div>
        
        <div className="col-span-2 flex items-center gap-1">
          <span className={`text-xs sm:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
          </span>
          <Activity className={`h-3 w-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
        </div>
      </Link>
    </motion.div>
  );
};

interface TrendingTokensProps {
  tokens: Track[];
  limit?: number;
  className?: string;
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({ 
  tokens, 
  limit = 5,
  className = '' 
}) => {
  const displayTokens = tokens?.slice(0, limit) || [];
  
  if (!tokens || tokens.length === 0) {
    return null;
  }
  
  return (
    <div className={`trending-tokens ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Trending Music Tokens</h2>
        </div>
        
        <Link 
          href="/token-factory/trending" 
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-12 items-center px-4 py-2 text-sm text-muted-foreground">
        <div className="col-span-1">#</div>
        <div className="col-span-6 sm:col-span-5">Track</div>
        <div className="hidden sm:block col-span-2">Holders</div>
        <div className="col-span-3 sm:col-span-2">Price</div>
        <div className="col-span-2">24h</div>
      </div>
      
      {/* Tokens list */}
      <div className="flex flex-col gap-2">
        {displayTokens.map((token, index) => (
          <TokenRow key={token.id} token={token} rank={index + 1} index={index} />
        ))}
      </div>
    </div>
  );
};

export default TrendingTokens; 