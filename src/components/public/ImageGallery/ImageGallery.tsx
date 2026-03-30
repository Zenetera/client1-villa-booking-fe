import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ImageGallery.module.css';

const imageModules = import.meta.glob('../../../assets/IMG_*.JPG', { eager: true }) as Record<string, { default: string }>;
const images: string[] = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, m]) => m.default);

interface GalleryModalProps {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function GalleryModal({ index, onClose, onPrev, onNext }: GalleryModalProps) {
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
            src={images[index]}
            alt={`Villa photo ${index + 1}`}
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

export function ImageGallery() {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setModalIndex(i), []);
  const close = useCallback(() => setModalIndex(null), []);
  const prev = useCallback(() => setModalIndex(i => i === null ? null : (i - 1 + images.length) % images.length), []);
  const next = useCallback(() => setModalIndex(i => i === null ? null : (i + 1) % images.length), []);

  if (images.length < 6) return null;

  const moreCount = images.length - 6;

  return (
    <>
      <section id='gallery' className={styles.gallery}>
        <div className={`${styles.cell} ${styles.cellLarge}`} onClick={() => open(0)}>
          <img src={images[0]} alt="Villa photo 1" className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(1)}>
          <img src={images[1]} alt="Villa photo 2" className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(2)}>
          <img src={images[2]} alt="Villa photo 3" className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(3)}>
          <img src={images[3]} alt="Villa photo 4" className={styles.img} />
        </div>
        <div className={styles.cell} onClick={() => open(4)}>
          <img src={images[4]} alt="Villa photo 5" className={styles.img} />
        </div>
        <div className={`${styles.cell}${moreCount > 0 ? ` ${styles.moreCell}` : ''}`} onClick={() => open(5)}>
          <img src={images[5]} alt="More villa photos" className={styles.img} />
          {moreCount > 0 && (
            <div className={styles.moreOverlay}>
              <span className={styles.moreCount}>+{moreCount}</span>
              <span className={styles.moreLabel}>more photos</span>
            </div>
          )}
        </div>
      </section>

      {modalIndex !== null && (
        <GalleryModal
          index={modalIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
