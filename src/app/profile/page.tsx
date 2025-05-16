'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Track as TrackType, User } from '@/lib/types';
import { 
  Music, 
  Trophy, 
  Copy, 
  ExternalLink, 
  BarChart2, 
  Play, 
  Clock, 
  Heart, 
  Star,
  Disc,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useMusicPlayer } from '@/components/music/music-player-context';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDuration, truncateAddress } from '@/lib/utils';

// Placeholder badge data
const badgesData = [
  { 
    id: 'early_adopter', 
    name: 'Early Adopter', 
    icon: Star, 
    description: 'Joined during the platform launch period', 
    rarity: 'common', 
    dateEarned: '2025-04-01'
  },
  { 
    id: 'trend_spotter', 
    name: 'Trend Spotter', 
    icon: TrendingUp, 
    description: 'Discovered 5 tracks before they became trending', 
    rarity: 'rare', 
    dateEarned: '2025-04-10'
  },
  { 
    id: 'music_enthusiast', 
    name: 'Music Enthusiast', 
    icon: Disc, 
    description: 'Collected more than 10 unique tracks', 
    rarity: 'uncommon', 
    dateEarned: '2025-04-05'
  }
];

// Badge component
const Badge = ({ 
  name, 
  icon: Icon, 
  description, 
  rarity 
}: { 
  name: string; 
  icon: any; 
  description: string; 
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' 
}) => {
  const rarityColor = {
    common: 'from-blue-500 to-blue-700',
    uncommon: 'from-green-500 to-green-700',
    rare: 'from-purple-500 to-purple-700',
    legendary: 'from-yellow-500 to-yellow-700',
  }[rarity];
  
  return (
    <div className="bg-black bg-opacity-40 rounded-xl overflow-hidden border border-purple-900/20 p-4">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityColor} flex items-center justify-center mb-3`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-white font-semibold mb-1">{name}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      <div className="mt-2">
        <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
          rarity === 'common' ? 'bg-blue-900/30 text-blue-300' :
          rarity === 'uncommon' ? 'bg-green-900/30 text-green-300' :
          rarity === 'rare' ? 'bg-purple-900/30 text-purple-300' :
          'bg-yellow-900/30 text-yellow-300'
        }`}>
          {rarity}
        </span>
      </div>
    </div>
  );
};

// Stats component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'purple'
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: number;
  color?: 'purple' | 'blue' | 'green' | 'yellow' 
}) => {
  const colorClass = {
    purple: 'from-purple-500/20 to-purple-700/20 border-purple-500/30',
    blue: 'from-blue-500/20 to-blue-700/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-700/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-700/20 border-yellow-500/30',
  }[color];
  
  return (
    <div className={`bg-gradient-to-br ${colorClass} rounded-xl border p-4`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-300 text-sm">{title}</h3>
        <Icon className={`text-${color}-400`} size={20} />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-xl font-bold text-white">{value}</div>
        {trend !== undefined && (
          <div className={`text-xs flex items-center ${
            trend > 0 ? 'text-green-400' : 
            trend < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend > 0 ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                +{trend}%
              </>
            ) : trend < 0 ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                {trend}%
              </>
            ) : (
              <>—</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock user data
const mockUser: User = {
  id: 'user1',
  address: '7KqpRwzkkeweW5jQuq21SS3FYVARpLdwTKcUQKMW9PhQ',
  username: 'SolanaFan',
  profileImage: 'https://avatars.githubusercontent.com/u/35608259',
  evScore: 583,
  discoveryCount: 27,
  followers: 12,
  following: 34,
  influenceScore: 583,
  badges: ['early_adopter', 'trend_spotter', 'music_enthusiast'],
  totalPlays: 347
};

// Main Profile Page
const ProfilePage = () => {
  const { connected, walletAddress } = useSolanaWallet();
  const { isReady } = useMetaplex();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collection');
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!connected || !isReady) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // In a real implementation, fetch user profile from API
        // For now, use mock data
        setUser(mockUser);
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [connected, isReady]);
  
  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (!walletAddress) return;
    
    navigator.clipboard.writeText(walletAddress.toString());
    toast.success('Wallet address copied to clipboard');
  };
  
  // If not connected, show connect wallet UI
  if (!connected) {
    return (
      <div className="min-h-screen pb-16">
        <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-8 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Profile
            </h1>
            <p className="text-purple-300 mt-2">
              Connect wallet to view your profile
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-10 text-center">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect your wallet
            </h3>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view your profile, collection, and stats
            </p>
            
            <WalletConnectButton />
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-8 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Profile
            </h1>
            <p className="text-purple-300 mt-2">
              Loading your profile...
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="rounded-full w-24 h-24 bg-gray-800 mb-4" />
                <div className="h-6 bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
              </div>
              
              <div className="md:w-2/3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 h-24" />
                  ))}
                </div>
                
                <div className="h-10 bg-gray-800 rounded mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 h-40" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Profile</span>
          </h1>
          <p className="text-purple-300 mt-2">
            View your collection, influence, and stats
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="md:w-1/3">
              <div className="flex flex-col items-center md:items-start">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.username || 'Profile'} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.username?.charAt(0) || walletAddress?.toString().charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-white mt-4">
                  {user?.username || 'Unnamed User'}
                </h2>
                
                <div className="flex items-center gap-2 mt-2 bg-black/30 rounded-lg px-3 py-1.5">
                  <span className="text-sm text-gray-300 font-mono">
                    {walletAddress ? truncateAddress(walletAddress.toString()) : ''}
                  </span>
                  <button 
                    onClick={copyWalletAddress}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <a
                    href={`https://solscan.io/account/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                
                <div className="flex items-center gap-4 mt-6 text-center w-full md:w-auto">
                  <div>
                    <div className="text-purple-400 font-bold">{user?.followers || 0}</div>
                    <div className="text-gray-400 text-sm">Followers</div>
                  </div>
                  <div className="h-10 border-r border-gray-700" />
                  <div>
                    <div className="text-purple-400 font-bold">{user?.following || 0}</div>
                    <div className="text-gray-400 text-sm">Following</div>
                  </div>
                  <div className="h-10 border-r border-gray-700" />
                  <div>
                    <div className="text-purple-400 font-bold">{user?.totalPlays || 0}</div>
                    <div className="text-gray-400 text-sm">Plays</div>
                  </div>
                </div>
                
                <div className="w-full mt-6 p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-purple-400" />
                      Influence Score
                    </h3>
                    <span className="text-xs text-gray-400">Rank #142</span>
                  </div>
                  
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (user?.influenceScore || 0) / 10)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{user?.influenceScore || 0} points</span>
                    <span>+{12} this week</span>
                  </div>
                </div>
                
                <Button className="w-full mt-6 border border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                  Edit Profile
                </Button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:w-2/3">
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="Tracks Owned"
                  value="12"
                  icon={Music}
                  color="purple"
                />
                <StatsCard
                  title="Discoveries"
                  value={user?.discoveryCount || 0}
                  icon={Star}
                  trend={8}
                  color="blue"
                />
                <StatsCard
                  title="Influence Score"
                  value={user?.influenceScore || 0}
                  icon={BarChart2}
                  trend={5}
                  color="green"
                />
                <StatsCard
                  title="Total Plays"
                  value={user?.totalPlays || 0}
                  icon={Activity}
                  color="yellow"
                />
              </div>
              
              {/* Tabs */}
              <Tabs
                defaultValue="collection"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full mb-6 bg-gray-900/50">
                  <TabsTrigger value="collection" className="flex-1">
                    Collection
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="flex-1">
                    Badges & Achievements
                  </TabsTrigger>
                  <TabsTrigger value="influence" className="flex-1">
                    Influence History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="collection" className="outline-none">
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">My Collection</h3>
                      <Link href="/library">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* For development, show placeholder collection */}
                      {[1, 2, 3].map((id) => (
                        <div 
                          key={id}
                          className="bg-black bg-opacity-40 rounded-xl overflow-hidden border border-purple-900/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-900/20"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            <img 
                              src={`/assets/album-${id}.jpg`}
                              alt={`Track ${id}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80" />
                            
                            <button
                              className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <div className="bg-purple-600 rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg">
                                <Play size={24} className="text-white ml-1" />
                              </div>
                            </button>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-white font-semibold truncate">
                              {id === 1 ? 'Solana Sunset' : id === 2 ? 'Blockchain Beats' : 'Digital Dreams'}
                            </h3>
                            <p className="text-purple-300 text-sm truncate">
                              {id === 1 ? 'Chain Harmony' : id === 2 ? 'SOL Serenade' : 'CryptoBeats'}
                            </p>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {id === 1 ? '3:30' : id === 2 ? '2:45' : '4:10'}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Heart size={14} className="text-purple-400" />
                                <span className="text-xs text-gray-400">
                                  {id === 1 ? '42' : id === 2 ? '27' : '36'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="badges" className="outline-none">
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Badges & Achievements</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {badgesData.map((badge) => (
                        <Badge
                          key={badge.id}
                          name={badge.name}
                          icon={badge.icon}
                          description={badge.description}
                          rarity={badge.rarity as 'common' | 'uncommon' | 'rare' | 'legendary'}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="influence" className="outline-none">
                  <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Influence History</h3>
                    
                    <div className="space-y-4">
                      {/* Activity timeline */}
                      <div className="relative pl-8 pb-4 border-l border-gray-800">
                        <div className="absolute -left-2 top-0 w-5 h-5 rounded-full bg-purple-600"></div>
                        <div className="mb-1 text-sm text-gray-400">April 15, 2025</div>
                        <div className="text-white font-medium">Early Discovery Reward</div>
                        <p className="text-sm text-gray-300">
                          +50 points for discovering "Blockchain Beats" before it reached 100 plays
                        </p>
                      </div>
                      
                      <div className="relative pl-8 pb-4 border-l border-gray-800">
                        <div className="absolute -left-2 top-0 w-5 h-5 rounded-full bg-blue-600"></div>
                        <div className="mb-1 text-sm text-gray-400">April 12, 2025</div>
                        <div className="text-white font-medium">Trend Spotter Badge Earned</div>
                        <p className="text-sm text-gray-300">
                          +200 points for discovering 5 tracks before they became trending
                        </p>
                      </div>
                      
                      <div className="relative pl-8 pb-4">
                        <div className="absolute -left-2 top-0 w-5 h-5 rounded-full bg-green-600"></div>
                        <div className="mb-1 text-sm text-gray-400">April 10, 2025</div>
                        <div className="text-white font-medium">Ownership Bonus</div>
                        <p className="text-sm text-gray-300">
                          +30 points for owning "Digital Dreams" that has been played by 100+ users
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link href="/leaderboard">
                        <Button>
                          View Influence Leaderboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
