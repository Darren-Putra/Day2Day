const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') return;
    }
  });
  return filelist;
};

const tsxFiles = walkSync(path.join(__dirname, '../src')).filter(f => f.endsWith('.tsx'));

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match pairs like `bg-white dark:bg-black` or `text-zinc-900 dark:text-zinc-100`
  // We'll replace them with just the dark mode class.
  
  // 1. Common pairs
  content = content.replace(/bg-white dark:bg-black/g, 'bg-black');
  content = content.replace(/bg-zinc-50 dark:bg-black/g, 'bg-black');
  content = content.replace(/text-zinc-900 dark:text-zinc-100/g, 'text-zinc-100');
  content = content.replace(/text-zinc-900 dark:text-white/g, 'text-white');
  content = content.replace(/text-zinc-800 dark:text-zinc-200/g, 'text-zinc-200');
  content = content.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-zinc-400');
  content = content.replace(/border-zinc-200 dark:border-zinc-800\/50/g, 'border-zinc-800/50');
  content = content.replace(/border-zinc-200 dark:border-zinc-800/g, 'border-zinc-800');
  content = content.replace(/bg-white\/80 dark:bg-black\/20/g, 'bg-zinc-900/30');
  content = content.replace(/bg-zinc-100\/80 dark:bg-zinc-900\/30/g, 'bg-zinc-900/40');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/30/g, 'bg-zinc-900/40');
  
  // Hover states
  content = content.replace(/hover:bg-zinc-100\/60 hover:dark:bg-zinc-800\/50/g, 'hover:bg-zinc-900/50');
  content = content.replace(/hover:text-zinc-900 dark:hover:text-white/g, 'hover:text-white');
  content = content.replace(/hover:bg-white\/70 hover:dark:bg-zinc-900\/30/g, 'hover:bg-zinc-900/50 hover:border-[#1E3A8A]/60');
  content = content.replace(/hover:text-zinc-900 hover:dark:text-white/g, 'hover:text-white');
  
  // Redundant dark: prefixes where light and dark were the same or explicitly specified
  content = content.replace(/dark:text-\[\#3B82F6\]/g, 'text-[#3B82F6]');
  content = content.replace(/text-\[\#3B82F6\] text-\[\#3B82F6\]/g, 'text-[#3B82F6]');
  content = content.replace(/dark:bg-\[\#1E3A8A\]\/25/g, 'bg-[#1E3A8A]/25');
  content = content.replace(/dark:border-\[\#1E3A8A\]\/60/g, 'border-[#1E3A8A]/60');
  
  // Clean up any remaining dark: classes by stripping the prefix (and ideally removing the preceding light class if it's there)
  // This is tricky, so we'll do a simple replace of just the prefix for any remaining ones.
  content = content.replace(/dark:([a-zA-Z0-9/\[\]#.-]+)/g, '$1');

  // Enforce shapes
  content = content.replace(/rounded-md/g, 'rounded-xl');
  content = content.replace(/rounded-lg/g, 'rounded-xl');
  
  // Typography for numbers (can't easily regex this, will do manually where needed)

  // Transition and click states
  content = content.replace(/active:scale-95/g, ''); // prevent duplicates
  content = content.replace(/hover:bg-blue-600/g, 'hover:bg-[#1E40AF] active:scale-95 transition-all duration-300');
  content = content.replace(/bg-blue-600/g, 'bg-[#1E3A8A]');
  content = content.replace(/text-blue-600/g, 'text-[#3B82F6]');
  
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Applied base theme replacements.');
