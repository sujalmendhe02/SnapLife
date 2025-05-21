import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import Reply from './Reply';

function Review({ review, currentUser, isAuthor, onLike, onDelete, onReply, onDeleteReply, onLikeReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const canDelete = currentUser && (isAuthor || currentUser.id === review.user._id);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(review._id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <Link 
            to={`/profile/${review.user._id}`} 
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <img
                src={review.user.profilePicture || 'https://via.placeholder.com/40'}
                alt={review.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-indigo-500 transition-colors"></div>
            </div>
          </Link>
          <div>
            <Link 
              to={`/profile/${review.user._id}`}
              className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
            >
              {review.user.username}
            </Link>
            <StarRating rating={review.rating} size={20} />
            <p className="mt-2 text-gray-700">{review.comment}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentUser && (
            <>
              <button
                onClick={() => onLike(review._id)}
                className={`p-1 rounded-full hover:bg-gray-100 flex items-center space-x-1 transition-colors ${
                  review.likes?.includes(currentUser.id) ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="text-xs">{review.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </>
          )}
          
          {canDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="p-1 rounded-full hover:bg-gray-100 text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="2"
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {review.replies?.map((reply) => (
        <Reply
          key={reply._id}
          reply={reply}
          currentUser={currentUser}
          onDelete={() => onDeleteReply(review._id, reply._id)}
          onLike={() => onLikeReply(review._id, reply._id)}
        />
      ))}
    </div>
  );
}

export default Review;