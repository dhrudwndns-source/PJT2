const https = require('https');

const url = 'https://pcmap.place.naver.com/restaurant/1831918518/photo';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Fetched data length:', data.length);
    // Find pstatic.net images
    const regex = /https:\/\/search\.pstatic\.net\/common\/\?src=[^"'\s>]+/g;
    const matches = data.match(regex);
    if (!matches) {
      console.log('No matches found.');
      return;
    }
    const unique = [...new Set(matches)].map(m => {
      return m.replace(/\\u002F/g, '/').replace(/\\&/g, '&').replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
    });
    console.log(`Found ${unique.length} unique URLs:`);
    unique.slice(0, 30).forEach((img, idx) => {
      console.log(`${idx + 1}: ${img}`);
    });
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
