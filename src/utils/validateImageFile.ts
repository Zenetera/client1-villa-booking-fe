const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, and WebP files are allowed';
  }
  if (file.size > MAX_SIZE) {
    return 'File must be under 5 MB';
  }
  return null;
}
