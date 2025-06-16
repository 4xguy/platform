#!/usr/bin/env node
// Script to remove communication-related packages from rush.json
// This handles JSON files with comments

const fs = require('fs');
const path = require('path');

function removeComments(content) {
  // Remove /* */ comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove // comments
  content = content.replace(/\/\/.*$/gm, '');
  return content;
}

try {
  // When running in Docker, the script is in /app/railway/ and rush.json is in /app/
  const rushJsonPath = fs.existsSync('./rush.json') 
    ? './rush.json' 
    : path.join(__dirname, '..', 'rush.json');
  console.log('Reading rush.json from:', rushJsonPath);
  
  const content = fs.readFileSync(rushJsonPath, 'utf8');
  const jsonWithoutComments = removeComments(content);
  
  let rushConfig;
  try {
    rushConfig = JSON.parse(jsonWithoutComments);
  } catch (parseError) {
    console.error('Failed to parse rush.json after removing comments');
    console.error('Parse error:', parseError.message);
    // Log first few lines of processed content for debugging
    console.error('First 200 chars of processed content:', jsonWithoutComments.substring(0, 200));
    throw parseError;
  }
  
  const originalCount = rushConfig.projects.length;
  rushConfig.projects = rushConfig.projects.filter(project => {
    const shouldKeep = !project.packageName.includes('communication');
    if (!shouldKeep) {
      console.log(`Removing: ${project.packageName}`);
    }
    return shouldKeep;
  });
  
  const removedCount = originalCount - rushConfig.projects.length;
  console.log(`Removed ${removedCount} communication-related packages`);
  
  // Write back without comments (Railway doesn't need them)
  fs.writeFileSync(rushJsonPath, JSON.stringify(rushConfig, null, 2));
  console.log('Successfully updated rush.json');
  
} catch (error) {
  console.error('Error processing rush.json:', error.message);
  process.exit(1);
}