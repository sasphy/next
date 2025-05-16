#!/usr/bin/env bun

/**
 * Verify Pinata JWT
 * 
 * This script helps you verify if your Pinata JWT is valid
 * Run with: bun scripts/verify-pinata-jwt.js
 */

import { PinataSDK } from 'pinata';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Simpler logging utility
const log = {
  info: (msg) => console.log(chalk.blue('ℹ️ INFO: ') + msg),
  success: (msg) => console.log(chalk.green('✅ SUCCESS: ') + msg),
  warn: (msg) => console.log(chalk.yellow('⚠️ WARNING: ') + msg),
  error: (msg) => console.log(chalk.red('❌ ERROR: ') + msg),
  highlight: (msg) => console.log(chalk.magenta('🔍 NOTE: ') + msg),
};

// Get directory name for the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables from .env and .env.local
dotenv.config({ path: path.join(rootDir, '.env') });
if (fs.existsSync(path.join(rootDir, '.env.local'))) {
  dotenv.config({ path: path.join(rootDir, '.env.local') });
}

async function main() {
  log.info('Verifying Pinata JWT...');
  
  // Check for JWT in environment variables - server-side only!
  const pinataJwt = process.env.PINATA_JWT;
  
  if (!pinataJwt) {
    log.error('No Pinata JWT found in environment variables');
    log.highlight('Please create a .env.local file with your PINATA_JWT');
    log.error('SECURITY NOTE: Never use NEXT_PUBLIC_ prefix for JWT tokens or API keys!');
    process.exit(1);
  }
  
  try {
    log.info('Testing authentication with Pinata...');
    // Make a direct API call to test authentication
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      log.error('Authentication failed');
      log.error(`Status: ${response.status} ${response.statusText}`);
      log.error(`Error details: ${errorData}`);
      log.highlight('The JWT token is either invalid or expired');
      return false;
    }
    
    const result = await response.json();
    log.success('JWT is valid!');
    log.highlight('You can now use the API endpoints for IPFS uploads');
    
    return true;
  } catch (error) {
    log.error('Error testing Pinata authentication:');
    console.error(error);
    return false;
  }
}

// Run the main function
main()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    log.error('Unhandled error');
    console.error(error);
    process.exit(1);
  }); 