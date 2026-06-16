import { protocol, net } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { getThumbnailCachePath } from './utils/paths.js';

// Register custom protocol for serving local files without cross-origin issues
// URL formats:
//   local://thumbnails/<hash>.webp  — hostname='thumbnails', path='/<hash>.webp'
//   local://file?p=<base64url>      — hostname='file', query p=<encoded path>
export function registerProtocol() {
  protocol.handle('local', (request) => {
    try {
      const url = new URL(request.url);
      const host = url.hostname;
      console.log('[Protocol]', host, url.pathname + url.search);

      // ---- Thumbnail: local://thumbnails/<hash>.webp ----
      if (host === 'thumbnails') {
        const fileName = path.basename(url.pathname);
        const thumbFile = path.join(getThumbnailCachePath(), fileName);
        const ok = fs.existsSync(thumbFile);
        console.log('[Protocol] thumb:', thumbFile, ok ? 'OK' : 'MISSING');
        if (ok) {
          const u = 'file:///' + thumbFile.replace(/\\/g, '/');
          return net.fetch(u);
        }
        return new Response('Not Found', { status: 404 });
      }

      // ---- Full image: local://file?p=<base64url> ----
      if (host === 'file') {
        const encoded = url.searchParams.get('p') || '';
        if (encoded) {
          const filePath = Buffer.from(encoded, 'base64url').toString('utf-8');
          const ok = fs.existsSync(filePath);
          console.log('[Protocol] image:', filePath, ok ? 'OK' : 'MISSING');
          if (ok) {
            const u = 'file:///' + filePath.replace(/\\/g, '/');
            return net.fetch(u);
          }
          return new Response('File Not Found: ' + filePath, { status: 404 });
        }
        return new Response('Missing param', { status: 400 });
      }

      return new Response('Unknown route', { status: 400 });
    } catch (err) {
      console.error('[Protocol] exception:', err.message);
      return new Response('Error: ' + err.message, { status: 500 });
    }
  });
}
