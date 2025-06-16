#!/usr/bin/env node
// Patch package.json files to remove dependencies on communication submodule packages

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Packages to remove from dependencies
const PACKAGES_TO_REMOVE = [
  '@hcengineering/communication-types',
  '@hcengineering/communication-sdk-types',
  '@hcengineering/communication-shared',
  '@hcengineering/communication-yaml',
  '@hcengineering/communication-rest-client',
  '@hcengineering/communication-cockroach',
  '@hcengineering/communication-server',
  '@hcengineering/communication-query',
  '@hcengineering/communication-client-query'
];

// Find all package.json files
function findPackageJsonFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === 'common') continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findPackageJsonFiles(fullPath));
      } else if (item === 'package.json' && !fullPath.includes('communication/')) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  
  return files;
}

console.log('Patching package.json files to remove communication submodule dependencies...');

const packageFiles = findPackageJsonFiles('.');
let patchedCount = 0;

for (const file of packageFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const pkg = JSON.parse(content);
    let modified = false;
    
    // Check dependencies
    if (pkg.dependencies) {
      for (const dep of PACKAGES_TO_REMOVE) {
        if (pkg.dependencies[dep]) {
          console.log(`Removing ${dep} from ${file}`);
          delete pkg.dependencies[dep];
          modified = true;
        }
      }
    }
    
    // Check devDependencies
    if (pkg.devDependencies) {
      for (const dep of PACKAGES_TO_REMOVE) {
        if (pkg.devDependencies[dep]) {
          console.log(`Removing ${dep} from ${file} (dev)`);
          delete pkg.devDependencies[dep];
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
      patchedCount++;
    }
  } catch (e) {
    // Skip files we can't parse
  }
}

console.log(`Patched ${patchedCount} package.json files`);

// Also create stub types file to prevent TypeScript errors
const stubTypesContent = `// Stub types for communication packages
export interface CommunicationSDKTypes {}
export interface CommunicationTypes {}
`;

// Create stub directories
const stubDirs = [
  'communication/packages/sdk-types',
  'communication/packages/types'
];

for (const dir of stubDirs) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.ts'), stubTypesContent);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: `@hcengineering/${path.basename(dir)}`,
    version: "0.0.0",
    main: "index.ts",
    types: "index.ts"
  }, null, 2));
}

console.log('Created stub type definitions');