import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import Review from './Review';
import axios from 'axios';

function ReviewSection({ blog, onReviewSubmit, onReviewDelete, onReviewLike }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, token } = useAuth();

  const handleReviewSubmit = (reviewData) => {
    onReviewSubmit(reviewData);
    setShowReviewForm(false);
  };

  const handleReply = async (reviewId, content) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/reviews/${reviewId}/replies`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update the blog state with the new data
      onReviewSubmit(response.data);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/blogs/${blog._id}/reviews/${reviewId}/replies/${replyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update the blog state with the new data
      onReviewSubmit(response.data);
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleLikeReply = async (reviewId, replyId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/reviews/${reviewId}/replies/${replyId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update the blog state with the new data
      onReviewSubmit(response.data);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const hasUserReviewed = user && blog.reviews?.some(review => review.user._id === user.id);

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        {user && !hasUserReviewed && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {blog.reviews?.map((review) => (
          <Review
            key={review._id}
            review={review}
            currentUser={user}
            isAuthor={blog.author._id === user?.id}
            onDelete={() => onReviewDelete(review._id)}
            onLike={() => onReviewLike(review._id)}
            onReply={handleReply}
            onDeleteReply={handleDeleteReply}
            onLikeReply={handleLikeReply}
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewSection;

