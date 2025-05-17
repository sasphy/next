interface Window {
  ENV: {
    API_URL: string;
    STORAGE_URL: string;
    FRONTEND_URL: string;
    FACTORY_ADDRESS: string;
    CONVEX_URL: string;
    GATEWAY_URL: string;
    SOLANA_NETWORK: string;
    SOLANA_PROGRAM_ID: string;
    SOLANA_ADMIN_WALLET: string;
    SOLANA_TREASURY_ADDRESS: string;
    SOLANA_PROTOCOL_PDA: string;
    IS_DEV: string | boolean; // Allow both string and boolean
    [key: string]: any; // Allow any other properties
  };
  reloadEnvVars?: () => void; // Added for convex client provider
}
