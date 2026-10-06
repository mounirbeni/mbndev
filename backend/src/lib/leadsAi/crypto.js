// Encrypts the buyers' own API keys at rest (AES-256-GCM).
const crypto = require('crypto');

function key() {
  const secret = process.env.LEADS_AI_SECRET || `${process.env.JWT_SECRET}:leads-ai`;
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

function decrypt(packed) {
  if (!packed) return null;
  try {
    const [iv, tag, data] = packed.split('.').map((s) => Buffer.from(s, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

module.exports = { encrypt, decrypt };
