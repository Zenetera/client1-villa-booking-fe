import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { VillaImage } from '../../../types/villa';
import styles from './ImageGallery.module.css';

interface GalleryModalProps {
  images: VillaImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function GalleryModal({ images, index, onClose, onPrev, onNext }: GalleryModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close gallery">
          <X size={20} />
        </button>

        <button className={styles.prevBtn} onClick={onPrev} aria-label="Previous photo">
          <ChevronLeft size={28} />
        </button>

        <div className={styles.imageFrame}>
          <img
            key={index}
            src={images[index].url}
            alt={images[index].alt || `Villa photo ${index + 1}`}
            className={styles.modalImage}
          />
        </div>

        <button className={styles.nextBtn} onClick={onNext} aria-label="Next photo">
          <ChevronRight size={28} />
        </button>

        <div className={styles.counter}>
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

interface ImageGalleryProps {
  images: VillaImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [rawModalIndex, setModalIndex] = useState<number | null>(null);
  const [expanded] = useState(false);

  // Derived clamp: if images shrinks below the stored index, treat the modal as closed.
  const modalIndex =
    rawModalIndex === null || rawModalIndex >= images.length
      ? null
      : rawModalIndex;

  const open = useCallback((i: number) => {
    if (i < 0 || i >= images.length) return;
    setModalIndex(i);
  }, [images.length]);
  const close = useCallback(() => setModalIndex(null), []);
  const prev = useCallback(() => setModalIndex(i => i === null || images.length === 0 ? null : (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setModalIndex(i => i === null || images.length === 0 ? null : (i + 1) % images.length), [images.length]);

  if (images.length === 0) return null;

  const previewImages = images.slice(0, 6);
  const moreCount = Math.max(0, images.length - 6);

  return (
    <>
      <section id='gallery' className={styles.gallery}>
        {previewImages.map((image, index) => {
          const isLarge = index === 0;
          const isHiddenMobile = index >= 3 && !expanded;
          const isMoreCell = index === 5 && moreCount > 0;
          const classes = [
            styles.cell,
            isLarge ? styles.cellLarge : '',
            isMoreCell ? styles.moreCell : '',
            isHiddenMobile ? styles.hiddenMobile : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={image.id ?? index}
              type="button"
              className={classes}
              onClick={() => open(index)}
              aria-label={
                isMoreCell
                  ? `View all photos, ${moreCount} more`
                  : `Open photo ${index + 1} in gallery`
              }
            >
              <img
                src={image.url}
                alt={image.alt || (isMoreCell ? 'More villa photos' : `Villa photo ${index + 1}`)}
                className={styles.img}
              />
              {isMoreCell && (
                <div className={styles.moreOverlay}>
                  <span className={styles.moreCount}>+{moreCount}</span>
                  <span className={styles.moreLabel}>more photos</span>
                </div>
              )}
            </button>
          );
        })}
      </section>

      {!expanded && (
        <div className={styles.viewMoreRow}>
          <button className={styles.viewMoreBtn} onClick={() => open(0)}>
            View more
          </button>
        </div>
      )}

      {modalIndex !== null && (
        <GalleryModal
          images={images}
          index={modalIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
