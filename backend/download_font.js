const fs = require('fs');
const https = require('https');

const url = 'https://themes.googleusercontent.com/static/fonts/roboto/v9/zN7GBFwfMP4uA6AR0HCoEQ.ttf';
https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    
    // Check if utils directory exists, if not create it
    if (!fs.existsSync('src/utils')) {
      fs.mkdirSync('src/utils', { recursive: true });
    }
    
    const content = `export const ROBOTO_BASE64 = '${base64}';\n`;
    fs.writeFileSync('src/utils/font.ts', content);
    console.log('Font successfully downloaded and converted to Base64 in src/utils/font.ts!');
  });
}).on('error', (e) => {
  console.error('Failed to download font:', e);
});
