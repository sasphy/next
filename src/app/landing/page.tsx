'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { Track } from '@/lib/types';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Music, Play, ArrowRight, Sparkles, Trophy, Headphones, Zap, 
  TrendingUp, Star, Heart, Disc, Wand2, Bookmark, Volume2 } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Component for the animated waveform visualization
const AudioWaveform = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="audio-waveform flex items-center gap-[3px]">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="bg-primary rounded-full w-1"
        initial={{ height: 4 }}
        animate={{
          height: isPlaying ? [8, 16, 24, 16, 8] : 4
        }}
        transition={{
          duration: 1.2,
          repeat: isPlaying ? Infinity : 0,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Component for animated track card
const TrackCard = ({ track, index }: { track: Track, index: number }) => {
  const { playTrack, currentlyPlaying } = useSasphy();
  const isCurrentTrack = currentlyPlaying.track?.id === track.id;
  const isPlaying = isCurrentTrack && currentlyPlaying.isPlaying;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack(track);
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="music-card group relative overflow-hidden"
    >
      <Link href={`/tracks/${track.id}`} className="block">
        <div className="music-card-image overflow-hidden rounded-t-xl">
          <Image 
            src={track.coverImage || "/assets/album-1.jpg"} 
            alt={track.title} 
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        </div>
        
        {/* Music player controls overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handlePlayClick}
            className="play-button bg-primary/90 text-primary-foreground rounded-full p-4 transform scale-90 hover:scale-100 transition-all shadow-xl z-10"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <div className="h-6 w-6 flex items-center justify-center">
                <AudioWaveform isPlaying={true} />
              </div>
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
        </div>
        
        <div className="music-card-content z-10 relative">
          <h3 className="music-title">{track.title}</h3>
          <p className="music-artist">{typeof track.artist === 'string' ? track.artist : track.artist.name}</p>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="music-price font-medium">
                {formatPrice(track.price)}
              </span>
              {track.duration && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(track.duration)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {track.likeCount && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {track.likeCount}
                </span>
              )}
              {track.editionCount !== undefined && track.maxEditions !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {track.editionCount}/{track.maxEditions}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Component for the 3D rotating disc visualization
const RotatingDisc = () => {
  return (
    <div className="rotating-disc-container relative w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
      <motion.div 
        className="absolute inset-0"
        animate={{ rotateY: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 shadow-lg shadow-primary/20 flex items-center justify-center">
          <div className="h-[30%] w-[30%] rounded-full bg-background/90 flex items-center justify-center">
            <div className="h-[30%] w-[30%] rounded-full bg-foreground"></div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="absolute top-[10%] right-[5%] h-16 w-16 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
        animate={{
          y: [0, 10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image 
          src="/assets/album-1.jpg" 
          alt="Album art" 
          width={100} 
          height={100} 
          className="w-full h-full object-cover"
        />
      </motion.div>
      <motion.div 
        className="absolute bottom-[15%] left-[10%] h-14 w-14 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
        animate={{
          y: [0, -8, 0],
          rotate: [0, -3, 0]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Image 
          src="/assets/album-2.jpg" 
          alt="Album art" 
          width={100} 
          height={100} 
          className="w-full h-full object-cover"
        />
      </motion.div>
      <motion.div 
        className="absolute bottom-[20%] right-[15%] h-12 w-12 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
        animate={{
          y: [0, 5, 0],
          rotate: [0, -2, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Image 
          src="/assets/album-3.jpg" 
          alt="Album art" 
          width={100} 
          height={100} 
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
};

// Clock icon component
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function HomePage() {
  const { isWalletConnected, isAuthenticated, signIn } = useWalletAuth();
  const { fetchTracks, playTrack } = useSasphy();
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });

  // Fetch tracks on component mount
  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const allTracks = await fetchTracks();
        
        // Simulate different categories until API supports them
        if (allTracks && allTracks.length > 0) {
          // Sort by different criteria to simulate categories
          const featured = [...allTracks].sort(() => 0.5 - Math.random()).slice(0, 6);
          setFeaturedTracks(featured);
          
          const trending = [...allTracks].sort((a, b) => {
            const aPopularity = a.likeCount || Math.random() * 1000;
            const bPopularity = b.likeCount || Math.random() * 1000;
            return bPopularity - aPopularity;
          }).slice(0, 8);
          setTrendingTracks(trending);
          
          const newest = [...allTracks].sort((a, b) => {
            const aDate = a.created ? new Date(a.created).getTime() : Date.now() - Math.random() * 10000000;
            const bDate = b.created ? new Date(b.created).getTime() : Date.now() - Math.random() * 10000000;
            return bDate - aDate;
          }).slice(0, 4);
          setNewReleases(newest);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        toast.error('There was an error loading tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [fetchTracks]);
  
  const handlePlayAll = (tracks: Track[]) => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
      toast.success('Playing all tracks');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className="relative min-h-[85vh] flex flex-col items-center justify-center py-16 overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background z-10" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_50%)]" />
          <motion.div 
            className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] rounded-full bg-primary/10 blur-3xl"
            animate={{ 
              x: [0, 200, 0], 
              y: [0, 150, 0] 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute -bottom-[300px] -right-[300px] w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl"
            animate={{ 
              x: [0, -100, 0], 
              y: [0, -100, 0] 
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: .7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight">
                <span className="solana-gradient block">Elevate Your</span>
                <span className="block">Music Experience</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                Sasphy reimagines music discovery and ownership on Solana blockchain. Support artists directly and curate your sonic identity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/discover"
                  className="solana-button flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                    Start Discovering
                  </span>
                  <motion.span 
                    className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 to-purple-600/80"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </Link>
                <Link 
                  href="/tracks"
                  className="button-outline flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Browse Catalog
                  </span>
                  <motion.span 
                    className="absolute inset-0 z-0 bg-primary/10"
                    initial={{ y: "-100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                {[
                  { value: "50K+", label: "Tracks" },
                  { value: "15K+", label: "Artists" },
                  { value: "3.2M+", label: "Listeners" }
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx} 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  >
                    <h3 className="text-2xl md:text-3xl font-bold solana-gradient">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="hidden lg:flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <RotatingDisc />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* New Releases Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold">
            New Releases
          </h2>
          <Link 
            href="/tracks/new"
            className="text-primary flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="music-card animate-pulse">
                <div className="aspect-square rounded-xl music-card-image bg-secondary/50" />
                <div className="music-card-content">
                  <div className="h-5 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary/50 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-secondary/50 rounded w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : newReleases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newReleases.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No new releases found. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-display font-bold mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Sasphy?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Headphones className="h-6 w-6 text-primary" />,
                title: "Premium Audio Quality",
                description: "Experience studio-quality sound with our high-definition audio streaming technology."
              },
              {
                icon: <Zap className="h-6 w-6 text-primary" />,
                title: "True Music Ownership",
                description: "Own your favorite tracks powered by Solana blockchain, supporting artists directly."
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-primary" />,
                title: "Social Influence System",
                description: "Build your reputation as a music curator and earn rewards for discovering trends early."
              },
              {
                icon: <Wand2 className="h-6 w-6 text-primary" />,
                title: "AI-Enhanced Discovery",
                description: "Find your next favorite track with our intelligent recommendation engine."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tracks Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trending Now
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handlePlayAll(trendingTracks)}
              className="py-2 px-3 rounded-full bg-primary/20 text-primary flex items-center gap-1 hover:bg-primary/30 transition-colors"
            >
              <Play className="h-4 w-4" /> Play All
            </button>
            <Link 
              href="/tracks/trending"
              className="text-primary flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="music-card animate-pulse">
                <div className="aspect-square rounded-xl music-card-image bg-secondary/50" />
                <div className="music-card-content">
                  <div className="h-5 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary/50 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-secondary/50 rounded w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trending tracks found. Check back soon!</p>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-12 text-center">
          How Sasphy Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Discover",
              icon: <Disc className="h-8 w-8 text-primary" />,
              description: "Explore a vast catalog of music from independent artists and major labels, all in high-definition audio."
            },
            {
              step: "02",
              title: "Collect",
              icon: <Bookmark className="h-8 w-8 text-primary" />,
              description: "Purchase your favorite tracks as digital assets on Solana, giving you true ownership and supporting artists."
            },
            {
              step: "03",
              title: "Influence",
              icon: <Star className="h-8 w-8 text-primary" />,
              description: "Build your reputation as a tastemaker and earn rewards when tracks you discovered early become popular."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {item.step}
              </div>
              <div className="bg-card rounded-xl p-8 pt-10 border border-border h-full">
                <div className="mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {idx < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Tracks Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-primary" />
            Featured Artists
          </h2>
          <Link 
            href="/artists"
            className="text-primary flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="music-card animate-pulse">
                <div className="aspect-square rounded-xl music-card-image bg-secondary/50" />
                <div className="music-card-content">
                  <div className="h-5 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary/50 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-secondary/50 rounded w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured tracks found. Check back soon!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-16">
        <motion.div 
          className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm rounded-2xl p-10 text-center border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated background elements */}
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5] 
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 relative z-10">
            Ready to experience the future of music?
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8 relative z-10">
            Connect your Solana wallet to start discovering, collecting, and enjoying music like never before.
          </p>
          
          <div className="relative z-10">
            {isWalletConnected ? (
              isAuthenticated ? (
                <Link 
                  href="/discover"
                  className="solana-button inline-flex items-center justify-center gap-2 text-lg px-8 py-3"
                >
                  <Sparkles className="h-5 w-5" />
                  Discover Music
                </Link>
              ) : (
                <button 
                  onClick={signIn}
                  className="solana-button inline-flex items-center justify-center gap-2 text-lg px-8 py-3"
                >
                  Sign In
                </button>
              )
            ) : (
              <div className="max-w-md mx-auto bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border">
                <p className="text-accent-foreground mb-2">
                  Connect your wallet using the button in the navigation bar to get started.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't have a Solana wallet yet? We recommend <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Phantom</a> or <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Solflare</a>.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
