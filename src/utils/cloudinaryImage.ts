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
  const w = opts.width != null ? Math.trunc(opts.width) : 0;
  if (w > 0) parts.push(`w_${w}`);

  const insertAt = idx + UPLOAD_SEGMENT.length;
  return rawUrl.slice(0, insertAt) + parts.join(',') + '/' + rawUrl.slice(insertAt);
}

export function cloudinarySrcSet(
  rawUrl: string,
  widths: number[],
): string {
  return widths
    .filter((w) => Number.isFinite(w) && Math.trunc(w) > 0)
    .map((w) => {
      const size = Math.trunc(w);
      return `${cloudinaryUrl(rawUrl, { width: size })} ${size}w`;
    })
    .join(', ');
}
