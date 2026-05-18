const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const repoJson = path.join(__dirname, '../repo.json');
const token = process.env.GH_TOKEN;
const headers = {
  Authorization: `token ${token}`,
  'User-Agent': 'DalamudRepoUpdater'
};

function getZipPath(url) {
  const match = url.match(/plugins\/(.+\.zip)/);
  return match ? `plugins/${match[1]}` : null;
}

async function getDownloadCount(path) {
  try {
    const u = `https://api.github.com/repos/zhouhuichen741/dalamud-plugins/contents/${path}`;
    const res = await fetch(u, { headers });
    const data = await res.json();
    return data.download_count || 0;
  } catch {
    return 0;
  }
}

async function run() {
  const plugins = JSON.parse(fs.readFileSync(repoJson, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  for (const p of plugins) {
    const path = getZipPath(p.DownloadLinkInstall);
    if (!path) continue;

    const count = await getDownloadCount(path);
    p.DownloadCount = count;
    p.LastUpdate = now;
    console.log(`${p.Name}: ${count}`);
  }

  fs.writeFileSync(repoJson, JSON.stringify(plugins, null, 2), 'utf8');
}

run();
