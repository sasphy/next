'use client';

import React, { useState, useEffect } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import { toast } from 'sonner';
import debugEnvironmentVariables from '@/lib/debug-env';
import { reloadClientEnv } from '@/lib/reload-env';

// Import Fiesta components
import FiestaHero from '@/components/fiesta/fiesta-hero';
import FeaturedTokens from '@/components/fiesta/featured-tokens';
import TrendingTokens from '@/components/fiesta/trending-tokens';
import TokenStats from '@/components/fiesta/token-stats';

export default function HomePage() {
  const { fetchTracks } = useSasphy();
  const [tokenizedTracks, setTokenizedTracks] = useState<Track[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<Track[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tracks on component mount
  useEffect(() => {
    // Debug environment variables
    const envDebugResult = debugEnvironmentVariables();
    console.log('Environment variables debug result:', envDebugResult);
    
    // Reload client environment variables
    if (typeof window !== 'undefined') {
      reloadClientEnv();
    }
    
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const allTracks = await fetchTracks();
        
        if (allTracks && allTracks.length > 0) {
          // Convert regular tracks to tokenized tracks with mock data
          const tokenized = allTracks.map(track => ({
            ...track,
            tokenized: true,
            initialPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1') || 0.1,
            currentPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1') * (1 + Math.random() * 0.5),
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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <FiestaHero />
      
      {/* Token Stats Section */}
      <div className="container mx-auto px-4">
        <TokenStats />
      </div>
      
      {/* Featured Tokens Section */}
      <div className="container mx-auto px-4">
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
            viewAllLink="/token-factory/featured"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured tokens found. Check back soon!</p>
          </div>
        )}
      </div>
      
      {/* Trending Tokens Section */}
      <div className="bg-card/30 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading trending tokens...</p>
            </div>
          ) : trendingTokens.length > 0 ? (
            <TrendingTokens 
              tokens={trendingTokens} 
              limit={7}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No trending tokens found. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-center">
          How Bonding Curves Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Early Adoption",
              description: "Early supporters pay lower prices when buying tokens, as prices start low on the bonding curve."
            },
            {
              step: "02",
              title: "Price Discovery",
              description: "As more people buy tokens, the price increases according to the bonding curve formula."
            },
            {
              step: "03",
              title: "Market Liquidity",
              description: "Tokens can be sold back to the contract at any time, following the same price curve."
            }
          ].map((item, idx) => (
            <div key={idx} className="relative bg-card rounded-xl p-8 border border-border">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
