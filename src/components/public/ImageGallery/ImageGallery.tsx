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
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [expanded] = useState(false);

  const open = useCallback((i: number) => setModalIndex(i), []);
  const close = useCallback(() => setModalIndex(null), []);
  const prev = useCallback(() => setModalIndex(i => i === null ? null : (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setModalIndex(i => i === null ? null : (i + 1) % images.length), [images.length]);

  if (images.length < 6) return null;

  const moreCount = images.length - 6;

  return (
    <>
      <section id='gallery' className={styles.gallery}>
        <div className={`${styles.cell} ${styles.cellLarge}`} onClick={() => open(0)}>
          <img src={images[0].url} alt={images[0].alt || 'Villa photo 1'} className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(1)}>
          <img src={images[1].url} alt={images[1].alt || 'Villa photo 2'} className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(2)}>
          <img src={images[2].url} alt={images[2].alt || 'Villa photo 3'} className={styles.img} />
        </div>
        <div className={`${styles.cell} ${!expanded ? styles.hiddenMobile : ''}`} onClick={() => open(3)}>
          <img src={images[3].url} alt={images[3].alt || 'Villa photo 4'} className={styles.img} />
        </div>
        <div className={`${styles.cell} ${!expanded ? styles.hiddenMobile : ''}`} onClick={() => open(4)}>
          <img src={images[4].url} alt={images[4].alt || 'Villa photo 5'} className={styles.img} />
        </div>
        <div className={`${styles.cell}${moreCount > 0 ? ` ${styles.moreCell}` : ''} ${!expanded ? styles.hiddenMobile : ''}`} onClick={() => open(5)}>
          <img src={images[5].url} alt={images[5].alt || 'More villa photos'} className={styles.img} />
          {moreCount > 0 && (
            <div className={styles.moreOverlay}>
              <span className={styles.moreCount}>+{moreCount}</span>
              <span className={styles.moreLabel}>more photos</span>
            </div>
          )}
        </div>
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
