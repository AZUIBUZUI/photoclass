import path from 'node:path';
import { SUPPORTED_EXTENSIONS } from '../../shared/constants.js';

export function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

export function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext.replace('.', '');
}
