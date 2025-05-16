'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Track } from '@/lib/types';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { useMusicPlayer } from '@/components/music/music-player-context';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { truncateAddress } from '@/lib/utils';
import Link from 'next/link';
import { Copy, ExternalLink, Music, CollectionIcon, Trophy, UserCircle, Headphones } from 'lucide-react';
import { NFT } from '@metaplex-foundation/js';

// CollectionIcon component
function CollectionIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 2H2v10h10V2z" />
      <path d="M12 12h10v10H12V12z" />
      <path d="M22 2h-6.5a3.5 3.5 0 0 0-3.5 3.5V9" />
      <path d="M15 12V9" />
      <path d="M2 15h8.5a3.5 3.5 0 0 1 3.5 3.5V22" />
      <path d="M9 2v7" />
      <path d="M15 22v-7" />
    </svg>
  )
}

// NFT to Track converter
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
    };
  } catch (error) {
    console.error('Error converting NFT to Track:', error);
    return null;
  }
};

// Stat Card component
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-purple-900/30 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-purple-400" />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

// Track Item component
const TrackItem = ({ track, onClick }: { track: Track; onClick: () => void }) => (
  <motion.div 
    className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-lg border border-purple-900/20 hover:border-purple-500/40 transition-all p-3 flex items-center gap-4"
    whileHover={{ x: 5 }}
  >
    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
      {track.coverImage ? (
        <img
          src={track.coverImage}
          alt={track.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-purple-900/30 flex items-center justify-center">
          <Music className="h-6 w-6 text-purple-300" />
        </div>
      )}
    </div>
    
    <div className="flex-grow min-w-0">
      <h3 className="text-white font-medium truncate">{track.title}</h3>
      <p className="text-purple-300 text-sm truncate">{track.artist}</p>
    </div>
    
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="p-2 rounded-full hover:bg-purple-900/30 transition-colors flex-shrink-0"
    >
      <Headphones className="h-5 w-5 text-purple-400" />
    </button>
  </motion.div>
);

// Empty State component
const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) => (
  <div className="bg-gray-900 bg-opacity-50 rounded-xl p-8 text-center">
    <Icon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6">{description}</p>
    <Link
      href="/discover"
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
    >
      Discover Music
    </Link>
  </div>
);

// Profile Page
const ProfilePage = () => {
  const { walletAddress, connected } = useSolanaWallet();
  const { isReady, fetchNFTsByOwner } = useMetaplex();
  const { playTrack } = useMusicPlayer();
  
  const [ownedTracks, setOwnedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'collection' | 'influence'>('collection');
  
  // Stats data (placeholder for now)
  const stats = {
    ownedTracks: ownedTracks.length,
    discoveredTracks: 12,
    influenceScore: 876,
    trendsSpotted: 5
  };

  // Load owned tracks on component mount or when wallet connects
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
        
        setOwnedTracks(tracks);
      } catch (error) {
        console.error('Error loading owned tracks:', error);
        toast.error('Failed to load your music collection');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOwnedTracks();
  }, [connected, isReady, walletAddress, fetchNFTsByOwner]);
  
  // Handle track play
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
    toast.success(`Playing "${track.title}"`);
  };
  
  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (!walletAddress) return;
    
    navigator.clipboard.writeText(walletAddress.toString());
    toast.success('Wallet address copied to clipboard');
  };
  
  // If wallet is not connected, show connect prompt
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-8 max-w-md mx-auto text-center">
          <UserCircle className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Connect your wallet</h1>
          <p className="text-gray-400 mb-6">Connect your Solana wallet to view your profile, music collection, and influence score.</p>
          <WalletConnectButton />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-md rounded-xl border border-purple-900/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {walletAddress?.toString().substring(0, 1).toUpperCase()}
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center md:text-left">
                  Solana Collector
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <p className="text-gray-300 font-mono text-sm">
                    {truncateAddress(walletAddress?.toString() || '')}
                  </p>
                  <button 
                    onClick={copyAddress}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://solscan.io/account/${walletAddress?.toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="View on Solscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end">
                <div className="px-3 py-1 bg-purple-600/30 rounded-full text-purple-300 text-sm font-medium mb-2">
                  Trend Spotter
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Top 10% Influencer</span>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatCard icon={Music} label="Owned Tracks" value={stats.ownedTracks} />
              <StatCard icon={Headphones} label="Discovered" value={stats.discoveredTracks} />
              <StatCard icon={Trophy} label="Influence Score" value={stats.influenceScore} />
              <StatCard icon={TrendingUpIcon} label="Trends Spotted" value={stats.trendsSpotted} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'collection'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('collection')}
        >
          Collection
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'influence'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('influence')}
        >
          Influence & Rewards
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'collection' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Music Collection</h2>
            <Link
              href="/discover"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Discover More
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-900 bg-opacity-60 rounded-lg p-3 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-purple-900/30 rounded-md"></div>
                  <div className="flex-grow">
                    <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : ownedTracks.length > 0 ? (
            <div className="space-y-3">
              {ownedTracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  onClick={() => handlePlayTrack(track)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CollectionIcon}
              title="Your collection is empty"
              description="Start discovering and collecting music to build your collection."
            />
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Influence</h2>
            <span className="text-sm px-3 py-1 bg-purple-600/30 rounded-full text-purple-300 font-medium">
              Level 3
            </span>
          </div>
          
          {/* Influence Score */}
          <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Influence Score</h3>
                <p className="text-gray-400 mb-4 text-sm">Your impact on the sasphy music ecosystem</p>
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                {stats.influenceScore}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Current: Level 3</span>
                <span>Next: Level 4 (1,000)</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min((stats.influenceScore / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Achievement Cards */}
          <h3 className="text-lg font-semibold text-white mb-3">Your Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              {
                title: "Early Adopter",
                description: "You were one of the first 1,000 users on sasphy",
                icon: Trophy,
                date: "Apr 3, 2025"
              },
              {
                title: "Trend Spotter",
                description: "You discovered a track before it reached 1,000 plays",
                icon: TrendingUpIcon,
                date: "Apr 10, 2025"
              },
              {
                title: "Collector Initiate",
                description: "Own 5 or more music NFTs",
                icon: CollectionIcon,
                date: "Apr 15, 2025"
              }
            ].map((achievement, index) => (
              <div 
                key={index}
                className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-purple-900/30 p-2 rounded-lg mt-1">
                    <achievement.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{achievement.title}</h4>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Earned on {achievement.date}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tracks You Discovered */}
          <h3 className="text-lg font-semibold text-white mb-3">Tracks You Discovered Early</h3>
          {stats.trendsSpotted > 0 ? (
            <div className="space-y-3">
              {/* This would be real data in a complete implementation */}
              {[...Array(stats.trendsSpotted)].map((_, index) => (
                <div 
                  key={index}
                  className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-lg border border-purple-900/20 p-3 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={`/assets/album-${index + 1}.jpg`}
                      alt="Track cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {["Cosmic Harmony", "Digital Dreams", "Blockchain Beats", "Solana Sunset", "Crypto Carnival"][index % 5]}
                    </h4>
                    <p className="text-purple-300 text-sm truncate">
                      {["Nebula Noise", "CryptoBeats", "Chain Harmony", "SOL Serenade", "Token Titans"][index % 5]}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="px-2 py-1 bg-purple-600/30 rounded-full text-purple-300 text-xs font-medium mb-1">
                      +{[45, 32, 58, 27, 63][index % 5]} Influence
                    </div>
                    <div className="text-xs text-gray-500">
                      Discovered {["2", "5", "3", "4", "1"][index % 5]} days before trending
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUpIcon}
              title="No trends spotted yet"
              description="Discover new music before others to earn influence points and rewards."
            />
          )}
        </div>
      )}
    </div>
  );
};

// TrendingUp Icon component
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

export default ProfilePage;
