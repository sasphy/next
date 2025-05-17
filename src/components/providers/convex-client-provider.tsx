'use client';

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useState, useEffect } from "react";
import env from "@/lib/env";

// ENV type is already defined in src/types/global.d.ts

function EnvWarning() {
  const [dismissed, setDismissed] = useState(false);
  
  // Don't render if dismissed
  if (dismissed) return null;
  
  // Check window.ENV in real-time
  const windowConvexUrl = typeof window !== 'undefined' && window.ENV?.CONVEX_URL;
  const windowFactoryAddress = typeof window !== 'undefined' && window.ENV?.FACTORY_ADDRESS;
  
  // If values are already in window.ENV, show a different message
  const hasWindowEnvValues = windowConvexUrl && windowFactoryAddress;
  
  // Trigger reloading of env vars from window.ENV
  const reloadEnvVars = () => {
    if (typeof window !== 'undefined' && window.reloadEnvVars) {
      window.reloadEnvVars();
    } else {
      window.location.reload();
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-4">
      <div className="bg-red-900/90 text-white p-6 rounded-lg max-w-xl w-full shadow-xl">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold mb-4">Missing Environment Variables</h2>
          <button 
            onClick={() => setDismissed(true)}
            className="text-white hover:text-red-200 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
        
        {hasWindowEnvValues ? (
          <>
            <p className="mb-4">
              Environment variables are available in <code>window.ENV</code> but not in <code>process.env</code>. 
              This is often a temporary issue during development.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={reloadEnvVars} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Reload Environment Variables
              </button>
              <button 
                onClick={() => setDismissed(true)} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4">
              Your app is missing critical environment variables. Please check your .env.local file and add the following:
            </p>
            <div className="bg-gray-900 p-4 rounded-md text-sm font-mono mb-4 overflow-auto">
              {!env.convexUrl && !windowConvexUrl && <div className="text-yellow-400">NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud</div>}
              {!env.factoryAddress && !windowFactoryAddress && <div className="text-yellow-400">NEXT_PUBLIC_FACTORY_ADDRESS=0x5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV</div>}
            </div>
            <p className="text-sm text-gray-300 mb-4">
              After adding these variables, restart your development server.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setDismissed(true)} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Use useState and useEffect to handle client-side-only rendering to avoid hydration mismatch
  const [showWarning, setShowWarning] = useState(false);
  
  // Use useMemo to avoid recreating the client on each render
  const client = useMemo(() => {
    try {
      // Try to get from window.ENV first (client-side), then fall back to env object
      const convexUrl = 
        (typeof window !== 'undefined' && window.ENV?.CONVEX_URL) || 
        env.convexUrl || 
        process.env.NEXT_PUBLIC_CONVEX_URL;
      
      if (!convexUrl) {
        console.error("Convex URL is missing. Please set NEXT_PUBLIC_CONVEX_URL in your .env file.");
        // Return a dummy client to avoid breaking the app
        // This will show a proper error in the UI later
        return new ConvexReactClient("https://example.convex.cloud");
      }
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error("Failed to initialize Convex client:", error);
      // Return a dummy client to avoid breaking the app
      return new ConvexReactClient("https://example.convex.cloud");
    }
  }, []);
  
  // Check for missing env vars client-side only and consider window.ENV
  useEffect(() => {
    // Check both env object and window.ENV
    const windowConvexUrl = typeof window !== 'undefined' && window.ENV?.CONVEX_URL;
    const windowFactoryAddress = typeof window !== 'undefined' && window.ENV?.FACTORY_ADDRESS;
    
    // Only show warning if variables are missing from both env and window.ENV
    const hasMissingEnvVars = (!env.convexUrl && !windowConvexUrl) || 
                           (!env.factoryAddress && !windowFactoryAddress);
    
    // Add a delay to allow window.ENV to be populated
    const timer = setTimeout(() => {
      setShowWarning(hasMissingEnvVars);
    }, 1000); // 1-second delay
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <ConvexProvider client={client}>
      {showWarning && <EnvWarning />}
      {children}
    </ConvexProvider>
  );
}

export default ConvexClientProvider; 