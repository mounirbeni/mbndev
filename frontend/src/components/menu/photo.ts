// Resizes a photo in the browser before upload, so menus stay fast on a phone
// and every photo fits the API's size limit (≈180 KB).

const MAX_BYTES = 170 * 1024;

const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not an image we can read.')); };
  img.src = url;
});

const bytesOf = (dataUrl: string) => Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

/** File → "data:image/webp;base64,…" (JPEG where the browser can't encode WebP). */
export async function resizePhoto(file: File, maxSide = 1000): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo (JPG, PNG or WebP).');
  const img = await loadImage(file);
  let side = maxSide;
  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser cannot resize photos.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.72, 0.6]) {
      let out = canvas.toDataURL('image/webp', quality);
      if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', quality);
      if (bytesOf(out) <= MAX_BYTES) return out;
    }
    side = Math.round(side * 0.75);
  }
  throw new Error('That photo is too large — try another one.');
}
