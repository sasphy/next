'use client';

import { useState, useEffect } from 'react';
import { useMusicPlayer } from '@/components/music/music-player-context';
import { Track } from '@/lib/types';
import MusicNFTCard from '@/components/music/music-nft-card';
import { Button } from '@/components/ui/button';
import { Search, Filter, ListFilter, Wand2 } from 'lucide-react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { toast } from 'sonner';

// Mock data for discovery feed
const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Synthwave Collective',
    coverImage: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    price: '0.5',
    priceLabel: 'SOL',
    mintAddress: 'GH7ygRh8gYz5D3i4Lb4HGBCAHj7rLrw3FHj51MKjjFRC',
  },
  {
    id: '2',
    title: 'Midnight Cruise',
    artist: 'The Digital Horizon',
    coverImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    price: '0.8',
    priceLabel: 'SOL',
    mintAddress: '4KN1T6G8oNPCS3DzErT8hzQZAJLXjwRqcXZXS5JEguh5',
  },
  {
    id: '3',
    title: 'Solar Flares',
    artist: 'Cosmic Waves',
    coverImage: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    price: '0.3',
    priceLabel: 'SOL',
    mintAddress: '8zH1mfig2bU4GMRXgQfVkHnmCHwL7buaYbpdYNipFhA1',
  },
  {
    id: '4',
    title: 'Urban Jungle',
    artist: 'City Beats',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    price: '1.2',
    priceLabel: 'SOL',
    mintAddress: 'FbU3HsMkiLKPfFdgQrCnhT6JYH6yP1vmaPRk68JYvqSz',
  },
  {
    id: '5',
    title: 'Floating',
    artist: 'Ambient Echoes',
    coverImage: 'https://images.unsplash.com/photo-1559825481-12a05cc00344',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    price: '0.6',
    priceLabel: 'SOL',
    mintAddress: 'FQKVWRZKhHvNsSWTjBpEbdwUkXaJSNdK2L6FxfzxJHK4',
  },
  {
    id: '6',
    title: 'Digital Revolution',
    artist: 'Tech Pioneers',
    coverImage: 'https://images.unsplash.com/photo-1504276048855-f3d60e69632f',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    price: '0.9',
    priceLabel: 'SOL',
    mintAddress: '7zsKqaDZHJW72QXYcumMjjfEkKaLMdkFprWsZSZRrLQH',
  },
];

interface DiscoveryFeedProps {
  tracks?: Track[];
  filter?: string;
}

const DiscoveryFeed = ({ tracks = MOCK_TRACKS, filter }: DiscoveryFeedProps) => {
  const { playTrack, currentTrackId, addToQueue } = useMusicPlayer();
  const { handleSendTransaction, walletAddress, isLoadingTransaction } = useSolanaWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Filter tracks based on search query and selected filter
    const filtered = tracks.filter(track => {
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (typeof track.artist === 'string' 
          ? track.artist.toLowerCase().includes(searchQuery.toLowerCase())
          : track.artist.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (selectedFilter === 'all') return matchesSearch;
      
      // Add more filter conditions as needed
      return matchesSearch;
    });
    
    setFilteredTracks(filtered);
  }, [searchQuery, selectedFilter, tracks]);

  const handlePlay = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      playTrack(track);
    }
  };

  const handlePurchase = async (id: string) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // This is a mock purchase function
    // In a real application, you would call your Metaplex purchase function
    
    toast.success('Purchase completed');
  };

  return (
    <div className="w-full">
      {/* Filters & Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            className={selectedFilter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-gray-300'}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'trending' ? 'default' : 'outline'}
            className={selectedFilter === 'trending' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-gray-300'}
            onClick={() => setSelectedFilter('trending')}
          >
            <Wand2 size={16} className="mr-1" />
            Trending
          </Button>
          <Button
            variant={selectedFilter === 'new' ? 'default' : 'outline'}
            className={selectedFilter === 'new' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-gray-300'}
            onClick={() => setSelectedFilter('new')}
          >
            New
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <Filter size={16} />
          </Button>
        </div>
      </div>
      
      {/* Tracks Grid */}
      {filteredTracks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <MusicNFTCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              imageUrl={track.coverImage || "/assets/album-1.jpg"}
              audioPreviewUrl={track.previewUrl || ""}
              price={parseFloat(track.price)}
              available={25} // Mock availability
              likes={Math.floor(Math.random() * 100)} // Mock likes
              mintAddress={track.mintAddress}
              onPlay={handlePlay}
              isPlaying={currentTrackId === track.id}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <ListFilter size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
          <p className="text-gray-400">Try adjusting your search or filter to find what you're looking for</p>
        </div>
      )}
    </div>
  );
};

export default DiscoveryFeed;
