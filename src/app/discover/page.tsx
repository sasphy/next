'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Track } from '@/lib/types';
import { Disc, Clock, Search, RotateCcw, Headphones, Play, Pause, Heart, Share2, ExternalLink, Plus, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useMusicPlayer } from '@/components/music/music-player-context';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDuration, truncateAddress } from '@/lib/utils';

// Placeholder data until we connect to the real API
const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Digital Dreams',
    artist: 'CryptoBeats',
    coverImage: '/assets/album-1.jpg',
    previewUrl: '/assets/audio-1.mp3',
    fullAudioUrl: '/assets/audio-1.mp3',
    description: 'An electronic journey through digital landscapes',
    price: '0.5',
    priceLabel: 'SOL',
    releaseDate: '2025-04-01',
    duration: 210, // seconds
    likeCount: 423,
    editionCount: 15,
    maxEditions: 100,
    tags: ['Electronic', 'Ambient', 'Chillwave'],
    mintAddress: '7KqpRwzkkeweW5jQuq21SS3FYVARpLdwTKcUQKMW9PhQ'
  },
  {
    id: '2',
    title: 'Blockchain Beats',
    artist: 'SOL Serenade',
    coverImage: '/assets/album-2.jpg',
    previewUrl: '/assets/audio-2.mp3',
    fullAudioUrl: '/assets/audio-2.mp3',
    description: 'Bass-heavy beats with a crypto twist',
    price: '0.8',
    priceLabel: 'SOL',
    releaseDate: '2025-03-15',
    duration: 180,
    likeCount: 256,
    editionCount: 5,
    maxEditions: 50,
    tags: ['Trap', 'Hip-Hop', 'Bass'],
    mintAddress: '9KqpRwzkkeweW5jQrr21SS3FYVARpLdwTKcUQKMW9PhS'
  },
  {
    id: '3',
    title: 'Solana Sunset',
    artist: 'Chain Harmony',
    coverImage: '/assets/album-3.jpg',
    previewUrl: '/assets/audio-3.mp3',
    fullAudioUrl: '/assets/audio-3.mp3',
    description: 'Relaxing melodies inspired by blockchain technology',
    price: '0.3',
    priceLabel: 'SOL',
    releaseDate: '2025-04-10',
    duration: 240,
    likeCount: 189,
    editionCount: 30,
    maxEditions: 100,
    tags: ['Lo-Fi', 'Chill', 'Instrumental'],
    mintAddress: '5KqpRwzkkeweW5jQfg21SS3FYVARpLdwTKcUQKMW9PhF'
  },
  {
    id: '4',
    title: 'Crypto Carnival',
    artist: 'Token Titans',
    coverImage: '/assets/album-4.jpg',
    previewUrl: '/assets/audio-4.mp3',
    fullAudioUrl: '/assets/audio-4.mp3',
    description: 'High-energy dance music for crypto enthusiasts',
    price: '1.2',
    priceLabel: 'SOL',
    releaseDate: '2025-02-28',
    duration: 195,
    likeCount: 512,
    editionCount: 25,
    maxEditions: 75,
    tags: ['EDM', 'Dance', 'House'],
    mintAddress: '3KqpRwzkkeweW5jQhj21SS3FYVARpLdwTKcUQKMW9PhD'
  },
  {
    id: '5',
    title: 'Decentralized Disco',
    artist: 'CryptoBeats',
    coverImage: '/assets/album-5.jpg',
    previewUrl: '/assets/audio-5.mp3',
    fullAudioUrl: '/assets/audio-5.mp3',
    description: 'Funky disco tunes with a modern blockchain twist',
    price: '0.6',
    priceLabel: 'SOL',
    releaseDate: '2025-03-22',
    duration: 225,
    likeCount: 367,
    editionCount: 18,
    maxEditions: 50,
    tags: ['Disco', 'Funk', 'Electronic'],
    mintAddress: '2KqpRwzkkeweW5jQty21SS3FYVARpLdwTKcUQKMW9PhL'
  },
  {
    id: '6',
    title: 'NFT Nightclub',
    artist: 'Digital Drops',
    coverImage: '/assets/album-6.jpg',
    previewUrl: '/assets/audio-6.mp3',
    fullAudioUrl: '/assets/audio-6.mp3',
    description: 'Late night vibes for the crypto crowd',
    price: '0.9',
    priceLabel: 'SOL',
    releaseDate: '2025-04-05',
    duration: 260,
    likeCount: 428,
    editionCount: 12,
    maxEditions: 50,
    tags: ['Techno', 'Deep House', 'Progressive'],
    mintAddress: '6KqpRwzkkeweW5jQop21SS3FYVARpLdwTKcUQKMW9PhK'
  },
  {
    id: '7',
    title: 'Hashrate Harmony',
    artist: 'Miner Melodies',
    coverImage: '/assets/album-7.jpg',
    previewUrl: '/assets/audio-7.mp3',
    fullAudioUrl: '/assets/audio-7.mp3',
    description: 'Smooth jazz inspired by blockchain mining',
    price: '0.4',
    priceLabel: 'SOL',
    releaseDate: '2025-03-10',
    duration: 215,
    likeCount: 296,
    editionCount: 8,
    maxEditions: 25,
    tags: ['Jazz', 'Smooth', 'Instrumental'],
    mintAddress: '8KqpRwzkkeweW5jQmn21SS3FYVARpLdwTKcUQKMW9PhM'
  },
  {
    id: '8',
    title: 'Validator Vibes',
    artist: 'SOL Serenade',
    coverImage: '/assets/album-8.jpg',
    previewUrl: '/assets/audio-8.mp3',
    fullAudioUrl: '/assets/audio-8.mp3',
    description: 'Electronic beats celebrating Solana validators',
    price: '0.7',
    priceLabel: 'SOL',
    releaseDate: '2025-04-15',
    duration: 230,
    likeCount: 342,
    editionCount: 22,
    maxEditions: 75,
    tags: ['Electronic', 'Ambient', 'Experimental'],
    mintAddress: '4KqpRwzkkeweW5jQkl21SS3FYVARpLdwTKcUQKMW9PhX'
  }
];

// TrackCard component
const TrackCard = ({ track, onClick }: { track: Track; onClick: () => void }) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <motion.div 
      className="bg-black bg-opacity-40 rounded-xl overflow-hidden border border-purple-900/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-900/20"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/tracks/${track.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {track.coverImage ? (
            <img 
              src={track.coverImage} 
              alt={track.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
              <Disc size={48} className="text-purple-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80" />
          
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Play track"
          >
            <div className="bg-purple-600 rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg">
              <Headphones size={24} className="text-white" />
            </div>
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{track.title}</h3>
          <p className="text-purple-300 text-sm truncate">{typeof track.artist === 'string' ? track.artist : track.artist.name}</p>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center text-sm text-purple-200 font-medium">
              {track.price} {track.priceLabel}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(track.duration! / 60)}:{(track.duration! % 60).toString().padStart(2, '0')}
              </div>
              
              {track.editionCount !== undefined && track.maxEditions !== undefined && (
                <div className="text-xs text-gray-400">
                  {track.editionCount}/{track.maxEditions}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// FilterTag component
const FilterTag = ({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) => (
  <button
    className={`px-3 py-1 rounded-full text-sm transition-colors ${
      active 
        ? 'bg-purple-600 text-white' 
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// SwipeCard component
const SwipeCard = ({ track, onPlay, currentlyPlaying }: { track: Track; onPlay: () => void; currentlyPlaying: boolean }) => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-2xl overflow-hidden shadow-xl shadow-purple-900/20 h-full flex flex-col relative">
      <div className="relative aspect-square overflow-hidden">
        {track.coverImage ? (
          <Image 
            src={track.coverImage}
            alt={track.title}
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
            <Music size={48} className="text-white" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60" />
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-105 z-20"
          aria-label={currentlyPlaying ? "Pause track" : "Play track"}
        >
          {currentlyPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-1" />
          )}
        </button>
      </div>
      
      <div className="p-5 flex-grow flex flex-col justify-between z-10">
        <div>
          <h3 className="text-xl text-white font-bold truncate">{track.title}</h3>
          <p className="text-purple-300 mb-2 truncate">{typeof track.artist === 'string' ? track.artist : track.artist.name}</p>
          
          <div className="flex gap-2 flex-wrap mt-3 mb-4">
            {track.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-purple-900/40 text-purple-200 py-1 px-2 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          {track.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-4">{track.description}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <span className="bg-purple-900/30 text-purple-200 py-1 px-3 rounded-full font-medium">
              {formatPrice(track.price)} {track.priceLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-white transition-colors" aria-label="Like track">
              <Heart size={18} />
            </button>
            <button className="hover:text-white transition-colors" aria-label="Share track">
              <Share2 size={18} />
            </button>
            {track.mintAddress && (
              <a 
                href={`https://solscan.io/token/${track.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main discovery page
const DiscoverPage = () => {
  const { connected } = useSolanaWallet();
  const { isReady, fetchNFTsByOwner } = useMetaplex();
  const { playTrack, addToQueue } = useMusicPlayer();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'price'>('recent');
  
  // All available genres from track tags
  const allGenres = [...new Set(DUMMY_TRACKS.flatMap(track => track.tags || []))];
  
  // Function to handle track play
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };
  
  // Load tracks on component mount
  useEffect(() => {
    const loadTracks = async () => {
      setIsLoading(true);
      try {
        // For now, use dummy data
        // In a real implementation, we would fetch from the API or blockchain
        setTracks(DUMMY_TRACKS);
        setFilteredTracks(DUMMY_TRACKS);
        
        // Use try-catch to handle any wallet-related errors
        try {
          // If wallet is connected and Metaplex is ready, try to fetch real NFTs
          if (connected && isReady) {
            const nfts = await fetchNFTsByOwner();
            console.log('Fetched NFTs:', nfts);
            // TODO: Convert NFTs to Track format
          }
        } catch (walletError) {
          console.error('Wallet error:', walletError);
          // Don't show error toast for wallet issues
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        toast.error('Failed to load tracks');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Added client-side only check to prevent SSR issues
    if (typeof window !== 'undefined') {
      loadTracks();
    }
  }, [connected, isReady, fetchNFTsByOwner]);
  
  // Filter and sort tracks
  useEffect(() => {
    let result = [...tracks];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        track => 
          track.title.toLowerCase().includes(query) || 
          (typeof track.artist === 'string' 
            ? track.artist.toLowerCase().includes(query) 
            : track.artist.name.toLowerCase().includes(query)) ||
          (track.description && track.description.toLowerCase().includes(query))
      );
    }
    
    // Apply genre filter
    if (activeGenre) {
      result = result.filter(track => 
        track.tags && track.tags.some(tag => tag.toLowerCase() === activeGenre.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'trending':
        result.sort((a, b) => {
          const likesA = a.likeCount || 0;
          const likesB = b.likeCount || 0;
          return likesB - likesA;
        });
        break;
      case 'price':
        result.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;
    }
    
    setFilteredTracks(result);
  }, [tracks, searchQuery, activeGenre, sortBy]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveGenre(null);
    setSortBy('recent');
  };

  // Create Track NFT handler 
  const handleCreateTrack = useCallback(() => {
    if (!connected) {
      toast.error('Please connect your wallet to create a track');
      return;
    }
    
    window.location.href = '/create';
  }, [connected]);
  
  // Current track that's playing
  const { currentTrack, isPlaying } = useMusicPlayer();
  
  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Discover</span> &amp; <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Collect</span> <br />
                Music on Solana
              </h1>
              <p className="text-lg text-purple-300 max-w-xl mb-6">
                Find unique music NFTs, support artists directly, and build your sonic identity on sasphy
              </p>
              
              {!connected ? (
                <div className="mb-6">
                  <WalletConnectButton />
                  <p className="text-sm text-gray-400 mt-2">
                    Connect your wallet to start collecting music
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleCreateTrack}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-full flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-600/20"
                >
                  <Plus size={18} />
                  Create Track
                </Button>
              )}
            </div>
            
            <div className="bg-black/40 border border-purple-900/30 rounded-xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Music className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Discover Feature</h3>
                  <p className="text-sm text-purple-300">Swipe to find your next favorite track</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">✓</div>
                  <span className="text-gray-300">Find unique music from independent artists</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">✓</div>
                  <span className="text-gray-300">Support creators directly through Solana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">✓</div>
                  <span className="text-gray-300">Build your influence by discovering hits early</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Filters & Search */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-purple-900/20 rounded-xl p-5 mb-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              Discover <span className="text-purple-400">Music</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-black/30 border border-purple-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Create Track Button */}
              <Button 
                onClick={handleCreateTrack}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                Create Track
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-gray-400 text-sm self-center">Filter by:</span>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <FilterTag
                  key={genre}
                  label={genre}
                  active={activeGenre === genre}
                  onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                />
              ))}
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              <span className="text-gray-400 text-sm">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'trending' | 'price')}
                className="bg-black/30 border border-purple-900/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Sort tracks by"
              >
                <option value="recent">Recent</option>
                <option value="trending">Trending</option>
                <option value="price">Price (Low to High)</option>
              </select>
              
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-black/30 border border-purple-900/30 hover:bg-gray-800 text-gray-300 px-3 py-1 rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Track Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-2xl overflow-hidden animate-pulse h-[440px]">
                <div className="aspect-square bg-gray-800" />
                <div className="p-5">
                  <div className="h-6 bg-gray-800 rounded mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-800 rounded-full" />
                    <div className="h-6 w-16 bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-4 bg-gray-800 rounded w-full mb-4" />
                  <div className="flex justify-between mt-6">
                    <div className="h-8 bg-gray-800 rounded-full w-24" />
                    <div className="flex gap-2">
                      <div className="h-6 w-6 bg-gray-800 rounded-full" />
                      <div className="h-6 w-6 bg-gray-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <SwipeCard 
                key={track.id} 
                track={track} 
                onPlay={() => handlePlayTrack(track)}
                currentlyPlaying={currentTrack?.id === track.id && isPlaying}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-10 text-center">
            <Disc className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
