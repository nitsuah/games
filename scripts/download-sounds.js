const https = require('https');
const fs = require('fs');
const path = require('path');

// Free sound effects (CC0 license)
const SOUND_URLS = {
  'thruster.mp3': 'https://freesound.org/data/previews/459/459145_6142149-lq.mp3',
  'shoot.mp3': 'https://opengameart.org/sites/default/files/laser1.mp3',
  'hit.mp3': 'https://opengameart.org/sites/default/files/Bottle%20Break.wav',
  'miss.mp3': 'https://opengameart.org/sites/default/files/attack_hit.mp3',
  'bgm.mp3': 'https://freesound.org/data/previews/560/560454_12295155-lq.mp3'
};

const soundsDir = path.join(__dirname, '../app/public/sounds');

// Create sounds directory if it doesn't exist
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Function to follow redirects and download file
const downloadFile = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if it was partially written
        reject(err);
      });
    });

    request.on('error', reject);
  });
};

// Download each sound
Object.entries(SOUND_URLS).forEach(([filename, url]) => {
  const filePath = path.join(soundsDir, filename);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.debug(`Skipping ${filename} - already exists`);
    return;
  }

  console.debug(`Downloading ${filename}...`);
  
  downloadFile(url, filePath)
    .then(() => console.debug(`Successfully downloaded ${filename}`))
    .catch(err => console.error(`Error downloading ${filename}:`, err.message));
}); 