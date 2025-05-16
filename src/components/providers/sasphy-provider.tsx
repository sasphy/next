'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { sasphyApi } from '@/lib/blockchain-api';
import { Track, TokenOwnership, User, PlaylistType, Artist, Playlist, SearchResults } from '@/lib/types';
import { toast } from 'sonner';
import { reloadClientEnv, getEnvVar } from '@/lib/reload-env';

interface CurrentlyPlaying {
  track: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playlist: Track[];
  playlistType: PlaylistType;
  playlistId?: string;
}

interface SasphyContextType {
  api: typeof sasphyApi;
  isAuthenticated: boolean;
  address: string | null;
  user: User | null;
  login: (address: string, signature: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  fetchTracks: (filter?: string) => Promise<Track[]>;
  loadTrackDetail: (trackId: string) => Promise<Track | null>;
  purchaseTrack: (tokenId: number, price?: string) => Promise<boolean>;
  checkOwnership: (tokenId: number) => Promise<TokenOwnership | null>;
  currentlyPlaying: CurrentlyPlaying;
  playTrack: (track: Track, playlist?: Track[], playlistType?: PlaylistType, playlistId?: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  isTrackInLibrary: (trackId: string) => boolean;
  addToLibrary: (trackId: string) => Promise<boolean>;
  removeFromLibrary: (trackId: string) => Promise<boolean>;
}

const SasphyContext = createContext<SasphyContextType | undefined>(undefined);

const INITIAL_PLAYER_STATE: CurrentlyPlaying = {
  track: null,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  playlist: [],
  playlistType: 'discover'
};

export function SasphyProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(sasphyApi.hasToken);
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying>(INITIAL_PLAYER_STATE);
  const [library, setLibrary] = useState<Set<string>>(new Set());
  
  // Add refs for caching tracks to improve performance
  const tracksCache = useRef<{
    data: Track[] | null;
    timestamp: number;
    isFetching: boolean;
  }>({ data: null, timestamp: 0, isFetching: false });
  
  const trackDetailsCache = useRef<Map<string, { data: Track, timestamp: number }>>(new Map());
  
  // Audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Check if component is mounted to avoid memory leaks
  const isMounted = useRef<boolean>(true);

  // Initialize from localStorage if token exists
  useEffect(() => {
    // Make sure environment variables are loaded correctly
    if (typeof window !== 'undefined') {
      reloadClientEnv();
      
      // Log the environment for debugging
      console.log('SasphyProvider - window.ENV:', window.ENV);
      console.log('SasphyProvider - API_URL:', getEnvVar('API_URL'));
      
      // Reinitialize API client with correct baseUrl
      const apiUrl = getEnvVar('API_URL') || window.ENV?.API_URL;
      if (apiUrl) {
        // @ts-ignore - SolanaAPI has protected constructor
        sasphyApi.baseUrl = `${apiUrl}/blockchain`;
        console.log('Updated SasphyAPI baseUrl to:', sasphyApi.baseUrl);
      }
    }
    
    sasphyApi.initToken();
    setIsAuthenticated(sasphyApi.hasToken);
    
    // If we have a token in the form of a wallet address, set it
    if (sasphyApi.token) {
      setAddress(sasphyApi.token);
      // Load user profile if authenticated
      loadUserProfile();
    }
    
    // Create audio element
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      
      // Set default volume
      if (audioRef.current) {
        audioRef.current.volume = currentlyPlaying.volume;
      }
      
      // Add event listeners
      setupAudioEvents();
    }
    
    return () => {
      isMounted.current = false;
      // Clean up audio element and event listeners
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Set up audio event listeners
  const setupAudioEvents = () => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (isMounted.current && audio) {
        setCurrentlyPlaying(prev => ({
          ...prev,
          progress: audio.currentTime,
          duration: audio.duration || 0
        }));
      }
    };
    
    const handleEnded = () => {
      if (isMounted.current) {
        nextTrack();
      }
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      toast.error('Error playing track. Please try again.');
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  };
  
  // Load user profile and library
  const loadUserProfile = async () => {
    if (!sasphyApi.hasToken) return;
    
    try {
      const response = await sasphyApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        
        // Load user's library
        const libraryResponse = await sasphyApi.getLibrary();
        if (libraryResponse.success && libraryResponse.data) {
          setLibrary(new Set(libraryResponse.data.map(track => track.id)));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (address: string, signature: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await sasphyApi.login(address, signature);
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setAddress(address);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sasphyApi.clearToken();
    setIsAuthenticated(false);
    setAddress(null);
    setUser(null);
    setLibrary(new Set());
  };

  const fetchTracks = useCallback(async (filter?: string): Promise<Track[]> => {
    // Use cache if available and less than 5 minutes old
    const now = Date.now();
    if (
      tracksCache.current.data && 
      !filter &&
      now - tracksCache.current.timestamp < 300000 && // 5 minutes
      !tracksCache.current.isFetching
    ) {
      return tracksCache.current.data;
    }
    
    // Prevent multiple simultaneous fetches
    if (tracksCache.current.isFetching) {
      // Wait for current fetch to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      if (tracksCache.current.data) {
        return tracksCache.current.data;
      }
    }
    
    tracksCache.current.isFetching = true;
    setLoading(true);
    
    try {
      // IMPROVEMENT: Always generate mock data in development mode,
      // or if API URL is not configured
      if (process.env.NODE_ENV === 'development' || 
          typeof window !== 'undefined' && 
          (!window.ENV?.API_URL || !sasphyApi.baseUrl)) {
        
        console.warn('⚠️ Using mock data in development environment or API URL not configured');
        
        // Generate consistent mock tracks
        const mockTracks: Track[] = generateMockTracks();
        
        // Cache the mock data
        tracksCache.current.data = mockTracks;
        tracksCache.current.timestamp = now;
        
        return mockTracks;
      }
      
      // Make the actual API request
      try {
        const response = await sasphyApi.getTracks(filter);
        if (response.success && response.data) {
          // Update cache if no filter was used
          if (!filter) {
            tracksCache.current.data = response.data;
            tracksCache.current.timestamp = now;
          }
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch tracks');
        }
      } catch (apiError) {
        console.error('⚠️ API error in fetchTracks:', apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Error in fetchTracks:', error);
      
      console.warn('Generating mock tracks due to API error');
      
      // Generate mock tracks with consistent IDs
      const mockTracks: Track[] = generateMockTracks();
      
      // Cache the mock data
      tracksCache.current.data = mockTracks;
      tracksCache.current.timestamp = now;
      
      return mockTracks;
    } finally {
      tracksCache.current.isFetching = false;
      setLoading(false);
    }
  }, []);
  
  // Helper function to generate consistent mock tracks
  const generateMockTracks = (): Track[] => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `mock-${i}`,
      title: `Mock Track ${i + 1}`,
      artist: { id: 'mock-artist', name: 'Mock Artist' },
      coverArt: `/api/placeholder/500/500`,
      duration: 180 + Math.floor(Math.random() * 120),
      genre: ['Electronic', 'Hip Hop', 'Rock', 'Pop'][Math.floor(Math.random() * 4)],
      price: (0.1 + Math.random() * 0.5).toFixed(2),
      releaseDate: new Date().toISOString(),
      tokenId: 1000 + i,
      shortAudioUrl: '/api/placeholder/audio',
      fullAudioUrl: '/api/placeholder/audio'
    }));
  };

  const loadTrackDetail = async (trackId: string): Promise<Track | null> => {
    // Check cache first
    const cached = trackDetailsCache.current.get(trackId);
    const now = Date.now();
    if (cached && (now - cached.timestamp < 300000)) { // 5 minutes
      return cached.data;
    }
    
    setLoading(true);
    try {
      const response = await sasphyApi.getTrack(trackId);
      if (response.success && response.data) {
        // Cache the result
        trackDetailsCache.current.set(trackId, {
          data: response.data,
          timestamp: now
        });
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error loading track ${trackId}:`, error);
      // Still return cached data if available, even if older than 5 minutes
      if (cached) {
        toast.error('Using cached data due to network error');
        return cached.data;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const purchaseTrack = async (tokenId: number, price?: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet to purchase tracks');
      return false;
    }
    
    setLoading(true);
    try {
      const response = await sasphyApi.purchaseTrack(tokenId, price);
      if (response.success) {
        toast.success('Track purchased successfully!');
        // Refresh user profile to update ownership
        await loadUserProfile();
        return true;
      } else {
        toast.error(response.message || 'Purchase failed');
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('An error occurred during purchase');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async (tokenId: number): Promise<TokenOwnership | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await sasphyApi.checkOwnership(tokenId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Ownership check error:', error);
      return null;
    }
  };
  
  // Audio player controls
  const playTrack = async (track: Track, playlist: Track[] = [], playlistType: PlaylistType = 'discover', playlistId?: string) => {
    if (!track || !track.id) {
      toast.error('Invalid track');
      return;
    }
    
    try {
      // Get streaming URL if not provided
      let streamUrl = track.fullAudioUrl;
      if (!streamUrl) {
        const response = await sasphyApi.getStreamUrl(track.id);
        if (response.success && response.data) {
          streamUrl = response.data.url;
        } else {
          toast.error('Failed to get streaming URL');
          return;
        }
      }
      
      // Set audio source and play
      if (audioRef.current) {
        audioRef.current.src = streamUrl;
        audioRef.current.play().catch(err => {
          console.error('Error playing track:', err);
          toast.error('Error playing track. Please try again.');
        });
      }
      
      // Update currently playing state
      setCurrentlyPlaying({
        track,
        isPlaying: true,
        volume: currentlyPlaying.volume,
        progress: 0,
        duration: track.duration || 0,
        playlist: playlist.length > 0 ? playlist : [track],
        playlistType,
        playlistId
      });
      
    } catch (error) {
      console.error('Error playing track:', error);
      toast.error('Error playing track. Please try again.');
    }
  };
  
  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentlyPlaying(prev => ({ ...prev, isPlaying: false }));
  };
  
  const resumeTrack = () => {
    if (audioRef.current && currentlyPlaying.track) {
      audioRef.current.play().catch(err => {
        console.error('Error resuming track:', err);
        toast.error('Error resuming playback. Please try again.');
      });
      setCurrentlyPlaying(prev => ({ ...prev, isPlaying: true }));
    }
  };
  
  const nextTrack = () => {
    const { playlist, track } = currentlyPlaying;
    if (!track || playlist.length <= 1) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    if (currentIndex < 0) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(
      playlist[nextIndex], 
      playlist, 
      currentlyPlaying.playlistType,
      currentlyPlaying.playlistId
    );
  };
  
  const prevTrack = () => {
    const { playlist, track } = currentlyPlaying;
    if (!track || playlist.length <= 1) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    if (currentIndex < 0) return;
    
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(
      playlist[prevIndex], 
      playlist, 
      currentlyPlaying.playlistType,
      currentlyPlaying.playlistId
    );
  };
  
  const setVolume = (volume: number) => {
    // Ensure volume is between 0 and 1
    const newVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setCurrentlyPlaying(prev => ({ ...prev, volume: newVolume }));
  };
  
  const setProgress = (progress: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = progress;
    }
    setCurrentlyPlaying(prev => ({ ...prev, progress }));
  };
  
  // Library management
  const isTrackInLibrary = (trackId: string): boolean => {
    return library.has(trackId);
  };
  
  const addToLibrary = async (trackId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet to add tracks to your library');
      return false;
    }
    
    try {
      const response = await sasphyApi.addToLibrary(trackId);
      if (response.success) {
        setLibrary(prev => new Set([...prev, trackId]));
        toast.success('Added to your library');
        return true;
      } else {
        toast.error(response.message || 'Failed to add to library');
        return false;
      }
    } catch (error) {
      console.error('Error adding to library:', error);
      toast.error('An error occurred. Please try again.');
      return false;
    }
  };
  
  const removeFromLibrary = async (trackId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }
    
    try {
      const response = await sasphyApi.removeFromLibrary(trackId);
      if (response.success) {
        setLibrary(prev => {
          const newLibrary = new Set(prev);
          newLibrary.delete(trackId);
          return newLibrary;
        });
        toast.success('Removed from your library');
        return true;
      } else {
        toast.error(response.message || 'Failed to remove from library');
        return false;
      }
    } catch (error) {
      console.error('Error removing from library:', error);
      toast.error('An error occurred. Please try again.');
      return false;
    }
  };

  const value = {
    api: sasphyApi,
    isAuthenticated,
    address,
    user,
    login,
    logout,
    loading,
    fetchTracks,
    loadTrackDetail,
    purchaseTrack,
    checkOwnership,
    currentlyPlaying,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    prevTrack,
    setVolume,
    setProgress,
    isTrackInLibrary,
    addToLibrary,
    removeFromLibrary
  };

  return (
    <SasphyContext.Provider value={value}>
      {children}
    </SasphyContext.Provider>
  );
}

export function useSasphy() {
  const context = useContext(SasphyContext);
  if (context === undefined) {
    throw new Error('useSasphy must be used within a SasphyProvider');
  }
  return context;
}