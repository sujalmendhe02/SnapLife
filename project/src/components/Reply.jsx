import { ThumbsUp, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function Reply({ reply, onDelete, onLike, currentUser }) {
  const canDelete = currentUser && (currentUser.id === reply.user._id);

  return (
    <div className="ml-12 mt-2 bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-2">
          <Link to={`/profile/${reply.user._id}`} className="flex-shrink-0">
            <img
              src={reply.user.profilePicture || 'https://via.placeholder.com/40'}
              alt={reply.user.username}
              className="w-6 h-6 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link 
              to={`/profile/${reply.user._id}`}
              className="text-sm font-medium hover:text-indigo-600"
            >
              {reply.user.username}
            </Link>
            <p className="text-sm text-gray-600">{reply.content}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLike(reply._id)}
            className={`text-sm flex items-center space-x-1 ${
              reply.likes?.includes(currentUser?.id) ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{reply.likes?.length || 0}</span>
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(reply._id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reply;