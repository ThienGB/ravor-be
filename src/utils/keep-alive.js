const https = require('https');

/**
 * Pings the server periodically to keep it from sleeping on Render.
 * Render Free Tier sleeps after 15 minutes of inactivity.
 */
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL;

  if (!url) {
    console.log('Keep-alive: RENDER_EXTERNAL_URL not set. Skipping self-ping.');
    return;
  }

  // Ping every 5 minutes (300,000 ms)
  const interval = 5 * 60 * 1000;

  setInterval(() => {
    https.get(`${url}/health`, (res) => {
      console.log(`Keep-alive: Pinged ${url}/health. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Keep-alive: Ping failed.', err.message);
    });
  }, interval);
};

module.exports = keepAlive;
