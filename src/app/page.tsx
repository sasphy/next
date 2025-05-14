'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { useSolBeat } from '@/components/providers/solbeat-provider';
import { Track } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Music, Play, ArrowRight, Sparkles, Trophy } from 'lucide-react';

export default function HomePage() {
  const { isWalletConnected, isAuthenticated, signIn } = useWalletAuth();
  const { fetchTracks } = useSolBeat();
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tracks on component mount
  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const tracks = await fetchTracks();
        setFeaturedTracks(tracks.slice(0, 6)); // Just take the first 6 tracks
      } catch (error) {
        console.error('Error loading tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 rounded-2xl bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 backdrop-blur-sm">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
          <span className="solana-gradient">Discover, Collect & Own</span>
          <br />
          <span className="text-foreground">Your Favorite Music</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-8 text-foreground/80">
          SolBeat empowers artists and fans with Web3 technology on Solana.
          Own your music as NFTs and support creators directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/discover"
            className="solana-button text-center flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Start Discovering
          </Link>
          <Link 
            href="/tracks"
            className="button-outline flex items-center justify-center gap-2"
          >
            <Music className="h-5 w-5" />
            Browse All Tracks
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
          Why SolBeat?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">True Music Ownership</h3>
            <p className="text-muted-foreground">
              Own your favorite tracks as NFTs on the Solana blockchain, giving you true digital ownership and supporting artists directly.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Early Vibe Rewards</h3>
            <p className="text-muted-foreground">
              Discover tracks early and earn EV (Early Vibe) points when they become popular. Be rewarded for your curation skills.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Social Influence</h3>
            <p className="text-muted-foreground">
              Build your reputation as a music curator with our leaderboard system. Showcase your taste and influence.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tracks Section */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold">
            Featured Tracks
          </h2>
          <Link 
            href="/tracks"
            className="text-primary flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="music-card animate-pulse">
                <div className="music-card-image bg-secondary/50" />
                <div className="music-card-content">
                  <div className="h-5 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary/50 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-secondary/50 rounded w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTracks.map((track) => (
              <Link 
                key={track.id} 
                href={`/tracks/${track.id}`}
                className="music-card group"
              >
                <div className="music-card-image">
                  <img 
                    src={track.coverImage} 
                    alt={track.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-primary rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <div className="music-card-content">
                  <h3 className="music-title">{track.title}</h3>
                  <p className="music-artist">{track.artist}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="music-price">
                      {formatPrice(track.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {track.editionCount}/{track.maxEditions} owned
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tracks found. Check back soon!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-card rounded-2xl p-8 text-center border border-border">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
          Ready to dive in?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Connect your Solana wallet to start discovering and collecting music NFTs. Support your favorite artists and earn rewards.
        </p>
        {isWalletConnected ? (
          isAuthenticated ? (
            <Link 
              href="/discover"
              className="solana-button inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Discover Music
            </Link>
          ) : (
            <button 
              onClick={signIn}
              className="solana-button inline-flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          )
        ) : (
          <p className="text-accent-foreground">
            Connect your wallet using the button in the navigation bar to get started.
          </p>
        )}
      </section>
    </div>
  );
}
