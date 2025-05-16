'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { User } from '@/lib/types';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  ChevronUp, 
  ChevronDown, 
  ChevronsRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/utils';

// Mock leaderboard data
const mockLeaderboard: User[] = [
  {
    id: 'user1',
    address: '7KqpRwzkkeweW5jQuq21SS3FYVARpLdwTKcUQKMW9PhQ',
    username: 'CryptoBeats',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    influenceScore: 1247,
    discoveryCount: 102,
    badges: ['legendary_curator', 'trend_spotter'],
    totalPlays: 856
  },
  {
    id: 'user2',
    address: '9KqpRwzkkeweW5jQrr21SS3FYVARpLdwTKcUQKMW9PhS',
    username: 'SolanaFan',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    influenceScore: 968,
    discoveryCount: 87,
    badges: ['early_adopter', 'social_butterfly'],
    totalPlays: 723
  },
  {
    id: 'user3',
    address: '5KqpRwzkkeweW5jQfg21SS3FYVARpLdwTKcUQKMW9PhF',
    username: 'MusicVibes',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    influenceScore: 831,
    discoveryCount: 72,
    badges: ['trend_spotter', 'music_enthusiast'],
    totalPlays: 614
  },
  {
    id: 'user4',
    address: '3KqpRwzkkeweW5jQhj21SS3FYVARpLdwTKcUQKMW9PhD',
    username: 'BlockchainBeats',
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
    influenceScore: 743,
    discoveryCount: 59,
    badges: ['music_enthusiast'],
    totalPlays: 512
  },
  {
    id: 'user5',
    address: '2KqpRwzkkeweW5jQty21SS3FYVARpLdwTKcUQKMW9PhL',
    username: 'SonicExplorer',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    influenceScore: 692,
    discoveryCount: 51,
    badges: ['early_adopter'],
    totalPlays: 487
  },
  {
    id: 'user6',
    address: '8KqpRwzkkeweW5jQmn21SS3FYVARpLdwTKcUQKMW9PhM',
    username: 'MelodyMaster',
    profileImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
    influenceScore: 584,
    discoveryCount: 43,
    badges: ['music_enthusiast'],
    totalPlays: 376
  },
  {
    id: 'user7',
    address: '4KqpRwzkkeweW5jQkl21SS3FYVARpLdwTKcUQKMW9PhX',
    username: 'CryptoCollector',
    profileImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    influenceScore: 467,
    discoveryCount: 37,
    badges: ['early_adopter'],
    totalPlays: 298
  },
  {
    id: 'user8',
    address: '6KqpRwzkkeweW5jQop21SS3FYVARpLdwTKcUQKMW9PhK',
    username: 'SoundSurfer',
    profileImage: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c',
    influenceScore: 352,
    discoveryCount: 28,
    badges: ['trend_spotter'],
    totalPlays: 243
  },
  {
    id: 'user9',
    address: '1KqpRwzkkeweW5jQab21SS3FYVARpLdwTKcUQKMW9PhW',
    username: 'RhythmRider',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    influenceScore: 291,
    discoveryCount: 22,
    badges: ['music_enthusiast'],
    totalPlays: 187
  },
  {
    id: 'user10',
    address: '0KqpRwzkkeweW5jQzx21SS3FYVARpLdwTKcUQKMW9PhV',
    username: 'BeatBooster',
    profileImage: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c',
    influenceScore: 203,
    discoveryCount: 18,
    badges: ['early_adopter'],
    totalPlays: 149
  }
];

// Top 3 user cards
const TopUserCard = ({ 
  user, 
  rank 
}: { 
  user: User; 
  rank: 1 | 2 | 3; 
}) => {
  const color = rank === 1 
    ? 'from-yellow-600 to-yellow-400' 
    : rank === 2 
      ? 'from-gray-500 to-gray-300' 
      : 'from-amber-700 to-amber-500';
  
  const size = rank === 1 ? 'h-full' : 'h-[90%]';
  const icon = rank === 1 
    ? <Crown className="text-yellow-300" size={24} /> 
    : rank === 2 
      ? <Medal className="text-gray-300" size={24} /> 
      : <Medal className="text-amber-500" size={24} />;
  
  return (
    <motion.div 
      className={`${size} bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (rank - 1) * 0.1 }}
    >
      {/* Rank badge */}
      <div className={`absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold">{rank}</span>
      </div>
      
      {/* Trophy icon */}
      <div className="absolute top-4 right-4">
        {icon}
      </div>
      
      <div className="p-6 flex flex-col items-center h-full">
        {/* Profile image */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-full border-2 border-${rank === 1 ? 'yellow' : rank === 2 ? 'gray' : 'amber'}-500 overflow-hidden`}>
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.username || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.username?.charAt(0) || user.address.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Username */}
        <h3 className="text-white font-bold mt-4 text-lg">
          {user.username || truncateAddress(user.address)}
        </h3>
        
        {/* Influence score */}
        <div className="mt-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full px-4 py-1 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          {user.influenceScore} points
        </div>
        
        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-gray-300 text-sm">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-purple-400" />
            <span>{user.discoveryCount} discoveries</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-purple-400" />
            <span>{user.totalPlays} plays</span>
          </div>
        </div>
        
        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {user.badges.map((badge) => (
              <span 
                key={badge} 
                className="bg-purple-900/40 text-purple-200 py-0.5 px-2 rounded-full text-xs"
              >
                {badge.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Leaderboard table row
const LeaderboardRow = ({ 
  user, 
  rank, 
  change, 
  isCurrentUser 
}: { 
  user: User; 
  rank: number; 
  change?: number;
  isCurrentUser?: boolean;
}) => {
  return (
    <motion.tr 
      className={`${
        isCurrentUser 
          ? 'bg-purple-900/20 border border-purple-500/40' 
          : 'hover:bg-card/30'
      } transition-colors`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.03 }}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center">
        <span className="text-gray-300">{rank}</span>
      </td>
      
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.username || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.username?.charAt(0) || user.address.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <div className="text-white font-medium">
              {user.username || truncateAddress(user.address)}
            </div>
            <div className="text-gray-400 text-xs">
              {truncateAddress(user.address)}
            </div>
          </div>
        </div>
      </td>
      
      {/* Score */}
      <td className="px-4 py-3 text-right">
        <span className="text-white font-semibold">{user.influenceScore}</span>
      </td>
      
      {/* Discoveries */}
      <td className="px-4 py-3 text-center hidden md:table-cell">
        <span className="text-gray-300">{user.discoveryCount}</span>
      </td>
      
      {/* Change */}
      <td className="px-4 py-3 text-right hidden md:table-cell">
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 ${
            change > 0 
              ? 'text-green-400' 
              : change < 0 
                ? 'text-red-400' 
                : 'text-gray-400'
          }`}>
            {change > 0 ? (
              <>
                <ChevronUp size={16} />
                <span>{change}</span>
              </>
            ) : change < 0 ? (
              <>
                <ChevronDown size={16} />
                <span>{Math.abs(change)}</span>
              </>
            ) : (
              <>
                <ChevronsRight size={16} />
                <span>0</span>
              </>
            )}
          </div>
        )}
      </td>
      
      {/* Action */}
      <td className="px-4 py-3 text-center">
        <Link href={`/profile`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
          >
            View
          </Button>
        </Link>
      </td>
    </motion.tr>
  );
};

// Filter Periods
type PeriodFilter = 'all' | 'monthly' | 'weekly' | 'daily';

// Main Leaderboard Page
const LeaderboardPage = () => {
  const { connected, walletAddress } = useSolanaWallet();
  
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, fetch from API based on the period filter
        // For now, use mock data
        
        // Simulating different data for different periods
        let data = [...mockLeaderboard];
        
        if (periodFilter === 'monthly') {
          // Shuffle a bit for monthly
          data = data.map(user => ({
            ...user,
            influenceScore: Math.floor((user.influenceScore ?? 0) * 0.7)
          })).sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0));
        } else if (periodFilter === 'weekly') {
          // More shuffling for weekly
          data = data.map(user => ({
            ...user,
            influenceScore: Math.floor((user.influenceScore ?? 0) * 0.4)
          })).sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0));
        } else if (periodFilter === 'daily') {
          // Even more shuffling for daily
          data = data.map(user => ({
            ...user,
            influenceScore: Math.floor((user.influenceScore ?? 0) * 0.2)
          })).sort((a, b) => (b.influenceScore ?? 0) - (a.influenceScore ?? 0));
        }
        
        setLeaderboard(data);
        
        // Find current user's rank if connected
        if (connected && walletAddress) {
          const userAddress = walletAddress.toString();
          const userIndex = data.findIndex(user => user.address === userAddress);
          if (userIndex !== -1) {
            setCurrentUserRank(userIndex + 1);
          } else {
            setCurrentUserRank(null);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [connected, walletAddress, periodFilter]);
  
  // Filter handler
  const handleFilterChange = (period: PeriodFilter) => {
    setPeriodFilter(period);
  };
  
  // Random changes for UI demonstration
  const getRandomChange = (index: number): number => {
    const changes = [2, -1, 0, 3, -2, 1, 0, -3, 4, -1];
    return changes[index % changes.length];
  };
  
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  
  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Influence</span> Leaderboard
          </h1>
          <p className="text-purple-300 mt-2">
            Discover the most influential users on sasphy
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Filters */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-purple-900/20 rounded-xl p-5 mb-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-400" />
              Top Influencers
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-900/50 rounded-lg">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`rounded px-3 py-1 text-sm ${
                    periodFilter === 'all' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => handleFilterChange('monthly')}
                  className={`rounded px-3 py-1 text-sm ${
                    periodFilter === 'monthly' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleFilterChange('weekly')}
                  className={`rounded px-3 py-1 text-sm ${
                    periodFilter === 'weekly' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleFilterChange('daily')}
                  className={`rounded px-3 py-1 text-sm ${
                    periodFilter === 'daily' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse h-72">
                <div className="p-6 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full mb-4" />
                  <div className="h-6 bg-gray-800 rounded w-24 mb-3" />
                  <div className="h-5 bg-gray-800 rounded w-32 mb-4" />
                  <div className="h-4 bg-gray-800 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Top 3 users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {top3.map((user, index) => (
                <TopUserCard 
                  key={user.id} 
                  user={user} 
                  rank={(index + 1) as 1 | 2 | 3} 
                />
              ))}
            </div>
            
            {/* Leaderboard table */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/30 border-b border-gray-800">
                      <th className="px-4 py-3 text-center text-gray-400 font-semibold text-sm w-16">Rank</th>
                      <th className="px-4 py-3 text-left text-gray-400 font-semibold text-sm">User</th>
                      <th className="px-4 py-3 text-right text-gray-400 font-semibold text-sm w-24">Score</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-semibold text-sm w-24 hidden md:table-cell">Discoveries</th>
                      <th className="px-4 py-3 text-right text-gray-400 font-semibold text-sm w-24 hidden md:table-cell">Change</th>
                      <th className="px-4 py-3 text-center text-gray-400 font-semibold text-sm w-20">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {rest.map((user, index) => (
                      <LeaderboardRow
                        key={user.id}
                        user={user}
                        rank={index + 4}
                        change={getRandomChange(index)}
                        isCurrentUser={walletAddress?.toString() === user.address}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination placeholder */}
              <div className="p-4 border-t border-gray-800 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing 1-10 of {leaderboard.length}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    disabled
                  >
                    &lt;
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-purple-900/30 border-purple-500/30 text-purple-300"
                    disabled
                  >
                    1
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    disabled
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Current user section */}
            {connected && currentUserRank === null && (
              <div className="mt-8 bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-purple-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Join the Leaderboard</h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Start discovering music and building your influence to appear on the leaderboard.
                  The more tracks you discover early, the higher your influence score will climb!
                </p>
                <Link href="/discover">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    Discover Music
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
