import { X } from 'lucide-react';

export function ImageModal({ image, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-w-7xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <img
          src={image}
          alt="Full size"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

export default ImageModal