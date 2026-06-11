import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Crown, GripVertical } from 'lucide-react';
import { TripImage, ImageOrderItem } from '@shared/types';

interface ImageItem {
  key: string;
  type: 'existing' | 'new';
  id?: number;
  tempId?: string;
  url: string;
  name: string;
  file?: File;
}

interface ImageUploaderProps {
  existingImages?: TripImage[];
  newFiles: File[];
  deletedImageIds: number[];
  onNewFilesChange: (files: File[]) => void;
  onDeleteExisting: (id: number) => void;
  onOrderChange: (order: ImageOrderItem[]) => void;
  onNewFilesReordered?: (files: File[]) => void;
}

export default function ImageUploader({
  existingImages = [],
  newFiles,
  deletedImageIds,
  onNewFilesChange,
  onDeleteExisting,
  onOrderChange,
  onNewFilesReordered,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempIdCounterRef = useRef(0);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [longPressIndex, setLongPressIndex] = useState<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const touchDragItemRef = useRef<HTMLDivElement | null>(null);
  const [touchDragPos, setTouchDragPos] = useState({ x: 0, y: 0 });
  const initializedRef = useRef(false);

  const visibleExistingImages = useMemo(() => {
    return existingImages
      .filter(img => !deletedImageIds.includes(img.id))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [existingImages, deletedImageIds]);

  useEffect(() => {
    if (!initializedRef.current) {
      const existingItems = visibleExistingImages.map<ImageItem>(img => ({
        key: `existing-${img.id}`,
        type: 'existing',
        id: img.id,
        url: img.url || '',
        name: img.originalName,
      }));

      const newItems = newFiles.map<ImageItem>((file) => {
        tempIdCounterRef.current++;
        return {
          key: `new-${tempIdCounterRef.current}`,
          type: 'new',
          tempId: `new-${tempIdCounterRef.current}`,
          url: URL.createObjectURL(file),
          name: file.name,
          file,
        };
      });

      setItems([...existingItems, ...newItems]);
      initializedRef.current = true;
      return;
    }

    setItems(prev => {
      const existingKeys = new Set(visibleExistingImages.map(img => `existing-${img.id}`));
      const prevExistingIds = new Set(
        prev.filter(item => item.type === 'existing').map(item => `existing-${item.id}`)
      );

      let next = [...prev];

      const removedKeys = [...prevExistingIds].filter(k => !existingKeys.has(k));
      if (removedKeys.length > 0) {
        next = next.filter(item => !removedKeys.includes(item.key));
      }

      const addedImages = visibleExistingImages.filter(img => !prevExistingIds.has(`existing-${img.id}`));
      if (addedImages.length > 0) {
        const newExistingItems = addedImages.map<ImageItem>(img => ({
          key: `existing-${img.id}`,
          type: 'existing',
          id: img.id,
          url: img.url || '',
          name: img.originalName,
        }));
        next = [...next, ...newExistingItems];
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleExistingImages]);

  useEffect(() => {
    const order: ImageOrderItem[] = items.map(item => ({
      id: item.type === 'existing' ? item.id : undefined,
      tempId: item.type === 'new' ? item.tempId : undefined,
    }));
    onOrderChange(order);
  }, [items, onOrderChange]);

  useEffect(() => {
    const newFileItems = items.filter(item => item.type === 'new' && item.file);
    const reorderedFiles = newFileItems.map(item => item.file!);
    if (onNewFilesReordered) {
      onNewFilesReordered(reorderedFiles);
    }
  }, [items, onNewFilesReordered]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setItems(prev => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      moveItem(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, index };

    longPressTimerRef.current = setTimeout(() => {
      setLongPressIndex(index);
      setIsDraggingTouch(true);
      setTouchDragPos({ x: touch.clientX, y: touch.clientY });
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTouch || longPressIndex === null) {
      if (longPressTimerRef.current && touchStartRef.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartRef.current.y);
        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
      return;
    }

    e.preventDefault();
    const touch = e.touches[0];
    setTouchDragPos({ x: touch.clientX, y: touch.clientY });

    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const targetItem = elements.find(el => el.hasAttribute('data-image-index'));
    if (targetItem) {
      const index = parseInt(targetItem.getAttribute('data-image-index') || '-1', 10);
      if (index >= 0 && index !== dragOverIndex && index < items.length) {
        setDragOverIndex(index);
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isDraggingTouch && longPressIndex !== null && dragOverIndex !== null) {
      moveItem(longPressIndex, dragOverIndex);
    }

    setIsDraggingTouch(false);
    setLongPressIndex(null);
    setDragOverIndex(null);
    touchStartRef.current = null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`文件 ${file.name} 格式不支持，请上传 JPG、PNG 或 WEBP 格式图片`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 10MB 限制`);
        return false;
      }
      return true;
    });
    addNewFiles(validFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addNewFiles = (files: File[]) => {
    const currentCount = items.length;
    const maxAllowed = 20 - currentCount;
    const filesToAdd = files.slice(0, maxAllowed);

    if (files.length > maxAllowed) {
      alert(`最多只能上传 20 张图片，当前已有 ${currentCount} 张`);
    }

    const newItems = filesToAdd.map<ImageItem>((file) => {
      tempIdCounterRef.current++;
      return {
        key: `new-${tempIdCounterRef.current}`,
        type: 'new',
        tempId: `new-${tempIdCounterRef.current}`,
        url: URL.createObjectURL(file),
        name: file.name,
        file,
      };
    });

    setItems(prev => [...prev, ...newItems]);

    const allNewFiles = [
      ...items.filter(i => i.type === 'new' && i.file).map(i => i.file!),
      ...filesToAdd,
    ];
    onNewFilesChange(allNewFiles);
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    addNewFiles(imageFiles);
  };

  const handleDragOverFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeleteItem = (index: number) => {
    const item = items[index];
    if (item.type === 'existing' && item.id !== undefined) {
      onDeleteExisting(item.id);
    } else if (item.type === 'new') {
      setItems(prev => prev.filter((_, i) => i !== index));
      const remainingNewFiles = items
        .filter((i, idx) => idx !== index && i.type === 'new' && i.file)
        .map(i => i.file!);
      onNewFilesChange(remainingNewFiles);
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setItems(prev => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      next.unshift(removed);
      return next;
    });
  };

  const totalCount = items.length;
  const canAddMore = totalCount < 20;

  return (
    <div>
      <label className="label">
        照片（可选，最多20张）
        <span className="text-sm font-normal text-gray-500 ml-2">
          拖拽排序 · 长按移动（移动端）
        </span>
      </label>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
        {items.map((item, index) => (
          <div
            key={item.key}
            data-image-index={index}
            draggable={!isDraggingTouch}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`
              relative aspect-square rounded-xl overflow-hidden bg-cream-100
              transition-all duration-200 select-none group
              ${draggedIndex === index || longPressIndex === index ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === index && (draggedIndex !== null || isDraggingTouch) ? 'ring-2 ring-primary-500 ring-offset-2 scale-105' : ''}
              ${isDraggingTouch && longPressIndex === index ? 'invisible' : ''}
              cursor-grab active:cursor-grabbing
            `}
          >
            <img
              src={item.url}
              alt={item.name}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />

            {index === 0 && (
              <div className="absolute top-1 left-1 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3" />
                封面
              </div>
            )}

            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSetCover(index); }}
                disabled={index === 0}
                className={`
                  p-1.5 rounded-full shadow-md transition-colors
                  ${index === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-600'}
                `}
                title="设为封面"
              >
                <Crown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeleteItem(index); }}
                className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                title="删除"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 text-white px-1.5 py-0.5 rounded text-xs truncate max-w-[80%]">
                {index + 1}
              </div>
              <div className="bg-black/30 text-white p-1 rounded">
                <GripVertical className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}

        {canAddMore && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDropFiles}
            onDragOver={handleDragOverFiles}
            className="aspect-square border-2 border-dashed border-cream-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Upload className="w-6 h-6 text-cream-400 mb-1" />
            <span className="text-xs text-cream-500">点击或拖拽</span>
          </div>
        )}
      </div>

      {isDraggingTouch && longPressIndex !== null && items[longPressIndex] && (
        <div
          ref={touchDragItemRef}
          className="fixed pointer-events-none z-50 w-24 h-24 rounded-xl overflow-hidden shadow-2xl opacity-90"
          style={{
            left: touchDragPos.x - 48,
            top: touchDragPos.y - 48,
          }}
        >
          <img
            src={items[longPressIndex].url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        <ImageIcon className="w-3 h-3 inline mr-1" />
        支持 JPG、PNG、WEBP 格式，单张最大 10MB。第一张为封面图。
      </p>
    </div>
  );
}
