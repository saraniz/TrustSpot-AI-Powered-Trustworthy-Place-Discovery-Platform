import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useReviewStore } from '../store/reviewStore';
import { usePlaceStore } from '../store/placeStore';
import { useAuthStore } from '../store/authStore';
import type { Review } from '../types';

const MyReviewsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { reviews, loading: reviewsLoading, error: reviewsError, fetchReviewsByUser, updateReview, deleteReview } = useReviewStore();
  const { places, fetchPlaces } = usePlaceStore();
  const navigate = useNavigate();

  // Edit states
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editImageUrlsInput, setEditImageUrlsInput] = useState('');

  useEffect(() => {
    if (user) {
      fetchReviewsByUser(user.id);
      fetchPlaces();
    }
  }, [user, fetchReviewsByUser, fetchPlaces]);

  // Create a place name lookup map
  const placesMap = useMemo(() => {
    const map: Record<number, { name: string; image: string }> = {};
    places.forEach((p) => {
      map[p.id] = {
        name: p.name,
        image: p.imageUrls?.[0] || 'https://via.placeholder.com/150',
      };
    });
    return map;
  }, [places]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const success = await deleteReview(id);
      if (success && user) {
        fetchReviewsByUser(user.id);
      }
    }
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditImageUrlsInput(review.imageUrls?.join(', ') || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId === null) return;

    const imageUrls = editImageUrlsInput
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const success = await updateReview(editingReviewId, {
      rating: editRating,
      comment: editComment,
      imageUrls,
    });

    if (success) {
      setEditingReviewId(null);
      if (user) {
        fetchReviewsByUser(user.id);
      }
    } else {
      alert("Failed to update review.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">Please log in to view your reviews.</p>
        <Link to="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">Log In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Reviews</h1>
          <p className="text-gray-500 mt-1">Manage and edit the reviews you've written.</p>
        </div>

        {reviewsError && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium">
            {reviewsError}
          </div>
        )}

        {/* Edit Review Form (Modal overlay or prominent card) */}
        {editingReviewId !== null && (
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Review</h3>
              <button 
                onClick={() => setEditingReviewId(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rating</label>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= editRating ? 'text-yellow-400' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Experience</label>
                <textarea
                  rows={4}
                  required
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo URLs (comma-separated)</label>
                <input
                  type="text"
                  value={editImageUrlsInput}
                  onChange={(e) => setEditImageUrlsInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm transition-colors"
              >
                Update Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-1">You haven't written any reviews yet</h3>
            <p className="text-gray-500 mb-6">Start exploring places to write your first review!</p>
            <Link
              to="/places"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Explore Places
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const placeDetails = placesMap[review.placeId] || {
                name: `Place #${review.placeId}`,
                image: 'https://via.placeholder.com/150',
              };

              return (
                <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={placeDetails.image} 
                      alt={placeDetails.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/places/${review.placeId}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 hover:underline">
                          {placeDetails.name}
                        </Link>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>
                      
                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {review.imageUrls.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Review attachment"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-xs font-semibold text-gray-500">
                      <span>{review.likesCount || 0} Likes</span>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => startEditing(review)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReviewsPage;
