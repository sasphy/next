'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Track } from '@/lib/types';
import { useMusicPlayer } from '@/components/music/music-player-context';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { toast } from 'sonner';
import { 
  Music, 
  Play, 
  Pause, 
  PlusCircle, 
  ExternalLink,
  Download,
  Share2, 
  Heart,
  MoreHorizontal,
  PlayCircle,
  Clock,
  ListMusic
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// NFT to Track converter (same as in profile page)
const nftToTrack = (nft: any): Track | null => {
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
      // Add other properties if available in metadata
      tags: metadata.attributes?.filter((attr: any) => attr.trait_type === 'Genre').map((attr: any) => attr.value) || [],
      duration: 180, // Default duration if not specified
    };
  } catch (error) {
    console.error('Error converting NFT to Track:', error);
    return null;
  }
};

// Format duration in mm:ss format
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Track Row component
const TrackRow = ({ 
  track, 
  index, 
  isPlaying, 
  isCurrentTrack,
  onPlay 
}: { 
  track: Track; 
  index: number;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: () => void;
}) => {
  return (
    <motion.tr
      className={`border-b border-gray-800 hover:bg-gray-900/50 ${isCurrentTrack ? 'bg-purple-900/20' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
    >
      <td className="px-4 py-3 w-12 text-center">
        {isCurrentTrack ? (
          <button 
            onClick={onPlay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-purple-600"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        ) : (
          <button 
            onClick={onPlay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors"
          >
            <Play size={14} className="ml-0.5" />
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
            {track.coverImage ? (
              <img 
                src={track.coverImage} 
                alt={track.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={16} className="text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <div className={`font-medium ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
              {track.title}
            </div>
            <div className="text-sm text-gray-400">{track.artist}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">
        {track.tags && track.tags.length > 0 ? track.tags.join(', ') : 'No genre'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">
        {track.duration ? formatDuration(track.duration) : '--:--'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button 
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Add to playlist"
          >
            <PlusCircle size={16} />
          </button>
          <button 
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Like"
          >
            <Heart size={16} />
          </button>
          <button 
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// Empty State component
const EmptyLibrary = () => (
  <div className="text-center py-16 px-4">
    <div className="bg-gray-900/60 rounded-xl p-8 max-w-md mx-auto border border-gray-800">
      <ListMusic className="h-16 w-16 text-purple-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Your library is empty</h2>
      <p className="text-gray-400 mb-6">
        Start building your collection by discovering and purchasing music NFTs on Solana.
      </p>
      <Link
        href="/discover"
        className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 transition-colors"
      >
        <PlayCircle size={18} />
        Discover Music
      </Link>
    </div>
  </div>
);

// Library Page
const LibraryPage = () => {
  const { connected, walletAddress } = useSolanaWallet();
  const { isReady, fetchNFTsByOwner } = useMetaplex();
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useMusicPlayer();
  
  const [ownedTracks, setOwnedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Fetch owned tracks
  useEffect(() => {
    const loadOwnedTracks = async () => {
      if (!connected || !isReady || !walletAddress) return;
      
      setIsLoading(true);
      try {
        // Fetch NFTs owned by the connected wallet
        const nfts = await fetchNFTsByOwner();
        console.log('Fetched NFTs:', nfts);
        
        // Convert NFTs to Tracks
        const tracks = nfts
          .map(nftToTrack)
          .filter(Boolean) as Track[];
        
        // If no tracks are found from NFTs, use dummy data for development purposes
        if (tracks.length === 0) {
          // This is just for development - in production, we would show the empty state
          toast.info('Using sample music data for demonstration');
          
          setOwnedTracks([
            {
              id: '1',
              title: 'Digital Dreams',
              artist: 'CryptoBeats',
              coverImage: '/assets/album-1.jpg',
              audioUrl: '/assets/audio-1.mp3',
              duration: 210,
              tags: ['Electronic', 'Ambient'],
              mintAddress: '7KqpRwzkkeweW5jQuq21SS3FYVARpLdwTKcUQKMW9PhQ'
            },
            {
              id: '2',
              title: 'Blockchain Beats',
              artist: 'SOL Serenade',
              coverImage: '/assets/album-2.jpg',
              audioUrl: '/assets/audio-2.mp3',
              duration: 180,
              tags: ['Trap', 'Hip-Hop'],
              mintAddress: '9KqpRwzkkeweW5jQrr21SS3FYVARpLdwTKcUQKMW9PhS'
            },
            {
              id: '3',
              title: 'Solana Sunset',
              artist: 'Chain Harmony',
              coverImage: '/assets/album-3.jpg',
              audioUrl: '/assets/audio-3.mp3',
              duration: 240,
              tags: ['Lo-Fi', 'Chill'],
              mintAddress: '5KqpRwzkkeweW5jQfg21SS3FYVARpLdwTKcUQKMW9PhF'
            }
          ]);
        } else {
          setOwnedTracks(tracks);
        }
      } catch (error) {
        console.error('Error loading owned tracks:', error);
        toast.error('Failed to load your music library');
        
        // Fallback to empty state
        setOwnedTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOwnedTracks();
  }, [connected, isReady, walletAddress, fetchNFTsByOwner]);
  
  // Play/pause track
  const handleTrackAction = (track: Track) => {
    if (currentTrack?.id === track.id) {
      // Toggle play/pause for current track
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      // Play new track
      playTrack(track);
    }
  };
  
  // Play all tracks
  const playAllTracks = () => {
    if (ownedTracks.length > 0) {
      playTrack(ownedTracks[0], ownedTracks);
      toast.success('Playing all tracks');
    } else {
      toast.error('No tracks to play');
    }
  };
  
  // If wallet is not connected, show connect prompt
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-8 max-w-md mx-auto text-center">
          <Music className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Your Music Library</h1>
          <p className="text-gray-400 mb-6">Connect your Solana wallet to access your music collection.</p>
          <WalletConnectButton />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Music Library</h1>
          <p className="text-purple-300">Listen to your owned music NFTs</p>
        </div>
        
        {ownedTracks.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={playAllTracks}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              <Play size={16} />
              Play All
            </button>
            
            <div className="flex items-center bg-gray-900 rounded-lg border border-gray-800">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
                title="List view"
              >
                <ListMusic size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
                title="Grid view"
              >
                <div className="flex flex-wrap w-4 h-4">
                  <div className={`w-1.5 h-1.5 m-0.5 rounded-sm ${viewMode === 'grid' ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                  <div className={`w-1.5 h-1.5 m-0.5 rounded-sm ${viewMode === 'grid' ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                  <div className={`w-1.5 h-1.5 m-0.5 rounded-sm ${viewMode === 'grid' ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                  <div className={`w-1.5 h-1.5 m-0.5 rounded-sm ${viewMode === 'grid' ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-4 bg-gray-800 rounded"></div>
                <div className="w-16 h-8 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : ownedTracks.length > 0 ? (
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 overflow-hidden">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-900/80 border-b border-gray-800">
                    <th className="px-4 py-3 w-12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Track
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                      <Clock size={12} className="mr-1" /> Duration
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ownedTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isCurrentTrack={currentTrack?.id === track.id}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlay={() => handleTrackAction(track)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6">
              {ownedTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className="group relative rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {track.coverImage ? (
                      <img 
                        src={track.coverImage} 
                        alt={track.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={32} className="text-gray-500" />
                      </div>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleTrackAction(track)}
                        className="bg-purple-600 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-all shadow-lg shadow-purple-900/30"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause size={20} className="text-white" />
                        ) : (
                          <Play size={20} className="text-white ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="text-white font-medium truncate">{track.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyLibrary />
      )}
      
      {/* NFT Information Section */}
      {ownedTracks.length > 0 && (
        <div className="mt-8 bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">About Your Music NFTs</h2>
          <div className="text-gray-400 space-y-4">
            <p>
              Your music is stored as NFTs on the Solana blockchain, giving you true ownership of your collection. 
              Each track can be played, transferred, or sold on compatible marketplaces.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <a 
                href="https://explorer.solana.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink size={16} />
                View on Solana Explorer
              </a>
              <a 
                href="https://magiceden.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink size={16} />
                List on Magic Eden
              </a>
              <a 
                href="https://solsea.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink size={16} />
                List on Solsea
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
