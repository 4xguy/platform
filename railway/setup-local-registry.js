#!/usr/bin/env node
// Setup local package linking for Rush without external registry

const fs = require('fs');
const path = require('path');

console.log('Setting up local-only Rush configuration...');

// Remove all .npmrc files that point to external registries
const npmrcFiles = [
  '.npmrc',
  'common/config/rush/.npmrc',
  'communication/.npmrc',
  'communication/common/config/rush/.npmrc'
];

for (const file of npmrcFiles) {
  if (fs.existsSync(file)) {
    console.log(`Removing ${file}`);
    fs.unlinkSync(file);
  }
}

// Create a new .npmrc that prevents external registry access
const localNpmrc = `# Local-only configuration for Railway deployment
# Don't fetch from any external registry
offline=true
prefer-offline=true
`;

fs.writeFileSync('.npmrc', localNpmrc);
fs.writeFileSync('common/config/rush/.npmrc', localNpmrc);

// Update rush.json to use pnpm workspaces mode
const rushJsonPath = 'rush.json';
const rushConfig = JSON.parse(fs.readFileSync(rushJsonPath, 'utf8'));

// Enable pnpm workspaces
if (rushConfig.pnpmOptions) {
  rushConfig.pnpmOptions.useWorkspaces = true;
  console.log('Enabled pnpm workspaces in rush.json');
}

fs.writeFileSync(rushJsonPath, JSON.stringify(rushConfig, null, 2));

console.log('Local-only setup complete');