'use client';

import { useEffect, useState } from 'react';
import { sasphyApi } from '@/lib/blockchain-api';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * A debug component that shows system status and allows toggling simulation mode
 */
export function SystemDebug() {
  const [isSimulation, setIsSimulation] = useState<boolean>(true);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Fetch server status on mount
  useEffect(() => {
    fetchServerStatus();
  }, []);

  // Fetch server status
  const fetchServerStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get base API URL without the /blockchain path
      const baseUrl = typeof window !== 'undefined' && window.ENV?.API_URL 
        ? window.ENV.API_URL 
        : sasphyApi.baseUrl.replace(/\/blockchain$/, '');
      
      console.log(`Fetching server status from: ${baseUrl}/status`);
      const response = await fetch(`${baseUrl}/status`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setServerInfo(data);
      setIsSimulation(data.mode === 'simulation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server status');
      console.error('Error fetching server status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle simulation mode
  const toggleSimulationMode = async () => {
    setIsLoading(true);
    
    try {
      const newMode = !isSimulation;
      
      // Get base API URL without the /blockchain path
      const baseUrl = typeof window !== 'undefined' && window.ENV?.API_URL 
        ? window.ENV.API_URL 
        : sasphyApi.baseUrl.replace(/\/blockchain$/, '');
      
      // Call the admin endpoint to toggle simulation mode
      const response = await fetch(`${baseUrl}/admin/toggle-simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newMode })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle simulation mode: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error toggling simulation mode');
      }
      
      if (result.requiresRestart) {
        alert('Simulation mode updated. Server restart required for changes to take effect.');
      }
      
      // Refresh status
      await fetchServerStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle simulation mode');
      console.error('Error toggling simulation mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle expanded/collapsed state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading && !serverInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 m-2 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-yellow-800 font-semibold">System Status</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !serverInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-2 m-2 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-red-800 font-semibold">System Error</h3>
          <Button
            onClick={fetchServerStatus}
            className="p-1 h-6 text-xs bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            Retry
          </Button>
        </div>
        {isExpanded && <p className="mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`border rounded p-2 m-2 text-xs ${isSimulation ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${isSimulation ? 'text-amber-800' : 'text-green-800'}`}>
            {isSimulation ? 'Simulation Mode' : 'Production Mode'}
          </h3>
          <span className={`inline-block w-2 h-2 rounded-full ${isSimulation ? 'bg-amber-500' : 'bg-green-500'}`}></span>
        </div>
        
        <button 
          onClick={toggleExpanded}
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="mt-2 space-y-1 text-xs">
            <p>
              <span className="font-medium">Network:</span>{' '}
              <span className="font-mono">{serverInfo?.network || 'Unknown'}</span>
            </p>
            <p>
              <span className="font-medium">Wallet:</span>{' '}
              <span className="font-mono text-xs">{serverInfo?.wallet || 'Not connected'}</span>
            </p>
            <p>
              <span className="font-medium">Balance:</span>{' '}
              <span>{serverInfo?.balance !== undefined ? `${serverInfo.balance} SOL` : 'Unknown'}</span>
            </p>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <Button
              onClick={toggleSimulationMode}
              className={`p-1 h-6 text-xs ${isSimulation ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : isSimulation ? 'To Production' : 'To Simulation'}
            </Button>
            
            <Button
              onClick={fetchServerStatus}
              variant="outline"
              className="p-1 h-6 text-xs ml-2"
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default SystemDebug;