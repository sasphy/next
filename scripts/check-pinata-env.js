#!/usr/bin/env bun
/**
 * Check Pinata Environment Variables
 * 
 * This script checks if the required Pinata environment variables are set
 * and provides guidance on how to set them if they're missing.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get directory name for the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables from .env and .env.local
dotenv.config({ path: path.join(rootDir, '.env') });
if (fs.existsSync(path.join(rootDir, '.env.local'))) {
  dotenv.config({ path: path.join(rootDir, '.env.local') });
}

// Define the environment variables we want to check
const requiredEnvVars = [
  'PINATA_JWT',
  'NEXT_PUBLIC_GATEWAY_URL',
];

// Optional environment variables
const optionalEnvVars = [];

// Flag to track if any required variables are missing
let requiredMissing = false;

console.log(chalk.blue('🔍 Checking Pinata environment variables...'));

// Check for required environment variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(chalk.red(`❌ Missing required environment variable: ${varName}`));
    requiredMissing = true;
  } else {
    const value = process.env[varName];
    const displayValue = varName.includes('JWT') || varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : value;
    
    console.log(chalk.green(`✅ Found: ${varName} = ${displayValue}`));
  }
});

// Check for optional environment variables
optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(chalk.yellow(`⚠️ Optional environment variable not set: ${varName}`));
  } else {
    const value = process.env[varName];
    const displayValue = varName.includes('JWT') || varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : value;
    
    console.log(chalk.blue(`ℹ️ Optional: ${varName} = ${displayValue}`));
  }
});

// Test Pinata JWT if it exists
if (process.env.PINATA_JWT) {
  console.log(chalk.blue('\n🧪 Testing Pinata JWT...'));
  
  const pinataJwt = process.env.PINATA_JWT;
  
  // Simple JWT structure validation
  const jwtParts = pinataJwt.split('.');
  if (jwtParts.length !== 3) {
    console.log(chalk.red('❌ JWT appears malformed (should have 3 parts separated by dots)'));
  } else {
    console.log(chalk.green('✅ JWT has valid structure'));
    console.log(chalk.yellow('⚠️ Note: This is just a format check, not a cryptographic verification'));
    console.log(chalk.blue('ℹ️ To verify the JWT is working, run API tests'));
  }
} else {
  console.log(chalk.yellow('\n⚠️ No JWT found to test'));
}

// If required variables are missing, show setup instructions
if (requiredMissing) {
  console.log(chalk.yellow('\n📝 Setup Instructions:'));
  console.log(chalk.white('1. Create a .env.local file in the project root directory'));
  console.log(chalk.white('2. Add the following lines to the file:'));
  console.log(chalk.green(`
PINATA_JWT=your-pinata-jwt
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud
`));
  console.log(chalk.white('3. Restart your development server'));
  
  console.log(chalk.yellow('\n🔑 How to get a Pinata JWT:'));
  console.log(chalk.white('1. Create an account at https://app.pinata.cloud/'));
  console.log(chalk.white('2. Go to the API Keys section'));
  console.log(chalk.white('3. Generate a new API key'));
  console.log(chalk.white('4. Copy the JWT token (not the API key/secret)'));
  
  console.log(chalk.red('\n⚠️ SECURITY WARNING:'));
  console.log(chalk.white('Never use NEXT_PUBLIC_ prefix for JWT tokens or API keys!'));
  console.log(chalk.white('- NEXT_PUBLIC_ variables are exposed to the browser'));
  console.log(chalk.white('- JWT tokens should be kept secure on the server side'));
  console.log(chalk.white('- Only use the PINATA_JWT variable name for your token'));
  
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All required Pinata environment variables are set!'));
  process.exit(0);
} 