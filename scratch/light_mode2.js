const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('src');

const classMap = {
  'bg-black': 'bg-white',
  'bg-black/20': 'bg-white/20',
  'bg-black/50': 'bg-white/50',
  'bg-black/70': 'bg-white/70',
  'bg-black/80': 'bg-white/80',
  'bg-zinc-950': 'bg-zinc-50',
  'bg-zinc-950/80': 'bg-zinc-50/80',
  'bg-zinc-900/30': 'bg-white/70',
  'bg-zinc-900/50': 'bg-zinc-100/80',
  'bg-zinc-900/80': 'bg-zinc-100/90',
  'bg-zinc-900': 'bg-zinc-100',
  'bg-zinc-800/50': 'bg-zinc-200/50',
  'bg-zinc-800': 'bg-zinc-200',
  'text-white': 'text-zinc-900',
  'text-zinc-100': 'text-zinc-800',
  'text-zinc-200': 'text-zinc-800',
  'text-zinc-300': 'text-zinc-700',
  'text-zinc-400': 'text-zinc-600',
  'border-zinc-800/50': 'border-zinc-200',
  'border-zinc-800': 'border-zinc-300',
  'border-zinc-700/50': 'border-zinc-300',
  'border-zinc-700': 'border-zinc-300',
};

function processClasses(match) {
  const inner = match.slice(1, -1);
  if (!inner) return match;
  
  const tokens = inner.split(/[\s\n]+/);
  let newTokens = [];
  
  for (let token of tokens) {
    if (!token) continue;
    
    // Ignore already dark: mapped classes to prevent double mapping
    if (token.includes('dark:')) {
      newTokens.push(token);
      continue;
    }
    
    // Extract modifiers
    const parts = token.split(':');
    const utility = parts.pop();
    const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
    
    if (classMap[utility]) {
      const lightClass = classMap[utility];
      const darkClass = utility;
      newTokens.push(modifiers + lightClass);
      newTokens.push('dark:' + modifiers + darkClass);
    } else {
      newTokens.push(token);
    }
  }
  
  const separator = match.includes('\n') ? '\n' : ' ';
  return '"' + newTokens.join(separator) + '"';
}

function processTemplateLiteral(match) {
    const inner = match.slice(1, -1);
    if (!inner) return match;
    
    const tokens = inner.split(/[\s\n]+/);
    let newTokens = [];
    
    for (let token of tokens) {
      if (!token) continue;
      
      // Skip template literal expressions
      if (token.includes('${')) {
        newTokens.push(token);
        continue;
      }
      
      if (token.includes('dark:')) {
        newTokens.push(token);
        continue;
      }
      
      const parts = token.split(':');
      const utility = parts.pop();
      const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
      
      if (classMap[utility]) {
        const lightClass = classMap[utility];
        const darkClass = utility;
        newTokens.push(modifiers + lightClass);
        newTokens.push('dark:' + modifiers + darkClass);
      } else {
        newTokens.push(token);
      }
    }
    
    return '`' + newTokens.join(' ') + '`';
}

let changedFiles = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Basic heuristic to replace strings
  newContent = newContent.replace(/"([^"]*?)"/g, (match) => {
    return processClasses(match);
  });
  
  newContent = newContent.replace(/`([^`]*?)`/g, (match) => {
    return processTemplateLiteral(match);
  });
  
  // also fix single quotes for classNames
  newContent = newContent.replace(/'([^']*?)'/g, (match) => {
     // only if it looks like a class string
     if (match.includes('bg-') || match.includes('text-')) {
       const inner = match.slice(1, -1);
       if (!inner) return match;
       
       const tokens = inner.split(/[\s\n]+/);
       let newTokens = [];
       
       for (let token of tokens) {
         if (!token) continue;
         if (token.includes('dark:')) {
           newTokens.push(token);
           continue;
         }
         const parts = token.split(':');
         const utility = parts.pop();
         const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
         
         if (classMap[utility]) {
           const lightClass = classMap[utility];
           const darkClass = utility;
           newTokens.push(modifiers + lightClass);
           newTokens.push('dark:' + modifiers + darkClass);
         } else {
           newTokens.push(token);
         }
       }
       return "'" + newTokens.join(' ') + "'";
     }
     return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changedFiles++;
    console.log('Updated', file);
  }
}
console.log('Total files changed:', changedFiles);
