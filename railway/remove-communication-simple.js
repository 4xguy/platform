#!/usr/bin/env node
// Simplified script to remove communication packages from rush.json
// Uses a more robust approach to handle JSONC (JSON with Comments)

const fs = require('fs');
const path = require('path');

// Simple JSONC parser that converts to valid JSON
function parseJSONC(content) {
  // Remove single-line comments (// ...)
  let cleaned = content.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments (/* ... */)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//gm, '');
  
  // Parse and stringify to ensure valid JSON
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    // If parsing fails, try a more aggressive approach
    // Remove all content between quotes that might contain special chars
    cleaned = cleaned
      .split('\n')
      .map(line => {
        // Skip lines that are now empty or only whitespace
        if (line.trim() === '') return '';
        return line;
      })
      .filter(line => line !== '')
      .join('\n');
    
    // Try parsing again
    return JSON.parse(cleaned);
  }
}

try {
  const rushJsonPath = fs.existsSync('./rush.json') 
    ? './rush.json' 
    : path.join(__dirname, '..', 'rush.json');
    
  console.log('Processing rush.json...');
  
  const content = fs.readFileSync(rushJsonPath, 'utf8');
  
  // Use a different approach - find the projects array directly
  const projectsMatch = content.match(/"projects":\s*\[([\s\S]*?)\]/);
  if (!projectsMatch) {
    throw new Error('Could not find projects array in rush.json');
  }
  
  // Parse just the projects array
  const projectsContent = '[' + projectsMatch[1] + ']';
  const projectsJson = projectsContent
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');
  
  // Parse the projects
  const projects = JSON.parse(projectsJson);
  
  // Filter out communication packages
  const filteredProjects = projects.filter(project => {
    const shouldKeep = !project.packageName.includes('communication');
    if (!shouldKeep) {
      console.log(`Removing: ${project.packageName}`);
    }
    return shouldKeep;
  });
  
  console.log(`Filtered ${projects.length - filteredProjects.length} communication packages`);
  
  // Read the full config again and parse it properly
  const fullConfig = parseJSONC(content);
  fullConfig.projects = filteredProjects;
  
  // Write back
  fs.writeFileSync(rushJsonPath, JSON.stringify(fullConfig, null, 2));
  console.log('Successfully updated rush.json');
  
} catch (error) {
  console.error('Error:', error.message);
  
  // Fallback: Just create a minimal rush.json with filtered projects
  console.log('Attempting fallback approach...');
  
  try {
    const rushJsonPath = fs.existsSync('./rush.json') 
      ? './rush.json' 
      : path.join(__dirname, '..', 'rush.json');
    
    // Read the original file
    const content = fs.readFileSync(rushJsonPath, 'utf8');
    
    // Extract key configuration values using regex
    const versionMatch = content.match(/"rushVersion":\s*"([^"]+)"/);
    const pnpmVersionMatch = content.match(/"pnpmVersion":\s*"([^"]+)"/);
    
    // Create a minimal valid rush.json
    const minimalConfig = {
      "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush.schema.json",
      "rushVersion": versionMatch ? versionMatch[1] : "5.151.0",
      "pnpmVersion": pnpmVersionMatch ? pnpmVersionMatch[1] : "9.15.3",
      "pnpmOptions": {
        "strictPeerDependencies": false
      },
      "projects": []
    };
    
    // Try to extract and parse projects more carefully
    const lines = content.split('\n');
    let inProjects = false;
    let projectBrackets = 0;
    let currentProject = '';
    
    for (const line of lines) {
      if (line.includes('"projects":')) {
        inProjects = true;
        continue;
      }
      
      if (inProjects) {
        currentProject += line + '\n';
        
        if (line.includes('{')) projectBrackets++;
        if (line.includes('}')) {
          projectBrackets--;
          
          if (projectBrackets === 0 && currentProject.trim()) {
            try {
              // Clean and parse the project entry
              const cleanProject = currentProject
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//gm, '')
                .replace(/,\s*$/, '');
                
              const projectObj = JSON.parse('{' + cleanProject + '}');
              
              if (!projectObj.packageName.includes('communication')) {
                minimalConfig.projects.push(projectObj);
              } else {
                console.log(`Skipping: ${projectObj.packageName}`);
              }
            } catch (e) {
              // Skip malformed project entries
            }
            
            currentProject = '';
          }
        }
        
        if (line.includes(']') && projectBrackets === 0) {
          inProjects = false;
        }
      }
    }
    
    // Write the minimal config
    fs.writeFileSync(rushJsonPath, JSON.stringify(minimalConfig, null, 2));
    console.log('Created minimal rush.json configuration');
    
  } catch (fallbackError) {
    console.error('Fallback also failed:', fallbackError.message);
    process.exit(1);
  }
}