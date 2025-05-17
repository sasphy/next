'use client';

import React, { useState, useEffect } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import { toast } from 'sonner';
import debugEnvironmentVariables from '@/lib/debug-env';
import { reloadClientEnv } from '@/lib/reload-env';
import { useQuery } from 'convex/react';
import { api } from '@/../../convex/_generated/api';
import env from '@/lib/env';

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
  
  // Get the current network from environment
  const network = env.solanaNetwork?.toLowerCase() || 'devnet';
  
  // Fetch deployments from Convex
  const deployments = useQuery(api.tokens.getAllDeployments, { network, limit: 50 }) || [];

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
        // If we have deployments from Convex, use those as the primary data source
        if (deployments && deployments.length > 0) {
          console.log(`Loaded ${deployments.length} deployments from Convex`);
          
          // Convert deployments to Track objects
          const convertedTracks: Track[] = deployments.map(deployment => ({
            id: deployment.tokenAddress,
            title: deployment.title,
            artist: { id: deployment.walletAddress, name: deployment.artist },
            coverArt: deployment.imageUrl,
            duration: 180, // default value
            genre: "Music",
            price: deployment.initialPrice.toString(),
            releaseDate: new Date().toISOString(), // Use current time as fallback
            tokenId: parseInt(deployment.tokenAddress.slice(-4), 16) || Math.floor(Math.random() * 10000),
            shortAudioUrl: deployment.audioUrl,
            fullAudioUrl: deployment.audioUrl,
            tokenized: true,
            initialPrice: deployment.initialPrice,
            currentPrice: deployment.initialPrice * (1 + Math.random() * 0.5),
            totalSupply: Math.floor(Math.random() * 1000) + 100,
            holders: Math.floor(Math.random() * 100) + 10,
            bondingCurve: {
              curveType: deployment.curveType as any,
              delta: deployment.delta,
              initialSupply: 10,
              maxSupply: Math.floor(Math.random() * 1000) + 500
            },
            metadata: {
              metadataUrl: deployment.metadataUrl
            }
          }));
          
          // Set all tokenized tracks
          setTokenizedTracks(convertedTracks);
          
          // Sort for featured tokens (randomly for now since we don't have reliable date info)
          const featured = [...convertedTracks].sort(() => Math.random() - 0.5).slice(0, 5);
          setFeaturedTokens(featured);
          
          // Sort for trending tokens (random for now, could be based on holders)
          const trending = [...convertedTracks].sort(() => Math.random() - 0.5).slice(0, 10);
          setTrendingTokens(trending);
        }
        // Fallback to API if no deployments from Convex
        else {
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
            
            // Sort for featured tokens (randomly for now since we don't have reliable date info)
            const featured = [...tokenized].sort(() => Math.random() - 0.5).slice(0, 5);
            setFeaturedTokens(featured);
            
            // Sort for trending tokens (random for now, could be based on holders)
            const trending = [...tokenized].sort(() => Math.random() - 0.5).slice(0, 10);
            setTrendingTokens(trending);
          }
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        toast.error('There was an error loading tokenized tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks, deployments]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <FiestaHero />
      
      {/* Token Stats Section */}
      <div className="w-full px-4">
        <TokenStats />
      </div>
      
      {/* Featured Tokens Section */}
      <div className="w-full px-4">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading tokenized tracks...</p>
          </div>
        ) : featuredTokens.length > 0 ? (
          <FeaturedTokens 
            tokens={featuredTokens} 
            title="Featured Music Tokens"
            subtitle={`Tokenized tracks on ${network.charAt(0).toUpperCase() + network.slice(1)}`}
            viewAllLink="/token/featured"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured tokens found. Check back soon!</p>
          </div>
        )}
      </div>
      
      {/* Trending Tokens Section */}
      <div className="bg-card/30 backdrop-blur-sm py-12">
        <div className="w-full px-4">
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
      <div className="w-full px-4 py-12">
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
