import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Star, GripVertical, Pencil, Trash2, Check, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchImages,
  createImage,
  updateImage,
  reorderImages,
  deleteImage,
  uploadToCloudinary,
  type VillaImage,
} from '../../../api/admin';
import { validateImageFile } from '../../../utils/validateImageFile';
import styles from './ImageManagerPage.module.css';

interface SortableImageCardProps {
  image: VillaImage;
  editingId: number | null;
  editText: string;
  savedId: number | null;
  onSetHero: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (image: VillaImage) => void;
  onEditChange: (value: string) => void;
  onEditBlur: () => void;
}

function SortableImageCard({
  image,
  editingId,
  editText,
  savedId,
  onSetHero,
  onDelete,
  onStartEdit,
  onEditChange,
  onEditBlur,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditing = editingId === image.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.imageCard} ${image.isHero ? styles.hero : ''}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={image.imageUrl}
          alt={image.altText}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.imageOverlay}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
        <div className={styles.imageActions}>
          <button
            className={`${styles.iconButton} ${image.isHero ? styles.heroActive : ''}`}
            title="Set as hero image"
            aria-label={image.isHero ? 'Current hero image' : 'Set as hero image'}
            aria-pressed={image.isHero}
            onClick={() => onSetHero(image.id)}
          >
            <Star size={14} />
          </button>
          <button
            className={styles.iconButton}
            title="Edit alt text"
            aria-label="Edit alt text"
            onClick={() => onStartEdit(image)}
          >
            <Pencil size={14} />
          </button>
          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            title="Delete image"
            aria-label="Delete image"
            onClick={() => onDelete(image.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {image.isHero && <span className={styles.heroBadge}>Hero</span>}

      <div className={styles.imageAlt}>
        {isEditing ? (
          <input
            type="text"
            className={styles.altInput}
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditBlur();
            }}
            autoFocus
          />
        ) : (
          <span className={styles.altText}>
            {image.altText || 'No alt text'}
            {savedId === image.id && (
              <Check size={12} className={styles.savedIcon} />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export function ImageManagerPage() {
  const [images, setImages] = useState<VillaImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [savedId, setSavedId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const loadImages = useCallback(async () => {
    try {
      const data = await fetchImages();
      setImages(data);
      setError(null);
    } catch {
      setError('Failed to load images');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
    };
  }, []);

  // Upload
  async function handleFiles(files: File[]) {
    setUploadErrors([]);
    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const err = validateImageFile(file);
      if (err) {
        errors.push(`${file.name}: ${err}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      if (errors.length > 0) setUploadErrors(errors);
      return;
    }

    setUploading(true);
    try {
      const results = await Promise.allSettled(
        validFiles.map(async (file) => {
          const secureUrl = await uploadToCloudinary(file);
          await createImage({ imageUrl: secureUrl, altText: '' });
        }),
      );

      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const name = validFiles[idx].name;
          errors.push(`${name}: upload failed`);
        }
      });

      if (errors.length > 0) setUploadErrors(errors);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      if (successCount > 0) {
        await loadImages();
      }
    } catch {
      setError('Failed to upload one or more images');
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFiles(Array.from(files));
    e.target.value = '';
  }

  function handleDropZoneClick() {
    if (uploading) return;
    fileInputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  // Set hero
  async function handleSetHero(id: number) {
    try {
      await updateImage(id, { isHero: true });
      await loadImages();
    } catch {
      setError('Failed to set hero image');
    }
  }

  // Delete
  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteImage(id);
      await loadImages();
    } catch {
      setError('Failed to delete image');
    }
  }

  // Edit alt text
  function handleStartEdit(image: VillaImage) {
    setEditingId(image.id);
    setEditText(image.altText);
  }

  async function handleEditBlur() {
    if (editingId === null) return;
    const id = editingId;
    const newAlt = editText;
    setEditingId(null);

    const current = images.find((img) => img.id === id);
    if (current && current.altText === newAlt) return;

    try {
      await updateImage(id, { altText: newAlt });
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, altText: newAlt } : img)),
      );
      setSavedId(id);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSavedId(null), 2000);
    } catch {
      setError('Failed to update alt text');
    }
  }

  // Drag to reorder
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);

    // Optimistic update: first image becomes hero
    const optimistic = reordered.map((img, idx) => ({
      ...img,
      displayOrder: idx,
      isHero: idx === 0,
    }));
    setImages(optimistic);

    try {
      const ids = reordered.map((img) => img.id);
      await reorderImages(ids);
      // Set first image as hero if it changed
      const newFirstId = reordered[0].id;
      if (!reordered[0].isHero) {
        await updateImage(newFirstId, { isHero: true });
      }
      await loadImages();
    } catch {
      setError('Failed to reorder images');
      await loadImages();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Images</h1>
          <p className={styles.subtitle}>
            Manage your property gallery photos
          </p>
        </div>
        <button
          className={styles.uploadButton}
          onClick={handleDropZoneClick}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={16} className={styles.spinner} /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />

      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${uploading ? styles.dropZoneDisabled : ''}`}
        onClick={handleDropZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <Loader2 size={32} strokeWidth={1.5} className={styles.spinner} />
        ) : (
          <Upload size={32} strokeWidth={1.5} />
        )}
        <p className={styles.dropText}>
          {uploading
            ? 'Uploading images...'
            : 'Drag and drop images here, or click to browse'}
        </p>
        <p className={styles.dropHint}>JPG, PNG, or WebP. Max 5 MB per file.</p>
      </div>

      {uploadErrors.length > 0 && (
        <div className={styles.uploadErrors}>
          {uploadErrors.map((err, i) => (
            <p key={i} className={styles.uploadError}>{err}</p>
          ))}
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.dismissError}>
            &times;
          </button>
        </div>
      )}

      {loaded && (
        <div className={styles.galleryInfo}>
          <span>{images.length} images</span>
          <span className={styles.galleryHint}>
            Drag to reorder. First image is used as the hero.
          </span>
        </div>
      )}

      {loaded && images.length === 0 ? (
        <p className={styles.emptyText}>
          No images yet. Upload your first image above.
        </p>
      ) : images.length === 0 ? null : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className={styles.grid}>
              {images.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  editingId={editingId}
                  editText={editText}
                  savedId={savedId}
                  onSetHero={handleSetHero}
                  onDelete={handleDelete}
                  onStartEdit={handleStartEdit}
                  onEditChange={setEditText}
                  onEditBlur={handleEditBlur}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
