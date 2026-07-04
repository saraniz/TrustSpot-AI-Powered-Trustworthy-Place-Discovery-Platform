import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlaceStore } from '../store/placeStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../../api/api';
import type { Review } from '../types';

const PlaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const placeId = id ? parseInt(id, 10) : NaN;
  const navigate = useNavigate();

  const { currentPlace, fetchPlaceById, loading: placeLoading, error: placeError, updatePlace, deletePlace } = usePlaceStore();
  const { reviews, loading: reviewsLoading, error: reviewsError, fetchReviewsByPlace, createReview, updateReview, deleteReview, toggleLikeReview } = useReviewStore();
  const { user: currentUser } = useAuthStore();

  // Place editing state
  const [isEditingPlace, setIsEditingPlace] = useState(false);
  const [editPlaceData, setEditPlaceData] = useState({
    name: '',
    description: '',
    address: '',
    category: 'Restaurant',
    latitude: '',
    longitude: '',
  });
  const [editPlaceImages, setEditPlaceImages] = useState<string[]>([]);
  const [editPlaceImageUrlsInput, setEditPlaceImageUrlsInput] = useState('');

  const startEditingPlace = () => {
    if (!currentPlace) return;
    setEditPlaceData({
      name: currentPlace.name,
      description: currentPlace.description,
      address: currentPlace.address,
      category: currentPlace.category,
      latitude: String(currentPlace.latitude || ''),
      longitude: String(currentPlace.longitude || ''),
    });
    setEditPlaceImages(currentPlace.imageUrls || []);
    setEditPlaceImageUrlsInput('');
    setIsEditingPlace(true);
  };

  const handleEditPlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlace) return;
    const success = await updatePlace(currentPlace.id, {
      name: editPlaceData.name,
      description: editPlaceData.description,
      address: editPlaceData.address,
      category: editPlaceData.category,
      latitude: parseFloat(editPlaceData.latitude) || 0,
      longitude: parseFloat(editPlaceData.longitude) || 0,
      imageUrls: editPlaceImages,
    });
    if (success) {
      setIsEditingPlace(false);
    } else {
      alert("Failed to update place details.");
    }
  };

  const handleDeletePlace = async () => {
    if (!currentPlace) return;
    if (window.confirm("Are you sure you want to delete this place and all of its reviews?")) {
      const success = await deletePlace(currentPlace.id);
      if (success) {
        navigate('/places');
      } else {
        alert("Failed to delete place.");
      }
    }
  };

  const handleEditPlaceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditPlaceImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddEditPlaceUrl = () => {
    if (editPlaceImageUrlsInput.trim()) {
      setEditPlaceImages((prev) => [...prev, editPlaceImageUrlsInput.trim()]);
      setEditPlaceImageUrlsInput('');
    }
  };

  const handleRemoveEditPlaceImage = (index: number) => {
    setEditPlaceImages((prev) => prev.filter((_, i) => i !== index));
  };

  // User details cache to resolve names and profile pictures for reviews
  const [usersCache, setUsersCache] = useState<Record<number, { name: string; profileImageUrl?: string }>>({});
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrlsInput, setImageUrlsInput] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editImageUrlsInput, setEditImageUrlsInput] = useState('');
  const [editReviewImages, setEditReviewImages] = useState<string[]>([]);

  // Helpers for file uploads (Review Form)
  const handleReviewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReviewImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddReviewUrl = () => {
    if (imageUrlsInput.trim()) {
      setReviewImages((prev) => [...prev, imageUrlsInput.trim()]);
      setImageUrlsInput('');
    }
  };

  const handleRemoveReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Helpers for file uploads (Edit Form)
  const handleEditReviewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditReviewImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddEditReviewUrl = () => {
    if (editImageUrlsInput.trim()) {
      setEditReviewImages((prev) => [...prev, editImageUrlsInput.trim()]);
      setEditImageUrlsInput('');
    }
  };

  const handleRemoveEditReviewImage = (index: number) => {
    setEditReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch place details and reviews
  useEffect(() => {
    if (!isNaN(placeId)) {
      fetchPlaceById(placeId);
      fetchReviewsByPlace(placeId);
    }
  }, [placeId, fetchPlaceById, fetchReviewsByPlace]);

  // Fetch user profiles for reviews dynamically
  useEffect(() => {
    const fetchMissingUsers = async () => {
      const missingIds = reviews
        .map(r => r.userId)
        .filter(userId => !usersCache[userId]);

      const uniqueMissingIds = Array.from(new Set(missingIds));

      if (uniqueMissingIds.length === 0) return;

      const newProfiles: Record<number, { name: string; profileImageUrl?: string }> = {};
      
      await Promise.all(
        uniqueMissingIds.map(async (userId) => {
          try {
            const res = await userApi.get(`/api/users/${userId}`);
            newProfiles[userId] = {
              name: res.data.name,
              profileImageUrl: res.data.profileImageUrl,
            };
          } catch (err) {
            console.error(`Failed to resolve profile for user ${userId}`, err);
            newProfiles[userId] = { name: `User #${userId}` };
          }
        })
      );

      setUsersCache(prev => ({ ...prev, ...newProfiles }));
    };

    if (reviews.length > 0) {
      fetchMissingUsers();
    }
  }, [reviews, usersCache]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.debug("[PlaceDetailsPage] Submitting review. currentUser:", currentUser);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.id) {
      setSubmitError("Your user session is invalid. Please log out and log back in.");
      console.error("[PlaceDetailsPage] currentUser is missing an 'id' attribute!", currentUser);
      return;
    }

    setSubmitError(null);
    if (!comment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }

    setSubmittingReview(true);

    const success = await createReview({
      placeId,
      userId: currentUser.id,
      rating,
      comment,
      imageUrls: reviewImages.length > 0 ? reviewImages : undefined,
    });

    setSubmittingReview(false);
    if (success) {
      setComment('');
      setImageUrlsInput('');
      setReviewImages([]);
      setRating(5);
      // Refresh reviews list
      fetchReviewsByPlace(placeId);
    } else {
      setSubmitError("Failed to submit review. Try again.");
    }
  };

  const handleLikeToggle = async (reviewId: number) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await toggleLikeReview(reviewId, currentUser.id);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview(reviewId);
    }
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditImageUrlsInput('');
    setEditReviewImages(review.imageUrls || []);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId === null) return;

    const success = await updateReview(editingReviewId, {
      rating: editRating,
      comment: editComment,
      imageUrls: editReviewImages.length > 0 ? editReviewImages : undefined,
    });

    if (success) {
      setEditingReviewId(null);
      setEditReviewImages([]);
      fetchReviewsByPlace(placeId);
    } else {
      alert("Failed to update review.");
    }
  };

  if (placeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (placeError || !currentPlace) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Place Not Found</h2>
        <p className="text-gray-500 mt-2">{placeError || "We couldn't find the place you're looking for."}</p>
        <Link to="/places" className="mt-4 inline-block text-blue-600 hover:underline">Back to all places</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/places" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Places
        </Link>

        {/* Place Hero Section */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-8 grid md:grid-cols-2">
          {isEditingPlace ? (
            /* Editing Mode */
            <form onSubmit={handleEditPlaceSubmit} className="p-8 md:p-12 col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Place Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Place Name</label>
                  <input
                    type="text"
                    required
                    value={editPlaceData.name}
                    onChange={(e) => setEditPlaceData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editPlaceData.category}
                    onChange={(e) => setEditPlaceData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Restaurant', 'Cafe', 'Park', 'Hotel', 'Museum', 'Shopping', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={editPlaceData.address}
                  onChange={(e) => setEditPlaceData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editPlaceData.latitude}
                    onChange={(e) => setEditPlaceData(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editPlaceData.longitude}
                    onChange={(e) => setEditPlaceData(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editPlaceData.description}
                  onChange={(e) => setEditPlaceData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Place Images edit section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Place Images</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste image URL here..."
                    value={editPlaceImageUrlsInput}
                    onChange={(e) => setEditPlaceImageUrlsInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button; button"
                    onClick={handleAddEditPlaceUrl}
                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Add URL
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditPlaceFilesChange}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                
                {editPlaceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-dashed">
                    {editPlaceImages.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditPlaceImage(idx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPlace(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <div className="h-96 md:h-full bg-gray-100 relative">
                <img
                  src={currentPlace.imageUrls?.[0] || 'https://via.placeholder.com/600'}
                  alt={currentPlace.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                  {currentPlace.category}
                </span>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{currentPlace.name}</h1>
                    {currentUser && (currentPlace.userId === currentUser.id || !currentPlace.userId) && (
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={startEditingPlace}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                          Edit Place
                        </button>
                        <button
                          onClick={handleDeletePlace}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Ratings Overview */}
                  <div className="flex items-center mb-6">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews'} ({reviews.length} reviews)
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-gray-600 flex items-start mb-6">
                    <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{currentPlace.address}</span>
                  </p>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-6">{currentPlace.description}</p>
                </div>
                
                {/* Map Coords Footer */}
                <div className="border-t border-gray-100 pt-6 flex justify-between text-xs text-gray-400 font-medium">
                  <span>Latitude: {currentPlace.latitude.toFixed(4)}</span>
                  <span>Longitude: {currentPlace.longitude.toFixed(4)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Tabs / Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Reviews</h2>

            {reviewsError && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium">
                {reviewsError}
              </div>
            )}

            {reviewsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                <p className="text-gray-500 font-medium">No reviews written for this place yet.</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => {
                  const author = usersCache[review.userId] || { name: `User #${review.userId}` };
                  const isOwner = currentUser?.id === review.userId;
                  const isLikedByMe = currentUser ? (review.likedByUserIds?.includes(currentUser.id) || false) : false;

                  return (
                    <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      
                      {/* Review Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {author.profileImageUrl ? (
                            <img
                              src={author.profileImageUrl}
                              alt={author.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900">{author.name}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>

                      {/* Image Gallery */}
                      {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {review.imageUrls.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Review attachment"
                              className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                            />
                          ))}
                        </div>
                      )}

                      {/* Review Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeToggle(review.id)}
                          className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                            isLikedByMe
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 ${isLikedByMe ? 'fill-current' : 'none'}`}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{review.likesCount || 0} Likes</span>
                        </button>

                        {/* Owner Actions */}
                        {isOwner && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => startEditing(review)}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Forms */}
          <div className="space-y-6">
            
            {/* Submit Review Box */}
            {currentUser ? (
              currentUser.id === currentPlace.userId ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Own Location</h3>
                  <p className="text-sm text-gray-500">You registered this place. Creators cannot submit reviews for their own locations to maintain fair and unbiased feedback.</p>
                </div>
              ) : (
                editingReviewId === null ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>

                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Stars Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rating</label>
                      <div className="flex space-x-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <svg
                              className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Experience</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us about food, service, cleaniness, staff..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      />
                    </div>

                    {/* Image Attachment Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Add Photos (File upload or URL)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Paste image URL here..."
                            value={imageUrlsInput}
                            onChange={(e) => setImageUrlsInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddReviewUrl}
                            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                          >
                            Add URL
                          </button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleReviewFilesChange}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>

                      {/* Image previews */}
                      {reviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-dashed">
                          {reviewImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white group">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveReviewImage(idx)}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                              >
                                remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex justify-center text-sm disabled:opacity-70"
                    >
                      {submittingReview ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Edit Review Form */
                <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm sticky top-24">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Your Review</h3>
                    <button
                      onClick={() => setEditingReviewId(null)}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    {/* Stars Select */}
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

                    {/* Comment */}
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

                    {/* Image Attachment Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Add Photos (File upload or URL)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Paste image URL here..."
                            value={editImageUrlsInput}
                            onChange={(e) => setEditImageUrlsInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddEditReviewUrl}
                            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                          >
                            Add URL
                          </button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleEditReviewFilesChange}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>

                      {/* Image previews */}
                      {editReviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-dashed">
                          {editReviewImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white group">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveEditReviewImage(idx)}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                              >
                                remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      Update Review
                    </button>
                  </form>
                </div>
              )
            )
            ) : (
              /* Non-Logged In Message */
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Want to write a review?</h3>
                <p className="text-sm text-gray-500 mb-4">Please log in or register to contribute to the community.</p>
                <Link
                  to="/login"
                  className="block w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm mb-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-2.5 px-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaceDetailsPage;
