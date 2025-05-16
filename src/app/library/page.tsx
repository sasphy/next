'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Track as TrackType } from '@/lib/types';
import { 
  Music, 
  Grid, 
  List as ListIcon, 
  Play, 
  Pause, 
  ExternalLink, 
  Clock, 
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useMusicPlayer } from '@/components/music/music-player-context';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDuration, truncateAddress } from '@/lib/utils';

// Convert Metaplex NFT to Track object
const nftToTrack = (nft: any): TrackType | null => {
  try {
    const metadata = nft.metadata;
    if (!metadata) return null;

    // Filter out non-music NFTs
    if (!metadata.animation_url && (!metadata.properties?.category || metadata.properties.category !== 'audio')) {
      return null;
    }

    return {
      id: nft.mintAddress || nft.mint?.toString() || nft.address?.toString(),
      title: metadata.name || 'Untitled Track',
      artist: metadata.attributes?.find((attr: any) => attr.trait_type === 'Artist')?.value || 'Unknown Artist',
      description: metadata.description || '',
      coverImage: metadata.image || '',
      audioUrl: metadata.animation_url || '',
      mintAddress: nft.mintAddress || nft.mint?.toString() || nft.address?.toString(),
      tags: metadata.attributes?.filter((attr: any) => attr.trait_type === 'Genre').map((attr: any) => attr.value) || [],
    };
  } catch (error) {
    console.error('Error converting NFT to Track:', error);
    return null;
  }
};

// List View Row component
const TrackListItem = ({ 
  track, 
  index, 
  onPlay, 
  isPlaying 
}: { 
  track: TrackType; 
  index: number; 
  onPlay: () => void; 
  isPlaying: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`grid grid-cols-12 items-center gap-4 p-3 rounded-lg hover:bg-card/40 transition-colors ${
        isPlaying ? 'bg-purple-900/20 border-l-2 border-purple-500' : ''
      }`}
    >
      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPlay();
          }}
          className="flex-shrink-0 w-10 h-10 bg-black/30 rounded-md flex items-center justify-center group"
        >
          {isPlaying ? (
            <Pause size={18} className="text-purple-400" />
          ) : (
            <Play size={18} className="text-white group-hover:text-purple-400 transition-colors" />
          )}
        </button>
        
        <div className="min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{track.title}</h3>
          <p className="text-purple-300 text-xs truncate">{track.artist}</p>
        </div>
      </div>
      
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <div className="flex flex-wrap gap-1">
          {track.tags && track.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="text-xs bg-purple-900/40 text-purple-200 py-0.5 px-2 rounded-full truncate max-w-24">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="col-span-3 md:col-span-2 text-right md:text-left">
        <span className="text-xs text-gray-300">
          {track.releaseDate ? new Date(track.releaseDate).toLocaleDateString() : 'N/A'}
        </span>
      </div>
      
      <div className="col-span-3 md:col-span-2 text-right hidden md:block">
        <span className="text-xs text-gray-300">
          {track.duration ? formatDuration(track.duration) : 'N/A'}
        </span>
      </div>
      
      <div className="col-span-3 md:col-span-1 flex justify-end">
        {track.mintAddress && (
          <a
            href={`https://solscan.io/token/${track.mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            title="View on Solscan"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </motion.div>
  );
};

// Grid View Card component
const TrackGridItem = ({ 
  track, 
  index, 
  onPlay, 
  isPlaying 
}: { 
  track: TrackType; 
  index: number; 
  onPlay: () => void; 
  isPlaying: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-black bg-opacity-40 rounded-xl overflow-hidden border border-purple-900/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-900/20"
    >
      <div className="relative aspect-square overflow-hidden">
        {track.coverImage ? (
          <img 
            src={track.coverImage} 
            alt={track.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
            <Music size={48} className="text-purple-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80" />
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPlay();
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="bg-purple-600 rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg">
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-1" />
            )}
          </div>
        </button>
        
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
            <span className="flex gap-0.5 items-center">
              <span className="block w-1 h-3 bg-white rounded-full animate-music-bar-1"></span>
              <span className="block w-1 h-5 bg-white rounded-full animate-music-bar-2"></span>
              <span className="block w-1 h-2 bg-white rounded-full animate-music-bar-3"></span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{track.title}</h3>
        <p className="text-purple-300 text-sm truncate">{track.artist}</p>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {track.tags && track.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-purple-900/40 text-purple-200 py-0.5 px-2 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {track.duration ? formatDuration(track.duration) : 'N/A'}
          </div>
          
          <div className="flex items-center gap-2">
            {track.mintAddress && (
              <a
                href={`https://solscan.io/token/${track.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="View on Solscan"
              >
                <ExternalLink size={16} />
              </a>
            )}
            
            {track.audioUrl && (
              <a
                href={track.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="Download"
              >
                <Download size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty Library component
const EmptyLibrary = ({ connected }: { connected: boolean }) => (
  <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-10 text-center">
    <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <Music size={32} className="text-purple-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">
      {connected ? 'Your library is empty' : 'Connect your wallet'}
    </h3>
    <p className="text-gray-400 mb-6">
      {connected
        ? 'Start collecting music to build your library'
        : 'Connect your wallet to view your music collection'}
    </p>
    
    {connected ? (
      <Link href="/discover">
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
          Discover Music
        </Button>
      </Link>
    ) : (
      <WalletConnectButton />
    )}
  </div>
);

// Main Library Page
const LibraryPage = () => {
  const { connected } = useSolanaWallet();
  const { isReady, fetchNFTsByOwner } = useMetaplex();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  
  const [tracks, setTracks] = useState<TrackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('library');
  
  // Load the user's music collection
  useEffect(() => {
    const loadCollection = async () => {
      if (!connected || !isReady) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch NFTs owned by the user
        const nfts = await fetchNFTsByOwner();
        
        // Convert NFTs to Track format
        const musicTracks = nfts
          .map(nftToTrack)
          .filter(Boolean) as TrackType[];
        
        setTracks(musicTracks);
      } catch (error) {
        console.error('Error loading music collection:', error);
        toast.error('Failed to load your music collection');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCollection();
  }, [connected, isReady, fetchNFTsByOwner]);
  
  // Function to handle track play
  const handlePlayTrack = (track: TrackType) => {
    playTrack(track, tracks);
  };
  
  // Mock data for development
  const mockTracks: TrackType[] = [
    {
      id: '1',
      title: 'Solana Sunset',
      artist: 'Chain Harmony',
      coverImage: '/assets/album-1.jpg',
      audioUrl: '/assets/audio-sample.mp3',
      mintAddress: '7KqpRwzkkeweW5jQuq21SS3FYVARpLdwTKcUQKMW9PhQ',
      duration: 210,
      releaseDate: '2025-04-10',
      tags: ['Lo-Fi', 'Chill']
    },
    {
      id: '2',
      title: 'Blockchain Beats',
      artist: 'SOL Serenade',
      coverImage: '/assets/album-2.jpg',
      audioUrl: '/assets/audio-sample2.mp3',
      mintAddress: '9KqpRwzkkeweW5jQrr21SS3FYVARpLdwTKcUQKMW9PhS',
      duration: 180,
      releaseDate: '2025-03-22',
      tags: ['Hip-Hop', 'Bass']
    },
    {
      id: '3',
      title: 'Decentralized Disco',
      artist: 'CryptoBeats',
      coverImage: '/assets/album-3.jpg',
      audioUrl: '/assets/audio-sample3.mp3',
      mintAddress: '5KqpRwzkkeweW5jQfg21SS3FYVARpLdwTKcUQKMW9PhF',
      duration: 195,
      releaseDate: '2025-04-05',
      tags: ['Disco', 'Electronic']
    }
  ];

  // Use mock data for development
  const displayTracks = tracks.length > 0 ? tracks : mockTracks;
  
  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Library</span>
          </h1>
          <p className="text-purple-300 mt-2">
            Your collected music on Solana
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {!connected ? (
          <EmptyLibrary connected={false} />
        ) : isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4">
                  <div className="h-5 bg-gray-800 rounded mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-2/3 mb-4" />
                  <div className="h-3 bg-gray-800 rounded-full w-20 mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-800 rounded w-12" />
                    <div className="h-3 bg-gray-800 rounded w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayTracks.length === 0 ? (
          <EmptyLibrary connected={true} />
        ) : (
          <div>
            <div className="bg-gradient-to-r from-gray-900 to-black border border-purple-900/20 rounded-xl p-5 mb-8 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <Tabs
                  defaultValue="library"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="w-full sm:w-auto gap-1 bg-gray-900/50">
                    <TabsTrigger value="library" className="flex-1 sm:flex-none">
                      All Music
                    </TabsTrigger>
                    <TabsTrigger value="collections" className="flex-1 sm:flex-none">
                      Collections
                    </TabsTrigger>
                    <TabsTrigger value="playlists" className="flex-1 sm:flex-none">
                      Playlists
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    {displayTracks.length} {displayTracks.length === 1 ? 'track' : 'tracks'}
                  </div>
                  
                  <div className="flex items-center gap-1 p-1 bg-gray-900/50 rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded p-1.5 ${
                        viewMode === 'grid' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded p-1.5 ${
                        viewMode === 'list' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <ListIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <TabsContent value="library" className="outline-none pt-2">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayTracks.map((track, index) => (
                    <TrackGridItem
                      key={track.id}
                      track={track}
                      index={index}
                      onPlay={() => handlePlayTrack(track)}
                      isPlaying={currentTrack?.id === track.id && isPlaying}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-900 to-black border border-purple-900/20 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-3 text-gray-400 text-xs font-medium">
                    <div className="col-span-6 md:col-span-5">TRACK</div>
                    <div className="col-span-3 md:col-span-2 hidden md:block">GENRE</div>
                    <div className="col-span-3 md:col-span-2 text-right md:text-left">DATE ADDED</div>
                    <div className="col-span-3 md:col-span-2 text-right hidden md:block">DURATION</div>
                    <div className="col-span-3 md:col-span-1"></div>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {displayTracks.map((track, index) => (
                      <TrackListItem
                        key={track.id}
                        track={track}
                        index={index}
                        onPlay={() => handlePlayTrack(track)}
                        isPlaying={currentTrack?.id === track.id && isPlaying}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collections" className="outline-none pt-2">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-10 text-center">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music size={32} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Collections Coming Soon
                </h3>
                <p className="text-gray-400 mb-6">
                  Artist collections will be available in the next update
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="playlists" className="outline-none pt-2">
              <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-10 text-center">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music size={32} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Playlists Coming Soon
                </h3>
                <p className="text-gray-400 mb-6">
                  Create and share playlists in the next update
                </p>
              </div>
            </TabsContent>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
