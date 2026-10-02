'use strict';

/**
 * fileSignature.js
 *
 * Verifies a file's actual bytes match its claimed extension via magic-byte
 * signatures, instead of trusting the client-supplied filename extension and
 * multipart Content-Type — both of which an attacker fully controls. Hand
 * -rolled (no new dependency) since the app only needs to recognize the
 * small, fixed set of extensions middleware/upload.js already allows.
 *
 * Word/Zip/PDF/plain-text formats don't have a single unambiguous signature
 * the way images do, so those are checked more loosely (verified not to be
 * an obviously different, disallowed binary format) rather than rejected on
 * any signature mismatch — false positives here would just break legitimate
 * uploads.
 */

function startsWith(buf, bytes, offset = 0) {
  if (buf.length < offset + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buf[offset + i] !== bytes[i]) return false;
  }
  return true;
}

const CHECKS = {
  '.jpg':  (buf) => startsWith(buf, [0xff, 0xd8, 0xff]),
  '.jpeg': (buf) => startsWith(buf, [0xff, 0xd8, 0xff]),
  '.png':  (buf) => startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  '.gif':  (buf) => startsWith(buf, [0x47, 0x49, 0x46, 0x38]), // GIF8[7|9]a
  '.webp': (buf) => startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8), // RIFF....WEBP
  '.pdf':  (buf) => startsWith(buf, [0x25, 0x50, 0x44, 0x46]), // %PDF
  '.zip':  (buf) => startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4b, 0x05, 0x06]),
  // .docx is a zip container under the hood — same signature as .zip
  '.docx': (buf) => startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4b, 0x05, 0x06]),
  // legacy .doc — OLE compound file
  '.doc':  (buf) => startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  // Plain text has no magic number — just reject the unambiguous "this is
  // actually a Windows/Linux executable" cases rather than trying to prove
  // a positive.
  '.txt':  (buf) => !startsWith(buf, [0x4d, 0x5a]) && !startsWith(buf, [0x7f, 0x45, 0x4c, 0x46]),
  '.csv':  (buf) => !startsWith(buf, [0x4d, 0x5a]) && !startsWith(buf, [0x7f, 0x45, 0x4c, 0x46]),
  // Office Open XML formats are zip containers
  '.xlsx': (buf) => startsWith(buf, [0x50, 0x4b, 0x03, 0x04]),
  '.pptx': (buf) => startsWith(buf, [0x50, 0x4b, 0x03, 0x04]),
  '.xls':  (buf) => startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  // archives
  '.rar':  (buf) => startsWith(buf, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]),            // Rar!\x1a\x07
  '.7z':   (buf) => startsWith(buf, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
  '.gz':   (buf) => startsWith(buf, [0x1f, 0x8b]),
  '.tgz':  (buf) => startsWith(buf, [0x1f, 0x8b]),
  '.tar':  (buf) => startsWith(buf, [0x75, 0x73, 0x74, 0x61, 0x72], 257),             // "ustar" at 257
  // ISO base media (mp4 / mov): a box size, then "ftyp" — or a QuickTime atom
  '.mp4':  (buf) => startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4),
  '.mov':  (buf) => startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4)
                  || startsWith(buf, [0x6d, 0x6f, 0x6f, 0x76], 4)
                  || startsWith(buf, [0x77, 0x69, 0x64, 0x65], 4),
};

/** Bytes needed to evaluate every signature above (tar's magic sits at 257). */
const SIGNATURE_BYTES = 264;

/**
 * @param {Buffer} buffer
 * @param {string} ext lowercased, with leading dot (e.g. ".png")
 * @returns {boolean} true if the content matches the claimed extension, or
 *   there's no signature defined for it (fail open only for unknown exts —
 *   middleware/upload.js's ALLOWED_EXTS already restricts what reaches here).
 */
function matchesSignature(buffer, ext) {
  const check = CHECKS[ext];
  if (!check) return true;
  if (!buffer || buffer.length === 0) return false;
  return check(buffer);
}

module.exports = { matchesSignature, SIGNATURE_BYTES };
