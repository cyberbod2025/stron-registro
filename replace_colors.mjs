import fs from 'fs';
import path from 'path';

const dir = './src';
const colorMap = {
  '#ff4994': '#00a2ff', // Electric cyan/blue
  '#c91f6b': '#0077ff', // Bright blue
  '#ba0061': '#0055cc', // Dark blue
  '#2a1520': '#0a1020', // Dark navy background
  '#2b1633': '#0d1326', // Dark blue-grey
  '#1a0c1f': '#070a14', // Very dark navy
  '#240a1b': '#0a0d1a', // Almost black blue
  '#582ea2': '#00e5ff'  // Light cyan
};

function processDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
      }
      
      if (fullPath.endsWith('App.tsx')) {
        if (content.includes('strong_nation_bg.png')) {
          content = content.replace('strong_nation_bg.png', 'app_background.png');
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(dir);
