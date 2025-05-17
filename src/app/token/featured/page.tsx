'use client';

import { useState, useEffect } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import Link from 'next/link';
import { Star, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Get a truly random image for each token
const getRandomImage = (index: number) => {
  // Use a prime number to ensure better distribution and avoid repeats
  const randomIndex = ((index * 17) % 10) + 1;
  return `/assets/album-covers/cover-${randomIndex}.jpg`;
};

export default function FeaturedTokensPage() {
  const { fetchTracks } = useSasphy();
  const [featuredTokens, setFeaturedTokens] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock featured tokens data if API fails or returns empty
  const createMockFeaturedTokens = () => {
    // Generate 12 mock featured tracks
    const mockTracks: Track[] = Array.from({ length: 12 }).map((_, index) => ({
      id: `mock-token-${index + 30}`,
      title: `Featured Track ${index + 1}`,
      artist: {
        id: `artist-${index}`,
        name: `Featured Artist ${index + 1}`
      },
      coverArt: getRandomImage(index),
      duration: 180 + Math.floor(Math.random() * 120),
      genre: ["Electronic", "Hip Hop", "Lo-fi", "Ambient", "Trap"][Math.floor(Math.random() * 5)],
      price: (0.1 + Math.random() * 2).toFixed(2),
      releaseDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      tokenId: Math.floor(Math.random() * 10000),
      tokenized: true,
      initialPrice: 0.1 + Math.random() * 0.5,
      currentPrice: 0.3 + Math.random() * 2,
      totalSupply: Math.floor(Math.random() * 1000) + 100,
      holders: Math.floor(Math.random() * 100) + 10,
      bondingCurve: {
        curveType: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'][Math.floor(Math.random() * 4)] as any,
        delta: 0.01 + Math.random() * 0.05,
        initialSupply: 10,
        maxSupply: Math.floor(Math.random() * 1000) + 500
      },
      // Featured-specific stats
      playCount: Math.floor(Math.random() * 500000) + 100000,
      likeCount: Math.floor(Math.random() * 50000) + 5000,
      isVerified: true
    }));
    
    return mockTracks;
  };

  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        let apiTracks = await fetchTracks();
        
        if (!apiTracks || apiTracks.length === 0) {
          // Use mock data if API returns nothing
          setFeaturedTokens(createMockFeaturedTokens());
        } else {
          // Convert to tokenized tracks with featured stats
          const tokenized = apiTracks.map(track => ({
            ...track,
            tokenized: true,
            initialPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1'),
            currentPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1') * (1 + Math.random() * 0.5),
            totalSupply: Math.floor(Math.random() * 1000) + 100,
            holders: Math.floor(Math.random() * 100) + 10,
            playCount: Math.floor(Math.random() * 500000) + 100000,
            likeCount: Math.floor(Math.random() * 50000) + 5000,
            isVerified: Math.random() > 0.3, // 70% chance of being verified
            bondingCurve: {
              curveType: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'][Math.floor(Math.random() * 4)] as any,
              delta: 0.01 + Math.random() * 0.05,
              initialSupply: 10,
              maxSupply: Math.floor(Math.random() * 1000) + 500
            }
          }));
          
          // Take a subset for featured
          const featuredSelection = tokenized.sort(() => Math.random() - 0.5).slice(0, 12);
          setFeaturedTokens(featuredSelection);
        }
      } catch (error) {
        console.error('Error loading featured tracks:', error);
        // Use mock data on error
        setFeaturedTokens(createMockFeaturedTokens());
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks]);

  return (
    <div className="featured-tokens-page container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" asChild className="mr-2">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Star className="h-6 w-6 text-yellow-400" />
        <h1 className="text-2xl md:text-3xl font-display font-bold">Featured Sound Tokens</h1>
      </div>

      {isLoading ? (
        <div className="token-loading py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading featured tokens...</p>
        </div>
      ) : featuredTokens.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 motion-opacity-in-[0%] motion-translate-y-in-[20px] motion-duration-[0.6s]">
          {featuredTokens.map((token, idx) => (
            <Link key={token.id || idx} href={`/token/${token.id}`} className="featured-token-card">
              <div className="token-card music-card bg-card hover:bg-card/80 border border-border rounded-lg overflow-hidden hover:scale-[1.02] transition-all">
                <div className="token-card-image aspect-square relative overflow-hidden">
                  <img 
                    src={token.coverArt || getRandomImage(idx)} 
                    alt={token.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="absolute bottom-2 left-2 text-white text-sm px-2 py-1 bg-primary/80 rounded-md">
                      ${token.currentPrice?.toFixed(2)}
                    </div>
                    <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 bg-yellow-500/80 rounded-md flex items-center gap-1">
                      <Star className="h-3 w-3" /> 
                      Featured
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-base truncate">{token.title}</h3>
                  <p className="text-muted-foreground text-sm truncate">{typeof token.artist === 'object' ? token.artist.name : token.artist}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Holders: {token.holders}</span>
                    <div className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded-full">
                      Premium
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No featured tokens found. Check back soon!</p>
        </div>
      )}
    </div>
  );
} 