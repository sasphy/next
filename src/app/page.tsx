'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import { toast } from 'sonner';
import debugEnvironmentVariables from '@/lib/debug-env';
import { reloadClientEnv } from '@/lib/reload-env';
import { useQuery } from 'convex/react';
import { api } from '@/../../convex/_generated/api';
import env from '@/lib/env';
import Link from 'next/link';
import { Music, ArrowRight, Plus, Disc, Sparkles, PlusCircle, Flame, Trophy, Star, TrendingUp, Clock, Play, Pause, Volume2 } from 'lucide-react';
import Image from 'next/image';

// Import Fiesta components
import FiestaHero from '@/components/fiesta/fiesta-hero';
import FeaturedTokens from '@/components/fiesta/featured-tokens';
import TrendingTokens from '@/components/fiesta/trending-tokens';
import TokenStats from '@/components/fiesta/token-stats';

// Modern song titles with Gen Z appeal
const modernSongTitles = [
  "Digital Dreamscape", "Neon Nostalgia", "Crypto Heartbeat", "Viral Vibe", "Metaverse Melody",
  "Token Trance", "Blockchain Beats", "NFT Nocturne", "Web3 Waltz", "Decentralized Daydream",
  "Virtual Vertigo", "Protocol Pulse", "Smart Contract Serenade", "Minted Memories", "Tokenized Tempo",
  "Algorithm Anthem", "Genesis Genesis", "Hash Function Harmony", "Solana Sonata", "Consensus Cadence"
];

// Cool artist names with modern appeal
const modernArtistNames = [
  "Quantum Collective", "Blockchain Brigade", "CryptoWave", "Decentralized Dreamers", "TokenTech",
  "Solana Soundsystem", "Byte Beats", "Genesis Junction", "Digital Dynasty", "MetaVerse Maestros",
  "Web3 Warriors", "Hash Harmonics", "NFTunes", "Consensus Creators", "Chain Composers"
];

// Simple music player component for each token
const TokenMusicPlayer = ({ audioUrl, title }: { audioUrl: string, title: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e?: React.MouseEvent) => {
    // Stop propagation to prevent triggering parent link click
    if (e) {
      e.stopPropagation();
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div 
      className="token-player flex items-center justify-between p-1.5 bg-muted/30 rounded-full mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={togglePlay}
        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-background"
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <div className="text-xs truncate mx-1 flex-1 text-muted-foreground">
        {title}
      </div>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
      <Volume2 size={14} className="text-muted-foreground" />
    </div>
  );
};

export default function HomePage() {
  const { fetchTracks } = useSasphy();
  
  // Initialize with empty arrays
  const [tokenizedTracks, setTokenizedTracks] = useState<Track[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<Track[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<Track[]>([]);
  const [latestTokens, setLatestTokens] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the current network from environment
  const network = env.solanaNetwork?.toLowerCase() || 'devnet';
  
  // Fetch deployments from Convex
  const deployments = useQuery(api.tokens.getAllDeployments, { network, limit: 50 }) || [];

  // Get a truly random image for each token
  const getRandomImage = (index: number) => {
    // Use a prime number to ensure better distribution and avoid repeats
    const randomIndex = ((index * 17) % 10) + 1;
    return `/assets/album-covers/cover-${randomIndex}.jpg`;
  };

  // Get a random audio file for each token
  const getRandomAudio = (index: number) => {
    // Use a different prime number for audio to ensure it doesn't align with images
    const randomIndex = ((index * 13) % 11) + 1;
    return `/assets/audio-${randomIndex}.mp3`;
  };

  // Assign creative names to tracks with better randomization
  const assignCreativeNames = (tracks: Track[]): Track[] => {
    return tracks.map((track, index) => ({
      ...track,
      title: modernSongTitles[(index * 3) % modernSongTitles.length],
      artist: { 
        ...(typeof track.artist === 'object' ? track.artist : { id: `artist-${index}`, name: track.artist || "Unknown" }),
        name: modernArtistNames[(index * 7) % modernArtistNames.length] 
      },
      // Better randomization for images and audio
      coverArt: getRandomImage(index),
      coverImage: getRandomImage(index),
      shortAudioUrl: getRandomAudio(index),
      fullAudioUrl: getRandomAudio(index),
    }));
  };

  // Create mock tokenized tracks when no data is available
  const createMockTokenizedTracks = () => {
    console.log('Creating mock tracks');
    // Generate 25 mock tracks
    const mockTracks: Track[] = Array.from({ length: 25 }).map((_, index) => {
      // Generate a more realistic token ID that looks like a PublicKey
      const tokenId = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('').substring(0, 32);
      
      return {
        id: tokenId,
        title: modernSongTitles[(index * 3) % modernSongTitles.length],
        artist: {
          id: `artist-${index}`,
          name: modernArtistNames[(index * 7) % modernArtistNames.length]
        },
        coverArt: getRandomImage(index),
        coverImage: getRandomImage(index),
        shortAudioUrl: getRandomAudio(index),
        fullAudioUrl: getRandomAudio(index),
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
        }
      };
    });
    
    // Synchronously set state to guarantee display
    setTimeout(() => {
      setIsLoading(false);
      setTokenizedTracks(mockTracks);
      setFeaturedTokens(mockTracks.slice(0, 5));
      setTrendingTokens(mockTracks.slice(5, 15));
      setLatestTokens(mockTracks.slice(0, 6));
    }, 0);
    
    return mockTracks;
  };

  // Setup default data immediately
  useEffect(() => {
    // Create and populate immediate mock data to prevent white screen
    const defaultMockData = createMockTokenizedTracks();
    
    // Force loading to false after 1.5 seconds maximum
    const forceLoadingTimer = setTimeout(() => {
      console.log('Force setting isLoading to false after timeout');
      setIsLoading(false);
    }, 1500);
    
    // Cleanup function
    return () => {
      clearTimeout(forceLoadingTimer);
    };
  }, []);

  // Fetch tracks on component mount
  useEffect(() => {
    // Debug environment variables
    const envDebugResult = debugEnvironmentVariables();
    console.log('Environment variables debug result:', envDebugResult);
    
    // Reload client environment variables
    if (typeof window !== 'undefined') {
      reloadClientEnv();
    }
    
    // Immediately set mock data if we have no deployments (speeds up initial load)
    if (!deployments || deployments.length === 0) {
      console.log('No deployments available - immediately using mock data');
      const mockTracks = createMockTokenizedTracks();
      console.log(`Generated ${mockTracks.length} mock tracks`);
      return;
    }
    
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        let enhancedTracks: Track[] = [];
        
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
          
          // Apply creative names and use local assets
          enhancedTracks = assignCreativeNames(convertedTracks);
        }
        // Fallback to API if no deployments from Convex
        else {
          // Try to fetch from API
          let apiTracks: Track[] = [];
          try {
            apiTracks = await fetchTracks() || [];
          } catch (error) {
            console.warn('Error fetching from API, falling back to mock data', error);
            apiTracks = [];
          }
          
          if (apiTracks && apiTracks.length > 0) {
            // Convert regular tracks to tokenized tracks with mock data
            const tokenized = apiTracks.map(track => ({
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
            
            // Apply creative names and use local assets
            enhancedTracks = assignCreativeNames(tokenized);
          } else {
            // Generate mock data as last resort
            console.log('No data from API or Convex - generating mock tracks');
            enhancedTracks = createMockTokenizedTracks();
            console.log(`Generated ${enhancedTracks.length} mock tracks`);
          }
        }
        
        // Set all tokenized tracks
        setTokenizedTracks(enhancedTracks);
        
        // Sort for featured tokens (randomly for now since we don't have reliable date info)
        const featured = [...enhancedTracks].sort(() => Math.random() - 0.5).slice(0, 5);
        setFeaturedTokens(featured);
        
        // Sort for trending tokens (random for now, could be based on holders)
        const trending = [...enhancedTracks].sort(() => Math.random() - 0.5).slice(0, 10);
        setTrendingTokens(trending);
        
        // Sort for latest tokens (newest first by date)
        const latest = [...enhancedTracks].sort(() => Math.random() - 0.5).slice(0, 6);
        setLatestTokens(latest);
          
      } catch (error) {
        console.error('Error loading tracks:', error);
        toast.error('There was an error loading tokenized tracks. Please try again later.');
        
        // Generate mock data as last resort
        console.log('Error occurred - generating mock data as fallback');
        const mockTracks = createMockTokenizedTracks();
        console.log(`Generated ${mockTracks.length} mock tracks after error`);
        setTokenizedTracks(mockTracks);
        setFeaturedTokens(mockTracks.slice(0, 5));
        setTrendingTokens(mockTracks.slice(5, 15));
        setLatestTokens(mockTracks.slice(15, 21));
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks, deployments]);

  return (
    <div className="token-homepage space-y-8 pb-16">
      {/* Header with Logo and Create Button */}
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        
      <Link 
                href="/create" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium flex items-center gap-1.5 ml-3 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create
              </Link>
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.svg" 
            alt="Sasphy" 
            width={36} 
            height={36} 
            className="motion-scale-in-[0.9] motion-duration-[0.7s] invert"
          />
          <h1 className="text-xl font-display font-bold">Create Your Own Sound Token.</h1>
        </div>
      </header>
      
      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 container mx-auto pt-6">
        {/* Latest Tokens Column */}
        <section className="token-latest-section">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-display font-bold">Latest Releases</h2>
          </div>
          
          {isLoading ? (
            <div className="token-loading py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            </div>
          ) : latestTokens.length > 0 ? (
            <div className="token-latest-grid grid grid-cols-2 gap-2 motion-translate-y-in-[20px] motion-opacity-in-[0%] motion-duration-[0.6s]">
              {latestTokens.slice(0, 4).map((token, idx) => (
                <div key={token.id || idx} className="token-latest-card">
                  <Link href={`/token/${token.id}`} className="token-card music-card hover:scale-[1.02] transition-transform duration-300">
                    <div className="token-card-image aspect-square relative overflow-hidden rounded-md">
                      <img 
                        src={token.coverArt} 
                        alt={token.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-1 left-1 text-white text-xs px-1.5 py-0.5 bg-primary/80 rounded-sm">
                          ${token.currentPrice?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-xs truncate">{token.title}</h3>
                      <p className="text-muted-foreground text-xs truncate">{typeof token.artist === 'object' ? token.artist.name : token.artist}</p>
                    </div>
                  </Link>
                  <TokenMusicPlayer audioUrl={token.shortAudioUrl || ""} title={token.title} />
                </div>
              ))}
              <Link href="/token/latest" className="text-primary flex items-center gap-1 text-xs hover:underline mt-1 col-span-2">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No latest tokens found.</p>
            </div>
          )}
        </section>
        
        {/* Trending Tokens Column */}
        <section className="token-trending-section">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-display font-bold">Trending Tokens</h2>
          </div>
          
          {isLoading ? (
            <div className="token-loading py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            </div>
          ) : trendingTokens.length > 0 ? (
            <div className="token-trending-grid grid grid-cols-2 gap-2 motion-translate-y-in-[20px] motion-opacity-in-[0%] motion-duration-[0.6s]">
              {trendingTokens.slice(0, 4).map((token, idx) => (
                <div key={token.id || idx} className="token-trending-card">
                  <Link href={`/token/${token.id}`} className="token-card music-card hover:scale-[1.02] transition-transform duration-300">
                    <div className="token-card-image aspect-square relative overflow-hidden rounded-md">
                      <img 
                        src={token.coverArt} 
                        alt={token.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-1 left-1 text-white text-xs px-1.5 py-0.5 bg-primary/80 rounded-sm">
                          ${token.currentPrice?.toFixed(2)}
                        </div>
                        <div className="absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 bg-red-500/80 rounded-sm flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {Math.floor(Math.random() * 30) + 10}%
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-xs truncate">{token.title}</h3>
                      <p className="text-muted-foreground text-xs truncate">{typeof token.artist === 'object' ? token.artist.name : token.artist}</p>
                    </div>
                  </Link>
                  <TokenMusicPlayer audioUrl={token.shortAudioUrl || ""} title={token.title} />
                </div>
              ))}
              <Link href="/token/trending" className="text-primary flex items-center gap-1 text-xs hover:underline mt-1 col-span-2">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No trending tokens found.</p>
            </div>
          )}
        </section>
        
        {/* Featured Tokens Column */}
        <section className="token-featured-section">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-display font-bold">Featured Tokens</h2>
          </div>
          
          {isLoading ? (
            <div className="token-loading py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            </div>
          ) : featuredTokens.length > 0 ? (
            <div className="token-featured-grid grid grid-cols-2 gap-2 motion-translate-y-in-[20px] motion-opacity-in-[0%] motion-duration-[0.6s]">
              {featuredTokens.slice(0, 4).map((token, idx) => (
                <div key={token.id || idx} className="token-featured-card">
                  <Link href={`/token/${token.id}`} className="token-card music-card hover:scale-[1.02] transition-transform duration-300">
                    <div className="token-card-image aspect-square relative overflow-hidden rounded-md">
                      <img 
                        src={token.coverArt} 
                        alt={token.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-1 left-1 text-white text-xs px-1.5 py-0.5 bg-primary/80 rounded-sm">
                          ${token.currentPrice?.toFixed(2)}
                        </div>
                        <div className="absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 bg-yellow-500/80 rounded-sm flex items-center gap-1">
                          <Star className="h-3 w-3" /> Featured
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-xs truncate">{token.title}</h3>
                      <p className="text-muted-foreground text-xs truncate">{typeof token.artist === 'object' ? token.artist.name : token.artist}</p>
                    </div>
                  </Link>
                  <TokenMusicPlayer audioUrl={token.shortAudioUrl || ""} title={token.title} />
                </div>
              ))}
              <Link href="/token/featured" className="text-primary flex items-center gap-1 text-xs hover:underline mt-1 col-span-2">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No featured tokens found.</p>
            </div>
          )}
        </section>
      </div>
      
      {/* NOW the Hero Banner in second position */}
      <section className="token-hero-section relative overflow-hidden bg-gradient-to-b from-background/80 to-background rounded-xl mb-8">
        <div className="token-hero-content container mx-auto px-4 py-12 text-center">
          <div className="motion-translate-y-in-[-25px] motion-opacity-in-[0%] motion-duration-[0.6s] motion-ease-out mb-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 gradient-text">
              Discover & Invest in Sound Tokens
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              Own a piece of musical history with tokenized songs that increase in value as they gain popularity
            </p>
          </div>
        </div>
      </section>
      
      {/* More Trending Tokens Section */}
      <section className="token-trending-section-full pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            {/* <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <h2 className="text-xl md:text-2xl font-display font-bold">Trending Sound Tokens</h2>
            </div>
            <Link href="/token/trending" className="text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link> */}
          </div>
          
          {isLoading ? (
            <div className="token-loading py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <p className="mt-3 text-muted-foreground">Loading trending tokens...</p>
            </div>
          ) : trendingTokens.length > 0 ? (
            <div className="motion-translate-y-in-[20px] motion-opacity-in-[0%] motion-duration-[0.6s]">
              <TrendingTokens 
                tokens={trendingTokens} 
                limit={7}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trending tokens found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Token Stats Section */}
      <section className="token-stats-section py-8">
        <div className="container mx-auto px-4 motion-translate-y-in-[20px] motion-opacity-in-[0%] motion-duration-[0.7s]">
          <TokenStats />
        </div>
      </section>
      
      {/* Featured Tokens Full Section */}
      <section className="token-featured-section-full py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="token-loading py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              <p className="mt-3 text-muted-foreground">Loading featured tokens...</p>
            </div>
          ) : featuredTokens.length > 0 ? (
            <div className="motion-translate-y-in-[30px] motion-opacity-in-[0%] motion-duration-[0.7s]">
              <FeaturedTokens 
                tokens={featuredTokens} 
                title="Featured Music Tokens"
                subtitle={`Tokenized tracks on ${network.charAt(0).toUpperCase() + network.slice(1)}`}
                viewAllLink="/token/featured"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No featured tokens found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Hero Explainer Section */}
      <section className="token-explainer-section py-12">
        <div className="container mx-auto px-4 motion-translate-y-in-[40px] motion-opacity-in-[0%] motion-duration-[0.8s]">
          <FiestaHero />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="token-howworks-section py-12">
        <div className="container mx-auto px-4 motion-translate-y-in-[30px] motion-opacity-in-[0%] motion-duration-[0.7s]">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-8 text-center gradient-text">
            How Bonding Curves Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div 
                key={idx} 
                className={`token-step-card relative bg-card rounded-xl p-6 border border-border motion-translate-y-in-[25px] motion-opacity-in-[0%] motion-duration-[0.6s] motion-delay-[${idx * 0.1}s]`}
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 mt-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
