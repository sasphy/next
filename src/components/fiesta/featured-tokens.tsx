import React from 'react';
import { Track } from '@/lib/types';
import TokenizedTrackCard from './tokenized-track-card';
import { TrendingUp, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface FeaturedTokensProps {
  tokens: Track[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

const FeaturedTokens: React.FC<FeaturedTokensProps> = ({ 
  tokens, 
  title = "Featured Tokens", 
  subtitle,
  viewAllLink = "/token-factory",
  className = ''
}) => {
  if (!tokens || tokens.length === 0) {
    return null;
  }

  // Show the first token with a chart and the rest as cards
  const [featuredToken, ...restTokens] = tokens;

  return (
    <section className={`fiesta-featured-tokens ${className}`}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md bg-card border border-border hover:bg-card/80 transition-colors" aria-label="Filter tokens">
            <Filter className="h-4 w-4" />
          </button>
          <Link 
            href={viewAllLink}
            className="group flex items-center gap-1 text-primary hover:underline"
          >
            View All 
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Featured token with chart */}
        <div className="featured-token mb-6">
          <TokenizedTrackCard 
            track={featuredToken} 
            index={0} 
            showChart={true} 
          />
        </div>

        {/* Grid of other tokens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restTokens.map((token, index) => (
            <TokenizedTrackCard 
              key={token.id} 
              track={token} 
              index={index + 1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTokens; 