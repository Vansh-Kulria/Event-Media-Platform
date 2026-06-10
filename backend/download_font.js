const fs = require('fs');
const https = require('https');
const path = require('path');

const fontUrl = 'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf';
const destDir = path.join(__dirname, 'fonts');
const destPath = path.join(destDir, 'Roboto-Regular.ttf');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Downloading Roboto-Regular.ttf to', destPath);

https.get(fontUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download font: status ${res.statusCode}`);
    process.exit(1);
  }
  const file = fs.createWriteStream(destPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete!');
  });
}).on('error', (err) => {
  console.error('Failed to download font:', err);
  process.exit(1);
});
