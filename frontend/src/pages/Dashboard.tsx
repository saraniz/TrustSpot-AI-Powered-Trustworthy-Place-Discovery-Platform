import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useReviewStore } from '../store/reviewStore';
import { usePlaceStore } from '../store/placeStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { reviews, loading: reviewsLoading, fetchReviewsByUser, deleteReview } = useReviewStore();
  const { places, loading: placesLoading, fetchPlaces } = usePlaceStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Local bookmarks state
  const [savedPlaceIds, setSavedPlaceIds] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      fetchReviewsByUser(user.id);
    }
    fetchPlaces();

    // Load saved places from localStorage
    const saved = localStorage.getItem('savedPlaces');
    if (saved) {
      try {
        setSavedPlaceIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user, fetchReviewsByUser, fetchPlaces]);

  // Calculate statistics from real data
  const totalReviews = reviews.length;
  const totalPlaces = places.length;
  
  const totalLikes = reviews.reduce((sum, r) => sum + (r.likesCount || 0), 0);
  
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Resolve place information for reviews
  const placesLookup = React.useMemo(() => {
    const lookup: Record<number, { name: string; category: string; image: string }> = {};
    places.forEach(p => {
      lookup[p.id] = {
        name: p.name,
        category: p.category,
        image: p.imageUrls?.[0] || 'https://via.placeholder.com/100'
      };
    });
    return lookup;
  }, [places]);

  // Saved places objects
  const savedPlacesList = React.useMemo(() => {
    return places.filter(p => savedPlaceIds.includes(p.id));
  }, [places, savedPlaceIds]);

  // Places registered by the current user
  const myPlacesList = React.useMemo(() => {
    if (!user) return [];
    return places.filter(p => p.userId === user.id);
  }, [places, user]);

  const handleUnsavePlace = (placeId: number) => {
    const updated = savedPlaceIds.filter(id => id !== placeId);
    setSavedPlaceIds(updated);
    localStorage.setItem('savedPlaces', JSON.stringify(updated));
  };

  const handleDelete = async (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const success = await deleteReview(reviewId);
      if (success && user) {
        fetchReviewsByUser(user.id);
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400'
                : i < rating
                ? 'text-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-blue-100">
                Here's what's happening with your reviews and places.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <Link
                to="/create-place"
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium text-sm flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Place
              </Link>
              <Link
                to="/places"
                className="bg-white text-blue-600 px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Write Review
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Places</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalPlaces}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Likes Received</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalLikes}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Reviews
              </button>
              <button
                onClick={() => setActiveTab('my-places')}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'my-places'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Registered Places
              </button>
              <button
                onClick={() => setActiveTab('places')}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'places'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Places
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {reviewsLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">No recent activity. Try writing a review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => {
                      const placeInfo = placesLookup[review.placeId] || {
                        name: `Place #${review.placeId}`,
                        image: 'https://via.placeholder.com/100',
                      };

                      return (
                        <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                          <img
                            src={placeInfo.image}
                            alt={placeInfo.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Link to={`/places/${review.placeId}`} className="font-bold text-gray-900 hover:text-blue-600 hover:underline">
                                {placeInfo.name}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-1">{renderStars(review.rating)}</div>
                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {reviews.length > 3 && (
                  <div className="mt-4 text-center">
                    <button onClick={() => setActiveTab('reviews')} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View all reviews →
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All My Reviews</h3>
                {reviewsLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't written any reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const placeInfo = placesLookup[review.placeId] || {
                        name: `Place #${review.placeId}`,
                        image: 'https://via.placeholder.com/100',
                      };

                      return (
                        <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                          <img
                            src={placeInfo.image}
                            alt={placeInfo.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Link to={`/places/${review.placeId}`} className="font-bold text-gray-900 hover:text-blue-600 hover:underline">
                                {placeInfo.name}
                              </Link>
                              <div className="flex space-x-2">
                                <Link to={`/places/${review.placeId}`} className="text-blue-600 hover:text-blue-700 text-sm">View</Link>
                                <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                              </div>
                            </div>
                            <div className="mt-1">{renderStars(review.rating)}</div>
                            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-places' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Places You Registered</h3>
                {myPlacesList.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">
                    You haven't registered any places yet. Go ahead and add a new place!
                  </p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {myPlacesList.map((place) => (
                      <div key={place.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 border">
                        <img
                          src={place.imageUrls?.[0] || "https://via.placeholder.com/200"}
                          alt={place.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 truncate">{place.name}</h4>
                          <p className="text-sm text-gray-500">{place.category}</p>
                          <div className="mt-3 flex space-x-2">
                            <Link to={`/places/${place.id}`} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 text-center">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'places' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Places</h3>
                {savedPlacesList.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">
                    You haven't saved any places yet. View details on a place to bookmark it!
                  </p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {savedPlacesList.map((place) => (
                      <div key={place.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 border">
                        <img
                          src={place.imageUrls?.[0] || "https://via.placeholder.com/200"}
                          alt={place.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 truncate">{place.name}</h4>
                          <p className="text-sm text-gray-500">{place.category}</p>
                          <div className="mt-3 flex space-x-2">
                            <Link to={`/places/${place.id}`} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 text-center">
                              View Details
                            </Link>
                            <button
                              onClick={() => handleUnsavePlace(place.id)}
                              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Remove bookmark"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-100 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white mx-auto shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                  {user.bio ? (
                    <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto italic">
                      "{user.bio}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3">No bio added yet.</p>
                  )}
                </div>
                <div className="space-y-4">
                  <Link to="/profile" className="block text-center w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200">
                    Edit Profile & Pictures
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Explore Places</h4>
                <p className="text-sm text-gray-600 mt-1">Discover new places to review</p>
              </div>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <Link to="/places" className="inline-block mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
              Explore now →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Write a Review</h4>
                <p className="text-sm text-gray-600 mt-1">Share your experience</p>
              </div>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <Link to="/places" className="inline-block mt-4 text-purple-600 font-medium text-sm hover:text-purple-700">
              Write now →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Add a Place</h4>
                <p className="text-sm text-gray-600 mt-1">List a new location</p>
              </div>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <Link to="/create-place" className="inline-block mt-4 text-green-600 font-medium text-sm hover:text-green-700">
              Add now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;