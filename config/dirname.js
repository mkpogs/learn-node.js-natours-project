// config/dirname.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const getDirname = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  return dirname(__filename);
};

export default getDirname;
