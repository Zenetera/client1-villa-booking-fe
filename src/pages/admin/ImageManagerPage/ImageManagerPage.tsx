import { Upload, Star, GripVertical, Pencil, Trash2 } from 'lucide-react';
import styles from './ImageManagerPage.module.css';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  isHero: boolean;
}

const MOCK_IMAGES: GalleryImage[] = [
  { id: '1', url: '', alt: 'Villa exterior with pool', isHero: true },
  { id: '2', url: '', alt: 'Living room', isHero: false },
  { id: '3', url: '', alt: 'Master bedroom', isHero: false },
  { id: '4', url: '', alt: 'Kitchen', isHero: false },
  { id: '5', url: '', alt: 'Sea view from terrace', isHero: false },
  { id: '6', url: '', alt: 'Bathroom', isHero: false },
];

export function ImageManagerPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Images</h1>
          <p className={styles.subtitle}>Manage your property gallery photos</p>
        </div>
        <button className={styles.uploadButton}>
          <Upload size={16} />
          Upload Images
        </button>
      </div>

      <div className={styles.dropZone}>
        <Upload size={32} strokeWidth={1.5} />
        <p className={styles.dropText}>
          Drag and drop images here, or click to browse
        </p>
        <p className={styles.dropHint}>
          JPG, PNG, or WebP. Max 5 MB per file.
        </p>
      </div>

      <div className={styles.galleryInfo}>
        <span>{MOCK_IMAGES.length} images</span>
        <span className={styles.galleryHint}>Drag to reorder. First image is used as the hero.</span>
      </div>

      <div className={styles.grid}>
        {MOCK_IMAGES.map((image) => (
          <div
            key={image.id}
            className={`${styles.imageCard} ${image.isHero ? styles.hero : ''}`}
          >
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>{image.alt}</span>
            </div>

            <div className={styles.imageOverlay}>
              <div className={styles.dragHandle}>
                <GripVertical size={16} />
              </div>
              <div className={styles.imageActions}>
                <button
                  className={`${styles.iconButton} ${image.isHero ? styles.heroActive : ''}`}
                  title="Set as hero image"
                >
                  <Star size={14} />
                </button>
                <button className={styles.iconButton} title="Edit alt text">
                  <Pencil size={14} />
                </button>
                <button
                  className={`${styles.iconButton} ${styles.deleteButton}`}
                  title="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {image.isHero && (
              <span className={styles.heroBadge}>Hero</span>
            )}

            <div className={styles.imageAlt}>
              <span>{image.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
