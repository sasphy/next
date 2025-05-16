'use client';

import React, { useState, useEffect } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import { toast } from 'sonner';
import TrendingTokens from '@/components/fiesta/trending-tokens';
import FeaturedTokens from '@/components/fiesta/featured-tokens';

export default function ExploreTokensPage() {
  const { fetchTracks } = useSasphy();
  const [tokenizedTracks, setTokenizedTracks] = useState<Track[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<Track[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tracks on component mount
  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const allTracks = await fetchTracks();
        
        if (allTracks && allTracks.length > 0) {
          // Convert regular tracks to tokenized tracks with mock data
          const tokenized = allTracks.map(track => ({
            ...track,
            tokenized: true,
            initialPrice: parseFloat(track.price) || 0.1,
            currentPrice: parseFloat(track.price) * (1 + Math.random() * 0.5),
            totalSupply: Math.floor(Math.random() * 1000) + 100,
            holders: Math.floor(Math.random() * 100) + 10,
            bondingCurve: {
              curveType: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'][Math.floor(Math.random() * 4)] as any,
              delta: 0.01 + Math.random() * 0.05,
              initialSupply: 10,
              maxSupply: Math.floor(Math.random() * 1000) + 500
            }
          }));
          
          // Set all tokenized tracks
          setTokenizedTracks(tokenized);
          
          // Sort for featured tokens (most expensive)
          const featured = [...tokenized].sort((a, b) => {
            return (b.currentPrice || 0) - (a.currentPrice || 0);
          }).slice(0, 5);
          setFeaturedTokens(featured);
          
          // Sort for trending tokens (most holders)
          const trending = [...tokenized].sort((a, b) => {
            return (b.holders || 0) - (a.holders || 0);
          }).slice(0, 10);
          setTrendingTokens(trending);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        toast.error('There was an error loading tokenized tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Explore Music Tokens</h1>
        <p className="text-muted-foreground">
          Discover and invest in music tokens with bonding curve economics. Support artists and earn as their popularity grows.
        </p>
      </div>
      
      {/* Featured Tokens Section */}
      <div>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading tokenized tracks...</p>
          </div>
        ) : featuredTokens.length > 0 ? (
          <FeaturedTokens 
            tokens={featuredTokens} 
            title="Featured Music Tokens"
            subtitle="Tokenized tracks with the most potential"
            viewAllLink="/token/featured"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured tokens found. Check back soon!</p>
          </div>
        )}
      </div>
      
      {/* Trending Tokens Section */}
      <div className="pb-8">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading trending tokens...</p>
          </div>
        ) : trendingTokens.length > 0 ? (
          <TrendingTokens 
            tokens={trendingTokens} 
            limit={10}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trending tokens found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
} 