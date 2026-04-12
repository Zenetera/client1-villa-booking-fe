/**
 * Injects Cloudinary on-the-fly transformations into a raw Cloudinary URL.
 *
 * Accepts URLs like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/folder/photo.jpg
 * and returns:
 *   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_<width>/v123/folder/photo.jpg
 *
 * If the URL is not a recognised Cloudinary upload URL it is returned unchanged.
 */

const UPLOAD_SEGMENT = '/image/upload/';

export function cloudinaryUrl(
  rawUrl: string,
  opts: { width?: number } = {},
): string {
  const idx = rawUrl.indexOf(UPLOAD_SEGMENT);
  if (idx === -1) return rawUrl;

  const parts = ['f_auto', 'q_auto'];
  if (opts.width) parts.push(`w_${opts.width}`);

  const insertAt = idx + UPLOAD_SEGMENT.length;
  return rawUrl.slice(0, insertAt) + parts.join(',') + '/' + rawUrl.slice(insertAt);
}

export function cloudinarySrcSet(
  rawUrl: string,
  widths: number[],
): string {
  return widths
    .map((w) => `${cloudinaryUrl(rawUrl, { width: w })} ${w}w`)
    .join(', ');
}
