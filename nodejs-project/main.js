// nodejs-mobile entry — start kugoumusicapi server
const path = require('path');
process.chdir(path.join(__dirname));

// Start server and notify bridge when ready
const app = require('./app.js');

// app exports start() which is async — we hook into the listen callback
// The server exports startService() which returns Express with .service = http.Server
const { startService } = require('./server');

startService().then((appExt) => {
  const port = appExt.service.address().port;
  console.log(`[nodejs-mobile] kugoumusicapi ready on :${port}`);

  // Notify nodejs-mobile bridge if available
  try {
    if (typeof nodejs !== 'undefined' && nodejs.channel) {
      nodejs.channel.send(JSON.stringify({ event: 'server-ready', port }));
      nodejs.channel.post('server-ready', { port });
    }
  } catch (_) { /* bridge not available — running standalone */ }
}).catch((err) => {
  console.error('[nodejs-mobile] server start failed:', err);
  try {
    if (typeof nodejs !== 'undefined' && nodejs.channel) {
      nodejs.channel.send(JSON.stringify({ event: 'server-error', error: err.message }));
      nodejs.channel.post('server-error', err.message);
    }
  } catch (_) {}
});
