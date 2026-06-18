const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'docs', 'learningpathways');
const CANONICAL_ID = 'c8c64c61-0136-4e47-be9d-263976ce6de5';
const ACTIVE_STATUS = 'dda75593-7969-4d64-bff1-1c21bb2d8c8b';
const DEPRECATED_STATUS = '4eb25076-b5d0-41cb-afa6-4e0c5a1c9664';
const TITLE = 'Join a meeting in Microsoft Teams';

const PLAYLIST_FILES = [
  'v4/en-us/playlists.json',
  'v4/de-de/playlists.json',
  'v4/es-es/playlists.json',
  'v4/fr-fr/playlists.json',
  'v4/it-it/playlists.json',
  'v4/ja-jp/playlists.json',
  'v4/nl-nl/playlists.json',
  'v4/pt-br/playlists.json',
  'v4/ru-ru/playlists.json',
  'v4/zh-cn/playlists.json',
];

// Step 1: Update assets.json
const assetsPath = path.join(BASE, 'v4', 'en-us', 'assets.json');
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));

const deprecatedIds = new Set();
let assetChanges = 0;

for (const asset of assets) {
  if (asset.Title === TITLE) {
    if (asset.Id === CANONICAL_ID) {
      if (asset.StatusTagId !== ACTIVE_STATUS) {
        asset.StatusTagId = ACTIVE_STATUS;
        assetChanges++;
        console.log(`  SET ACTIVE: ${asset.Id}`);
      }
    } else {
      deprecatedIds.add(asset.Id);
      if (asset.StatusTagId !== DEPRECATED_STATUS) {
        asset.StatusTagId = DEPRECATED_STATUS;
        assetChanges++;
        console.log(`  SET DEPRECATED: ${asset.Id}`);
      }
    }
  }
}

fs.writeFileSync(assetsPath, JSON.stringify(assets, null, 2) + '\n', 'utf8');
console.log(`\nassets.json: ${assetChanges} StatusTagId changes`);
console.log(`Deprecated IDs (${deprecatedIds.size}): playlist references to these will be replaced`);

// Step 2: Update playlists.json files
let totalPlaylistChanges = 0;

for (const relPath of PLAYLIST_FILES) {
  const filePath = path.join(BASE, relPath);
  const playlists = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileChanges = 0;

  for (const playlist of playlists) {
    if (!Array.isArray(playlist.Assets)) continue;

    const before = playlist.Assets.length;
    // Replace deprecated IDs with canonical, then deduplicate
    const seen = new Set();
    playlist.Assets = playlist.Assets
      .map(id => (deprecatedIds.has(id) ? CANONICAL_ID : id))
      .filter(id => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

    const after = playlist.Assets.length;
    if (before !== after || playlist.Assets.some((id, i) => id !== /* original */ id)) {
      fileChanges++;
    }
  }

  // Count actual replacements by re-diffing
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = JSON.stringify(playlists, null, 2) + '\n';
  if (original !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    // Count how many deprecated IDs were replaced
    let replacements = 0;
    for (const id of deprecatedIds) {
      const re = new RegExp(id, 'g');
      replacements += (original.match(re) || []).length;
    }
    totalPlaylistChanges += replacements;
    console.log(`\n${relPath}: ${replacements} replacement(s)`);
  } else {
    console.log(`\n${relPath}: no changes`);
  }
}

console.log(`\nTotal playlist replacements: ${totalPlaylistChanges}`);
console.log('Done.');
