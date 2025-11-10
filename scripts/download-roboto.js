/**
 * Simple script to download Roboto fonts from a working CDN
 * Run: node scripts/download-roboto.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Working CDN URLs for Roboto TTF fonts
const FONTS = [
  {
    name: 'Roboto-Regular',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-400-normal.woff2'
  },
  {
    name: 'Roboto-Bold',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff2'
  }
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'fonts');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadFont(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, handleResponse).on('error', reject);
      } else if (response.statusCode === 200) {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log(`✓ Downloaded ${buffer.length} bytes`);
          resolve(buffer);
        });
        response.on('error', reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
    
    function handleResponse(res) {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, handleResponse).on('error', reject);
      } else if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log(`✓ Downloaded ${buffer.length} bytes`);
          resolve(buffer);
        });
        res.on('error', reject);
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }
  });
}

async function main() {
  console.log('Downloading Roboto fonts...\n');
  
  for (const font of FONTS) {
    try {
      const buffer = await downloadFont(font.url, font.name);
      const outputPath = path.join(OUTPUT_DIR, `${font.name}.woff2`);
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Saved to ${outputPath}\n`);
    } catch (error) {
      console.error(`✗ Failed to download ${font.name}:`, error.message, '\n');
    }
  }
  
  console.log('Done!');
}

main().catch(console.error);

