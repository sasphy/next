'use client';

import { useState, useEffect } from 'react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { Trophy, TrendingUp, Search, Users, Headphones, Badge, Crown, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { truncateAddress } from '@/lib/utils';
import { toast } from 'sonner';

// Fake data for development
const DUMMY_LEADERBOARD = Array.from({ length: 100 }, (_, i) => ({
  id: `user-${i + 1}`,
  walletAddress: `${Array(44).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  username: [
    'CryptoBeats', 'SolSerenade', 'VibeVault', 'SoundWave', 'TokenTracker',
    'MelodyMiner', 'ChainChord', 'DecentralizedDJ', 'NFTunes', 'BlockBeat',
    'SolanaSound', 'MusicalMinter', 'RhythmRing', 'TuneToken', 'SymphonicSOL'
  ][Math.floor(Math.random() * 15)],
  rank: i + 1,
  score: Math.floor(Math.random() * 5000) + 500,
  previousRank: Math.min(100, Math.max(1, i + 1 + Math.floor(Math.random() * 7) - 3)),
  level: Math.floor(Math.random() * 10) + 1,
  tracksDiscovered: Math.floor(Math.random() * 100) + 1,
  trendsSpotted: Math.floor(Math.random() * 20),
  badges: Math.floor(Math.random() * 10)
})).sort((a, b) => b.score - a.score);

// Add rank based on sorted order
DUMMY_LEADERBOARD.forEach((user, index) => {
  user.rank = index + 1;
});

// User info interface
interface LeaderboardUser {
  id: string;
  walletAddress: string;
  username: string;
  rank: number;
  score: number;
  previousRank: number;
  level: number;
  tracksDiscovered: number;
  trendsSpotted: number;
  badges: number;
}

// Badge component
const BadgeComponent = ({ type }: { type: string }) => {
  const badgeColors: Record<string, { bg: string, text: string }> = {
    'gold': { bg: 'bg-yellow-500', text: 'text-yellow-200' },
    'silver': { bg: 'bg-gray-400', text: 'text-gray-100' },
    'bronze': { bg: 'bg-amber-700', text: 'text-amber-100' },
    'pioneer': { bg: 'bg-purple-600', text: 'text-purple-200' },
    'trendsetter': { bg: 'bg-blue-600', text: 'text-blue-200' },
    'curator': { bg: 'bg-green-600', text: 'text-green-200' },
  };
  
  const colors = badgeColors[type] || { bg: 'bg-gray-700', text: 'text-gray-300' };
  
  return (
    <div className={`px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-xs font-semibold`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </div>
  );
};

// Rank change component
const RankChange = ({ current, previous }: { current: number; previous: number }) => {
  const diff = previous - current;
  
  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <ArrowUp size={14} />
        <span className="text-xs">{diff}</span>
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <ArrowDown size={14} />
        <span className="text-xs">{Math.abs(diff)}</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus size={14} />
      </div>
    );
  }
};

// Leaderboard row component
const LeaderboardRow = ({ 
  user, 
  isCurrentUser 
}: { 
  user: LeaderboardUser; 
  isCurrentUser: boolean;
}) => {
  return (
    <motion.tr
      className={`border-b border-gray-800 ${isCurrentUser ? 'bg-purple-900/20' : 'hover:bg-gray-900/50'}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ backgroundColor: isCurrentUser ? 'rgba(124, 58, 237, 0.2)' : 'rgba(17, 24, 39, 0.5)' }}
    >
      <td className="px-4 py-4 text-center">
        <div className="flex justify-center items-center">
          {user.rank <= 3 ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.rank === 1 
                ? 'bg-yellow-500/20 text-yellow-500' 
                : user.rank === 2 
                  ? 'bg-gray-400/20 text-gray-400' 
                  : 'bg-amber-700/20 text-amber-700'
            }`}>
              <Crown size={16} />
            </div>
          ) : (
            <div className="text-gray-400 font-medium">{user.rank}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            user.rank === 1 
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' 
              : user.rank === 2 
                ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                : user.rank === 3 
                  ? 'bg-gradient-to-br from-amber-700 to-amber-800' 
                  : 'bg-gradient-to-br from-purple-600 to-indigo-600'
          }`}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={`font-medium ${isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
              {user.username}
            </div>
            <div className="text-xs text-gray-400">{truncateAddress(user.walletAddress)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="text-gray-300">{user.level}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-white">{user.score.toLocaleString()}</div>
          <RankChange current={user.rank} previous={user.previousRank} />
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="text-gray-300">{user.tracksDiscovered}</div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="text-gray-300">{user.trendsSpotted}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {user.badges > 0 && user.rank <= 10 && <BadgeComponent type="gold" />}
          {user.badges > 1 && user.rank <= 50 && <BadgeComponent type="silver" />}
          {user.badges > 2 && <BadgeComponent type="bronze" />}
          {user.badges > 3 && <BadgeComponent type="pioneer" />}
          {user.badges > 5 && <BadgeComponent type="trendsetter" />}
          {user.badges > 7 && <BadgeComponent type="curator" />}
        </div>
      </td>
    </motion.tr>
  );
};

// Leaderboard Page
const LeaderboardPage = () => {
  const { connected, walletAddress } = useSolanaWallet();
  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  
  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this from an API
        // For now, use dummy data
        const data = DUMMY_LEADERBOARD;
        
        // For demonstration - make the connected wallet be in the leaderboard
        if (connected && walletAddress) {
          const randomPosition = Math.floor(Math.random() * 20) + 5; // Position 5-25
          const userIndex = data.findIndex(u => u.rank === randomPosition);
          
          if (userIndex >= 0) {
            data[userIndex].walletAddress = walletAddress.toString();
            setCurrentUserRank(randomPosition);
          }
        }
        
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [connected, walletAddress]);
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.walletAddress.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  // Generate stats based on current users
  const stats = {
    totalUsers: users.length,
    topScore: users.length > 0 ? users[0].score : 0,
    avgScore: users.length > 0 
      ? Math.floor(users.reduce((sum, user) => sum + user.score, 0) / users.length) 
      : 0,
    totalTrendsSpotted: users.reduce((sum, user) => sum + user.trendsSpotted, 0)
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Influence Leaderboard</h1>
          <p className="text-purple-300">Top music trendsetters on sasphy</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900 rounded-lg border border-gray-800">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1.5 text-sm font-medium ${
                timeRange === 'weekly'
                  ? 'bg-purple-600 text-white rounded-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1.5 text-sm font-medium ${
                timeRange === 'monthly'
                  ? 'bg-purple-600 text-white rounded-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('allTime')}
              className={`px-3 py-1.5 text-sm font-medium ${
                timeRange === 'allTime'
                  ? 'bg-purple-600 text-white rounded-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Participants</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Top Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.topScore.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Average Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.avgScore.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Trends Spotted</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalTrendsSpotted.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Current User Card - show only if connected and found in leaderboard */}
      {connected && currentUserRank !== null && (
        <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/30 p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600/20 p-2 rounded-full">
                <Crown className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Your Current Rank</h3>
                <p className="text-purple-300 text-sm">
                  {timeRange === 'weekly' ? 'This Week' : timeRange === 'monthly' ? 'This Month' : 'All Time'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm">Rank</div>
                <div className="text-2xl font-bold text-white">#{currentUserRank}</div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-400 text-sm">Score</div>
                <div className="text-2xl font-bold text-white">
                  {users.find(u => u.walletAddress === walletAddress?.toString())?.score.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-400 text-sm">Level</div>
                <div className="text-2xl font-bold text-white">
                  {users.find(u => u.walletAddress === walletAddress?.toString())?.level || 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by username or wallet address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      
      {/* Leaderboard Table */}
      <div className="bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/6"></div>
                </div>
                <div className="w-12 h-4 bg-gray-800 rounded"></div>
                <div className="w-16 h-4 bg-gray-800 rounded"></div>
                <div className="w-12 h-4 bg-gray-800 rounded"></div>
                <div className="w-20 h-6 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800">
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Influence Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center">
                    <Headphones size={12} className="mr-1" /> Discoveries
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center">
                    <TrendingUp size={12} className="mr-1" /> Trends
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <Badge size={12} className="mr-1" /> Badges
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <LeaderboardRow
                    key={user.id}
                    user={user}
                    isCurrentUser={connected && user.walletAddress === walletAddress?.toString()}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <Trophy className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 mb-4">
              Try adjusting your search query or check back later for updated rankings.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Show All Users
            </button>
          </div>
        )}
      </div>
      
      {/* Explanation Section */}
      <div className="mt-10 bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-xl border border-purple-900/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">How Influence Works</h2>
        <div className="text-gray-400 space-y-4">
          <p>
            Sasphy rewards users for discovering and promoting music before it becomes popular. 
            Earn influence points when tracks you discover early gain traction in the community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="bg-purple-900/30 p-2 rounded-lg w-fit mb-3">
                <Headphones className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Discover Early</h3>
              <p className="text-sm text-gray-400">
                Find and collect music NFTs before they become trending. The earlier you discover a track, the higher your potential rewards.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="bg-purple-900/30 p-2 rounded-lg w-fit mb-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Earn Points</h3>
              <p className="text-sm text-gray-400">
                Gain influence points when tracks you've discovered reach popularity milestones. Points scale with a track's success.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="bg-purple-900/30 p-2 rounded-lg w-fit mb-3">
                <Badge className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Unlock Rewards</h3>
              <p className="text-sm text-gray-400">
                Earn badges, levels, and special privileges as your influence score grows. Higher ranks may receive exclusive perks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
