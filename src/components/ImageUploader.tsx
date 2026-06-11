import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { TripImage } from '@shared/types';

interface ImageUploaderProps {
  existingImages?: TripImage[];
  newFiles: File[];
  deletedImageIds: number[];
  onNewFilesChange: (files: File[]) => void;
  onDeleteExisting: (id: number) => void;
  onDeleteNewFile: (index: number) => void;
}

export default function ImageUploader({
  existingImages = [],
  newFiles,
  deletedImageIds,
  onNewFilesChange,
  onDeleteExisting,
  onDeleteNewFile,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onNewFilesChange([...newFiles, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    onNewFilesChange([...newFiles, ...imageFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const visibleExistingImages = existingImages.filter(img => !deletedImageIds.includes(img.id));

  return (
    <div>
      <label className="label">照片（可选，最多20张）</label>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
        {visibleExistingImages.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-cream-100">
            <img
              src={img.url}
              alt={img.originalName}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onDeleteExisting(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {newFiles.map((file, index) => (
          <div key={`new-${index}`} className="relative group aspect-square rounded-xl overflow-hidden bg-cream-100">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onDeleteNewFile(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {visibleExistingImages.length + newFiles.length < 20 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="aspect-square border-2 border-dashed border-cream-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Upload className="w-6 h-6 text-cream-400 mb-1" />
            <span className="text-xs text-cream-500">点击或拖拽</span>
          </div>
        )}
      </div>

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
        支持 JPG、PNG、WEBP 格式，单张最大 10MB
      </p>
    </div>
  );
}
