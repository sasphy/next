import type { Metadata } from "next";
import "./globals.css";
import { Inter, Montserrat } from 'next/font/google';
import { SasphyProvider } from "@/components/providers/sasphy-provider";
import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";
import { MusicPlayerProvider } from "@/components/music/music-player-context";
import MusicPlayerBar from "@/components/music/music-player-bar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import MainNavigation from "@/components/main-navigation";
import ConvexClientProvider from "@/components/providers/convex-client-provider";
import ConvexAuthProvider from "@/components/providers/convex-auth-provider";
import EnvLoader from "@/components/env-loader";

// Environment variables for client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4022';
const STORAGE_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3004';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '';
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || '';
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || '';
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || '';
const SOLANA_PROGRAM_ID = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '';
const SOLANA_ADMIN_WALLET = process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || '';
const SOLANA_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || '';
const SOLANA_PROTOCOL_PDA = process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA || '';

const ENV_SCRIPT = `
  window.ENV = {
    API_URL: "${API_URL}",
    STORAGE_URL: "${STORAGE_URL}",
    FRONTEND_URL: "${FRONTEND_URL}",
    FACTORY_ADDRESS: "${FACTORY_ADDRESS}",
    CONVEX_URL: "${CONVEX_URL}",
    GATEWAY_URL: "${GATEWAY_URL}",
    SOLANA_NETWORK: "${SOLANA_NETWORK}",
    SOLANA_PROGRAM_ID: "${SOLANA_PROGRAM_ID}",
    SOLANA_ADMIN_WALLET: "${SOLANA_ADMIN_WALLET}",
    SOLANA_TREASURY_ADDRESS: "${SOLANA_TREASURY_ADDRESS}",
    SOLANA_PROTOCOL_PDA: "${SOLANA_PROTOCOL_PDA}",
    IS_DEV: ${process.env.NODE_ENV !== 'production'},
  };
`;

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: "Sasphy - Elevate Your Music Experience on Solana",
  description: "Discover, collect, and experience music with Sasphy - the next generation music platform built on Solana",
  keywords: ["music", "streaming", "solana", "web3", "nft", "blockchain", "artist", "creator"],
  authors: [{ name: "Sasphy", url: "https://sasphy.io" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Sasphy - Elevate Your Music Experience on Solana",
    description: "Discover, collect, and experience music with Sasphy - the next generation music platform built on Solana"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENV_SCRIPT }} />
      </head>
      <body className="antialiased">
        {/* Load environment variables before other components */}
        <EnvLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaWalletProvider>
            <ConvexClientProvider>
              <ConvexAuthProvider>
                <SasphyProvider>
                  <MusicPlayerProvider>
                    <div className="relative min-h-screen flex flex-col">
                      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
                        <MainNavigation />
                      </header>
                      <main className="flex-1 w-full px-4 sm:px-6 py-6">
                        {children}
                      </main>
                      <MusicPlayerBar />
                    <footer className="bg-card py-8 mt-auto border-t border-border">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Sasphy</h3>
                            <p className="text-sm text-muted-foreground">Next generation music platform built on Solana, empowering artists and listeners with direct ownership.</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Platform</h3>
                            <ul className="space-y-2 text-sm">
                              <li><a href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Discover</a></li>
                              <li><a href="/tracks" className="text-muted-foreground hover:text-foreground transition-colors">Tracks</a></li>
                              <li><a href="/artists" className="text-muted-foreground hover:text-foreground transition-colors">Artists</a></li>
                              <li><a href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">Leaderboard</a></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2 text-sm">
                              <li><a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
                              <li><a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
                              <li><a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                              <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Connect</h3>
                            <div className="flex space-x-4 text-lg">
                              <a href="https://twitter.com" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                              </a>
                              <a href="https://discord.com" aria-label="Discord" className="text-muted-foreground hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path></svg>
                              </a>
                              <a href="https://github.com" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
                          <p>© {new Date().getFullYear()} Sasphy. All rights reserved.</p>
                        </div>
                      </div>
                    </footer>
                    </div>
                  </MusicPlayerProvider>
                </SasphyProvider>
              </ConvexAuthProvider>
            </ConvexClientProvider>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
