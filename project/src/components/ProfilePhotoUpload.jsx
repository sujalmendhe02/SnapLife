import { useState } from 'react';
import { Upload, X } from 'lucide-react';

function ProfilePhotoUpload({ currentPhoto, onPhotoSelect, uploading }) {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    onPhotoSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onPhotoSelect(null);
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button
            onClick={removePhoto}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your photo here, or click to select
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: 5MB
          </p>
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Uploading photo...</p>
        </div>
      )}
    </div>
  );
}

export default ProfilePhotoUpload;