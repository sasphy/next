'use client';

import { useState, useEffect } from 'react';
import { apiHelpers } from '@/lib/api';

export default function ApiTestPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState({ tracks: true, leaderboard: true });
  const [error, setError] = useState({ tracks: '', leaderboard: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch tracks
        setLoading(prev => ({ ...prev, tracks: true }));
        const tracksResponse = await apiHelpers.tracks.getAll();
        if (tracksResponse.data.success) {
          setTracks(tracksResponse.data.data || []);
        } else {
          setError(prev => ({ 
            ...prev, 
            tracks: tracksResponse.data.message || 'Failed to fetch tracks' 
          }));
        }
      } catch (err) {
        setError(prev => ({ 
          ...prev, 
          tracks: 'Error connecting to API server'
        }));
        console.error('Failed to fetch tracks:', err);
      } finally {
        setLoading(prev => ({ ...prev, tracks: false }));
      }

      try {
        // Fetch leaderboard
        setLoading(prev => ({ ...prev, leaderboard: true }));
        const leaderboardResponse = await apiHelpers.discovery.getLeaderboard();
        if (leaderboardResponse.data.success) {
          setLeaderboard(leaderboardResponse.data.data || []);
        } else {
          setError(prev => ({ 
            ...prev, 
            leaderboard: leaderboardResponse.data.message || 'Failed to fetch leaderboard' 
          }));
        }
      } catch (err) {
        setError(prev => ({ 
          ...prev, 
          leaderboard: 'Error connecting to API server'
        }));
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(prev => ({ ...prev, leaderboard: false }));
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sasphy API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          {loading.tracks ? (
            <div className="py-4">Loading tracks...</div>
          ) : error.tracks ? (
            <div className="py-4 text-red-500">{error.tracks}</div>
          ) : tracks.length === 0 ? (
            <div className="py-4">No tracks found</div>
          ) : (
            <ul className="space-y-2">
              {tracks.map((track) => (
                <li key={track.id} className="border-b pb-2">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-gray-600">by {track.artist}</div>
                  <div className="text-sm text-gray-500">
                    Price: ${track.price} | Discoveries: {track.discoveryCount}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
          {loading.leaderboard ? (
            <div className="py-4">Loading leaderboard...</div>
          ) : error.leaderboard ? (
            <div className="py-4 text-red-500">{error.leaderboard}</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-4">No leaderboard entries found</div>
          ) : (
            <ul className="space-y-2">
              {leaderboard.map((entry) => (
                <li key={entry.userId} className="border-b pb-2">
                  <div className="font-medium">{entry.username}</div>
                  <div className="text-gray-600">Rank: {entry.evRank}</div>
                  <div className="text-sm text-gray-500">
                    EV Score: {entry.evScore}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 