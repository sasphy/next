'use client';

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useState, useEffect } from "react";
import env from "@/lib/env";

// Add ENV type to global Window interface
declare global {
  interface Window {
    ENV?: {
      CONVEX_URL?: string;
      FACTORY_ADDRESS?: string;
      [key: string]: string | undefined;
    }
  }
}

function EnvWarning() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-4">
      <div className="bg-red-900/90 text-white p-6 rounded-lg max-w-xl w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Missing Environment Variables</h2>
        <p className="mb-4">
          Your app is missing critical environment variables. Please check your .env.local file and add the following:
        </p>
        <div className="bg-gray-900 p-4 rounded-md text-sm font-mono mb-4 overflow-auto">
          {!env.convexUrl && <div className="text-yellow-400">NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud</div>}
          {!env.factoryAddress && <div className="text-yellow-400">NEXT_PUBLIC_FACTORY_ADDRESS=0x5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV</div>}
        </div>
        <p className="text-sm text-gray-300">
          After adding these variables, restart your development server.
        </p>
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
  
  // Check for missing env vars client-side only
  useEffect(() => {
    const hasMissingEnvVars = !env.convexUrl || !env.factoryAddress;
    setShowWarning(hasMissingEnvVars);
  }, []);
  
  return (
    <ConvexProvider client={client}>
      {showWarning && <EnvWarning />}
      {children}
    </ConvexProvider>
  );
}

export default ConvexClientProvider; 