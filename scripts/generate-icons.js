/*
  Simple icon generator: writes two PNG files to app/public/ from embedded base64.
  Run this in WSL or a Node environment where you have write access:

  node ./scripts/generate-icons.js

  The base64 data here are tiny placeholders (single color PNGs). Replace them
  with better images if you have artwork.
*/
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'app', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const icons = [
  {
    name: 'icon-192.png',
    // 192x192 white PNG (placeholder)
    data: 'iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAAAAAB7B2oAAAACXBIWXMAAAsTAAALEwEAmpwYAAABt0lEQVR4nO3XwW3DMBiG4b8q7QnJz1J0aYxQk+1yq4s9MIE6Q6oSxO1bM3oD6b0f7RK0uXyS9w8A+F1f1z8wQAAAAAAAAAAAAAAAAAA8D3gF1vZ8Gk7sVx/8aQ7yq+7y6Y8fYt6QbYl4+o6/1e6nWf0y1mV1v+q6m+2WwOq2h3r1bq3t+q9r9r1r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v9r0b6v+g4p2uYqQAAAAASUVORK5CYII='
  },
  {
    name: 'icon-512.png',
    // 512x512 white PNG (placeholder)
    data: 'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAA3NCSVQICAjb4U/gAAABGklEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8H4gAAG1wqz8AAAAASUVORK5CYII='
  }
];

icons.forEach(icon => {
  const outPath = path.join(outDir, icon.name);
  const buffer = Buffer.from(icon.data, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote', outPath);
});

console.log('Icon generation complete. Replace placeholders with proper artwork as needed.');
