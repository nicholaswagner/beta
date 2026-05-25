import { fromVault } from 'fumadocs-obsidian';

await fromVault({
  dir: 'vault',
  out: {
    contentDir: 'content',
    publicDir: 'public',
  },
});

console.log('Generated MDX from vault.');
