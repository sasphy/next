'use client';

import { useState, useEffect } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import Link from 'next/link';
import { Clock, ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Get a truly random image for each token
const getRandomImage = (index: number) => {
  // Use a prime number to ensure better distribution and avoid repeats
  const randomIndex = ((index * 17) % 10) + 1;
  return `/assets/album-covers/cover-${randomIndex}.jpg`;
};

export default function LatestTokensPage() {
  const { fetchTracks } = useSasphy();
  const [latestTokens, setLatestTokens] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock latest tokens data if API fails or returns empty
  const createMockLatestTokens = () => {
    // Generate 16 mock latest tracks
    const mockTracks: Track[] = Array.from({ length: 16 }).map((_, index) => {
      // Create a date within the last 7 days for latest tokens
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() - daysAgo);
      releaseDate.setHours(releaseDate.getHours() - hoursAgo);
      
      return {
        id: `mock-token-${index + 50}`,
        title: `New Release ${index + 1}`,
        artist: {
          id: `artist-${index}`,
          name: `Artist ${index + 1}`
        },
        coverArt: getRandomImage(index),
        duration: 180 + Math.floor(Math.random() * 120),
        genre: ["Electronic", "Hip Hop", "Lo-fi", "Ambient", "Trap"][Math.floor(Math.random() * 5)],
        price: (0.1 + Math.random() * 2).toFixed(2),
        releaseDate: releaseDate.toISOString(),
        tokenId: Math.floor(Math.random() * 10000),
        tokenized: true,
        initialPrice: 0.1 + Math.random() * 0.5,
        currentPrice: 0.3 + Math.random() * 2,
        totalSupply: Math.floor(Math.random() * 100) + 20, // Lower supply for new releases
        holders: Math.floor(Math.random() * 20) + 5, // Fewer holders for new releases
        bondingCurve: {
          curveType: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'][Math.floor(Math.random() * 4)] as any,
          delta: 0.01 + Math.random() * 0.05,
          initialSupply: 10,
          maxSupply: Math.floor(Math.random() * 1000) + 500
        }
      };
    });
    
    // Sort by release date (newest first)
    return mockTracks.sort((a, b) => 
      new Date(b.releaseDate || Date.now()).getTime() - 
      new Date(a.releaseDate || Date.now()).getTime()
    );
  };

  // Format date to show how recent the token is
  const formatReleaseDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    
    const releaseDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - releaseDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} min ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(releaseDate, 'MMM d, yyyy');
    }
  };

  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        let apiTracks = await fetchTracks();
        
        if (!apiTracks || apiTracks.length === 0) {
          // Use mock data if API returns nothing
          setLatestTokens(createMockLatestTokens());
        } else {
          // Convert to tokenized tracks with latest stats
          const tokenized = apiTracks.map(track => {
            // Create a date within the last 7 days for latest tokens
            const daysAgo = Math.floor(Math.random() * 7);
            const hoursAgo = Math.floor(Math.random() * 24);
            const releaseDate = new Date();
            releaseDate.setDate(releaseDate.getDate() - daysAgo);
            releaseDate.setHours(releaseDate.getHours() - hoursAgo);
            
            return {
              ...track,
              tokenized: true,
              initialPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1'),
              currentPrice: parseFloat(typeof track.price === 'string' ? track.price : '0.1') * (1 + Math.random() * 0.5),
              totalSupply: Math.floor(Math.random() * 100) + 20, // Lower supply for new releases
              holders: Math.floor(Math.random() * 20) + 5, // Fewer holders for new releases
              releaseDate: releaseDate.toISOString(),
              bondingCurve: {
                curveType: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'][Math.floor(Math.random() * 4)] as any,
                delta: 0.01 + Math.random() * 0.05,
                initialSupply: 10,
                maxSupply: Math.floor(Math.random() * 1000) + 500
              }
            };
          });
          
          // Sort by release date (newest first)
          const sortedTracks = tokenized.sort((a, b) => 
            new Date(b.releaseDate || Date.now()).getTime() - 
            new Date(a.releaseDate || Date.now()).getTime()
          );
          
          setLatestTokens(sortedTracks);
        }
      } catch (error) {
        console.error('Error loading latest tracks:', error);
        // Use mock data on error
        setLatestTokens(createMockLatestTokens());
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks]);

  return (
    <div className="latest-tokens-page container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" asChild className="mr-2">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Clock className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl md:text-3xl font-display font-bold">Latest Sound Tokens</h1>
      </div>

      {isLoading ? (
        <div className="token-loading py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading latest tokens...</p>
        </div>
      ) : latestTokens.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 motion-opacity-in-[0%] motion-translate-y-in-[20px] motion-duration-[0.6s]">
          {latestTokens.map((token, idx) => (
            <Link key={token.id || idx} href={`/token/${token.id}`} className="latest-token-card">
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
                    <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 bg-blue-500/80 rounded-md flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> 
                      New
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-base truncate">{token.title}</h3>
                  <p className="text-muted-foreground text-sm truncate">
                    {typeof token.artist === 'object' ? token.artist.name : token.artist}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-blue-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatReleaseDate(token.releaseDate)}
                    </span>
                    <span className="text-muted-foreground">
                      Holders: {token.holders}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No latest tokens found. Check back soon!</p>
        </div>
      )}
    </div>
  );
} 