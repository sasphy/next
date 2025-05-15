import React from "react";

export default function SystemDebug() {
  const [systemInfo, setSystemInfo] = React.useState({
    backendStatus: "Checking...",
    minioStatus: "Checking...",
    api: {
      tracks: "Checking...",
      audio: "Checking...",
      proxy: "Checking..."
    },
    env: {
      API_URL: "Unknown",
      MINIO_URL: "Unknown",
      FRONTEND_URL: "Unknown"
    }
  });

  React.useEffect(() => {
    // Get environment variables from window.ENV
    const env = (window as any).ENV || {};
    
    // Start with env update
    setSystemInfo(prev => ({
      ...prev,
      env: {
        API_URL: env.API_URL || "Not set",
        MINIO_URL: env.MINIO_URL || "Not set",
        FRONTEND_URL: env.FRONTEND_URL || "Not set"
      }
    }));
    
    // Check backend status
    fetch(env.API_URL || "http://localhost:4022")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(`Status ${res.status}`);
      })
      .then(data => {
        setSystemInfo(prev => ({
          ...prev,
          backendStatus: `OK - ${data.message || JSON.stringify(data).substring(0, 50)}`
        }));
      })
      .catch(err => {
        setSystemInfo(prev => ({
          ...prev,
          backendStatus: `ERROR - ${err.message}`
        }));
      });
      
    // Check MinIO status (will return 403 if running)
    fetch(env.MINIO_URL || "http://localhost:9000")
      .then(res => {
        setSystemInfo(prev => ({
          ...prev,
          minioStatus: res.status === 403 || res.status === 400 
            ? "OK - Running (403/400 is expected)"
            : `OK - Status ${res.status}`
        }));
      })
      .catch(err => {
        setSystemInfo(prev => ({
          ...prev,
          minioStatus: `ERROR - ${err.message}`
        }));
      });
      
    // Check API endpoints
    fetch("/api/blockchain/tracks")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(`Status ${res.status}`);
      })
      .then(data => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            tracks: `OK - ${data.data?.length || 0} tracks`
          }
        }));
      })
      .catch(err => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            tracks: `ERROR - ${err.message}`
          }
        }));
      });
      
    // Check audio endpoint
    fetch("/api/audio/1", { method: "HEAD" })
      .then(res => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            audio: res.ok 
              ? `OK - Status ${res.status}`
              : `ERROR - Status ${res.status}`
          }
        }));
      })
      .catch(err => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            audio: `ERROR - ${err.message}`
          }
        }));
      });
      
    // Check proxy endpoint with SVG fallback
    fetch("/api/proxy/ms-images/base/covers/c1.jpg")
      .then(res => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            proxy: res.ok 
              ? `OK - ${res.headers.get("content-type")}`
              : `ERROR - Status ${res.status}`
          }
        }));
      })
      .catch(err => {
        setSystemInfo(prev => ({
          ...prev,
          api: {
            ...prev.api,
            proxy: `ERROR - ${err.message}`
          }
        }));
      });
  }, []);

  return (
    <div className="bg-card p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">System Debug</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Environment Variables</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">API_URL:</div>
            <div>{systemInfo.env.API_URL}</div>
            <div className="font-medium">MINIO_URL:</div>
            <div>{systemInfo.env.MINIO_URL}</div>
            <div className="font-medium">FRONTEND_URL:</div>
            <div>{systemInfo.env.FRONTEND_URL}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Service Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Backend:</div>
            <div className={systemInfo.backendStatus.includes("ERROR") ? "text-red-500" : "text-green-500"}>
              {systemInfo.backendStatus}
            </div>
            <div className="font-medium">MinIO:</div>
            <div className={systemInfo.minioStatus.includes("ERROR") ? "text-red-500" : "text-green-500"}>
              {systemInfo.minioStatus}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">API Endpoints</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">/api/blockchain/tracks:</div>
            <div className={systemInfo.api.tracks.includes("ERROR") ? "text-red-500" : "text-green-500"}>
              {systemInfo.api.tracks}
            </div>
            <div className="font-medium">/api/audio/1:</div>
            <div className={systemInfo.api.audio.includes("ERROR") ? "text-red-500" : "text-green-500"}>
              {systemInfo.api.audio}
            </div>
            <div className="font-medium">/api/proxy/...:</div>
            <div className={systemInfo.api.proxy.includes("ERROR") ? "text-red-500" : "text-green-500"}>
              {systemInfo.api.proxy}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        If you see any errors above, please restart the services using the restart-complete-system.sh script.
      </div>
    </div>
  );
}
