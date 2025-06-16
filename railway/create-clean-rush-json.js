#!/usr/bin/env node
// Creates a clean rush.json without comments for Railway deployment

const fs = require('fs');

// Read the original rush.json
const content = fs.readFileSync('rush.json', 'utf8');

// Extract key values using regex (more reliable than parsing JSONC)
const rushVersion = content.match(/"rushVersion":\s*"([^"]+)"/)?.[1] || "5.151.0";
const pnpmVersion = content.match(/"pnpmVersion":\s*"([^"]+)"/)?.[1] || "9.15.3";

// Extract projects array
const projectsStartIndex = content.indexOf('"projects": [');
if (projectsStartIndex === -1) {
  throw new Error('Could not find projects array');
}

// Find the matching closing bracket for the projects array
let bracketCount = 0;
let inString = false;
let escaped = false;
let projectsEndIndex = -1;

for (let i = projectsStartIndex + '"projects": ['.length; i < content.length; i++) {
  const char = content[i];
  
  if (!escaped && char === '"') {
    inString = !inString;
  } else if (!inString) {
    if (char === '[') bracketCount++;
    else if (char === ']') {
      if (bracketCount === 0) {
        projectsEndIndex = i;
        break;
      }
      bracketCount--;
    }
  }
  
  escaped = !escaped && char === '\\';
}

if (projectsEndIndex === -1) {
  throw new Error('Could not find end of projects array');
}

// Extract the projects array content
const projectsContent = content.substring(projectsStartIndex + '"projects": ['.length, projectsEndIndex);

// Parse individual projects
const projects = [];
const projectBlocks = projectsContent.split(/\},\s*\{/);

for (let block of projectBlocks) {
  block = block.trim();
  if (!block) continue;
  
  // Clean up the block
  if (!block.startsWith('{')) block = '{' + block;
  if (!block.endsWith('}')) block = block + '}';
  
  // Remove comments
  block = block
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .trim();
  
  try {
    const project = JSON.parse(block);
    
    // Only exclude packages that are in the communication submodule directory
    if (!project.projectFolder.startsWith('communication/')) {
      projects.push(project);
    } else {
      console.log(`Excluding from submodule: ${project.packageName}`);
    }
  } catch (e) {
    // Skip malformed entries
    console.warn('Skipping malformed project entry');
  }
}

console.log(`Found ${projects.length} non-communication projects`);

// Create clean rush.json
const cleanRushJson = {
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
  "rushVersion": rushVersion,
  "pnpmVersion": pnpmVersion,
  "pnpmOptions": {
    "strictPeerDependencies": false
  },
  "nodeSupportedVersionRange": ">=20.0.0 <23.0.0",
  "projectFolderMaxDepth": 3,
  "gitPolicy": {},
  "repository": {
    "url": "https://github.com/hcengineering/platform",
    "defaultBranch": "main",
    "defaultRemote": "origin"
  },
  "eventHooks": {
    "preRushInstall": [],
    "postRushInstall": [],
    "preRushBuild": [],
    "postRushBuild": []
  },
  "projects": projects
};

// Write the clean file to a separate location
const outputPath = 'railway/rush-clean.json';
fs.writeFileSync(outputPath, JSON.stringify(cleanRushJson, null, 2));
console.log(`Created clean rush.json at ${outputPath} for Railway deployment`);