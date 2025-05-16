#!/usr/bin/env node

/**
 * This script tests uploading a file to Pinata using your API credentials.
 * Run with: node scripts/test-pinata-upload.js path/to/file.jpg
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = global.fetch || require('node-fetch');

const chalk = require('chalk') || { green: (s) => `✅ ${s}`, red: (s) => `❌ ${s}`, yellow: (s) => `⚠️  ${s}`, blue: (s) => `ℹ️  ${s}` };

const log = {
  success: (msg) => console.log(chalk.green(msg)),
  error: (msg) => console.log(chalk.red(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  info: (msg) => console.log(chalk.blue(msg))
};

async function uploadToPinata(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      log.error(`File not found: ${filePath}`);
      return;
    }
    
    // Check if we have Pinata credentials
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataApiSecret = process.env.PINATA_API_SECRET;
    
    if (!pinataApiKey || !pinataApiSecret) {
      log.error('Missing Pinata API credentials in .env.local file');
      log.info('Please set PINATA_API_KEY and PINATA_API_SECRET in .env.local');
      return;
    }
    
    // Read the file
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    
    log.info(`Uploading file: ${fileName} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', fileData, { filename: fileName });
    
    // Set metadata with file name
    formData.append('pinataMetadata', JSON.stringify({
      name: fileName
    }));
    
    // Upload to Pinata
    log.info('Sending request to Pinata API...');
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataApiSecret,
        ...formData.getHeaders?.()
      },
      body: formData
    });
    
    // Process response
    if (response.ok) {
      const data = await response.json();
      log.success('Upload successful!');
      log.info(`IPFS Hash (CID): ${data.IpfsHash}`);
      log.info(`Size: ${data.PinSize} bytes`);
      log.info(`Gateway URL: https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
      
      // Show custom gateway URL if set
      if (process.env.NEXT_PUBLIC_GATEWAY_URL) {
        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL.replace(/\/+$/, '');
        log.info(`Custom Gateway URL: ${gatewayUrl}/${data.IpfsHash}`);
      }
    } else {
      const errorText = await response.text();
      log.error(`Upload failed with status ${response.status}: ${response.statusText}`);
      log.error(`Error details: ${errorText}`);
    }
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    if (error.stack) console.error(error.stack);
  }
}

// Get file path from command line args
const filePath = process.argv[2];

if (!filePath) {
  log.error('No file path provided!');
  log.info('Usage: node scripts/test-pinata-upload.js path/to/file.jpg');
  log.info('Example: node scripts/test-pinata-upload.js public/testing/Onchain.jpg');
} else {
  uploadToPinata(filePath)
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
} 