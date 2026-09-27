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
  // Restore Dark Navy + Light mode mappings
  'bg-gray-950': 'bg-white dark:bg-black',
  'bg-gray-950/80': 'bg-white/80 dark:bg-black/20',
  'bg-gray-900/60': 'bg-white/70 dark:bg-zinc-900/30',
  'bg-gray-900/40': 'bg-white/50 dark:bg-zinc-900/20',
  'bg-gray-900/50': 'bg-zinc-100/80 dark:bg-zinc-900/30',
  'bg-gray-900': 'bg-zinc-100 dark:bg-zinc-900',
  'bg-gray-800/80': 'bg-white/80 dark:bg-zinc-800/50',
  'bg-gray-800/60': 'bg-zinc-100/60 dark:bg-zinc-800/50',
  'bg-gray-800/50': 'bg-zinc-200/50 dark:bg-zinc-800/50',
  'bg-gray-800': 'bg-zinc-200 dark:bg-zinc-800',
  
  'border-gray-800/80': 'border-zinc-200 dark:border-zinc-800/50',
  'border-gray-800/50': 'border-zinc-200 dark:border-zinc-800/50',
  'border-gray-800': 'border-zinc-300 dark:border-zinc-800/50',
  'border-gray-700': 'border-zinc-300 dark:border-zinc-800/50',
  
  'text-gray-100': 'text-zinc-900 dark:text-zinc-100',
  'text-gray-200': 'text-zinc-800 dark:text-zinc-200',
  'text-gray-300': 'text-zinc-700 dark:text-zinc-300',
  'text-gray-400': 'text-zinc-500 dark:text-zinc-500',
  'text-gray-500': 'text-zinc-400 dark:text-zinc-600',
  
  // Accents to Navy (#1E3A8A) and Blue (#3B82F6)
  'bg-indigo-500': 'bg-[#1E3A8A] dark:bg-[#1E3A8A]',
  'bg-indigo-600': 'bg-[#1D4ED8] dark:bg-[#1D4ED8]',
  'bg-indigo-500/10': 'bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/25',
  'bg-indigo-500/20': 'bg-[#1E3A8A]/20 dark:bg-[#1E3A8A]/40',
  'text-indigo-400': 'text-[#3B82F6] dark:text-[#3B82F6]',
  'text-indigo-500': 'text-[#3B82F6] dark:text-[#3B82F6]',
  'text-cyan-400': 'text-[#3B82F6] dark:text-[#3B82F6]',
  'border-indigo-500/20': 'border-[#1E3A8A]/30 dark:border-[#1E3A8A]/60',
  'border-indigo-500/40': 'border-[#1E3A8A]/40 dark:border-[#1E3A8A]/60',
  'border-indigo-500': 'border-[#1E3A8A] dark:border-[#1E3A8A]',
  'ring-indigo-500': 'ring-[#3B82F6] dark:ring-[#3B82F6]',
  
  'from-indigo-600': 'from-[#1E3A8A]',
  'to-cyan-500': 'to-[#1D4ED8]',
  
  'shadow-indigo-500/20': 'shadow-blue-900/20',

  // Shapes
  'rounded-lg': 'rounded-2xl',
  'rounded-xl': 'rounded-3xl',
  'rounded-md': 'rounded-full', // buttons
};

function processClasses(match) {
  const inner = match.slice(1, -1);
  if (!inner) return match;
  
  const tokens = inner.split(/[\s\n]+/);
  let newTokens = [];
  
  for (let token of tokens) {
    if (!token) continue;
    
    // Ignore already mapped classes
    if (token.includes('dark:') || token.includes('#1E3A8A') || token.includes('#3B82F6')) {
      newTokens.push(token);
      continue;
    }
    
    const parts = token.split(':');
    const utility = parts.pop();
    const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
    
    if (classMap[utility]) {
      const mapped = classMap[utility];
      if (mapped.includes(' ')) {
        const [lightClass, darkClass] = mapped.split(' ');
        newTokens.push(modifiers + lightClass);
        // keep modifiers for dark class
        const darkParts = darkClass.split(':');
        const darkUtil = darkParts.pop();
        const darkMod = darkParts.join(':') + (darkParts.length > 0 ? ':' : '');
        newTokens.push(modifiers + darkMod + darkUtil);
      } else {
        newTokens.push(modifiers + mapped);
      }
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
      
      if (token.includes('${') || token.includes('dark:') || token.includes('#1E3A8A')) {
        newTokens.push(token);
        continue;
      }
      
      const parts = token.split(':');
      const utility = parts.pop();
      const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
      
      if (classMap[utility]) {
        const mapped = classMap[utility];
        if (mapped.includes(' ')) {
          const [lightClass, darkClass] = mapped.split(' ');
          newTokens.push(modifiers + lightClass);
          newTokens.push(modifiers + darkClass); // darkClass already has dark:
        } else {
          newTokens.push(modifiers + mapped);
        }
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
  
  newContent = newContent.replace(/"([^"]*?)"/g, (match) => {
    return processClasses(match);
  });
  
  newContent = newContent.replace(/`([^`]*?)`/g, (match) => {
    return processTemplateLiteral(match);
  });
  
  newContent = newContent.replace(/'([^']*?)'/g, (match) => {
     if (match.includes('bg-') || match.includes('text-')) {
       const inner = match.slice(1, -1);
       if (!inner) return match;
       
       const tokens = inner.split(/[\s\n]+/);
       let newTokens = [];
       
       for (let token of tokens) {
         if (!token) continue;
         if (token.includes('dark:') || token.includes('#1E3A8A')) {
           newTokens.push(token);
           continue;
         }
         const parts = token.split(':');
         const utility = parts.pop();
         const modifiers = parts.join(':') + (parts.length > 0 ? ':' : '');
         
         if (classMap[utility]) {
           const mapped = classMap[utility];
           if (mapped.includes(' ')) {
             const [lightClass, darkClass] = mapped.split(' ');
             newTokens.push(modifiers + lightClass);
             newTokens.push(modifiers + darkClass);
           } else {
             newTokens.push(modifiers + mapped);
           }
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
