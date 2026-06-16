export function getThumbnailUrl(fileHash) {
  if (!fileHash) return '';
  return `local://thumbnails/${fileHash}.webp`;
}

// Safe base64url encode for file paths (handles UTF-8)
function toBase64url(str) {
  // Use TextEncoder for proper UTF-8 → base64
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getImageUrl(filePath) {
  if (!filePath) return '';
  return `local://file?p=${toBase64url(filePath)}`;
}
