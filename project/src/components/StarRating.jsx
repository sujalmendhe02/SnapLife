import { Star } from 'lucide-react';

function StarRating({ rating, size = 20, editable = false, onChange }) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex">
      {stars.map((star) => (
        <button
          key={star}
          type={editable ? "button" : undefined}
          onClick={() => editable && onChange?.(star)}
          className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!editable}
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export default StarRating;