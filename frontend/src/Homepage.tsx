import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlaceStore } from './store/placeStore';
import { reviewApi } from '../api/api';
import type { Review } from './types';

const HomePage: React.FC = () => {
  const { places, fetchPlaces } = usePlaceStore();
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      await fetchPlaces();
    };
    loadStats();
  }, [fetchPlaces]);

  useEffect(() => {
    if (places.length > 0) {
      const loadReviewsForStats = async () => {
        let allReviewsCount = 0;
        let ratingsSum = 0;
        const uniqueUserIds = new Set<number>();

        // Fetch reviews for each place in parallel to aggregate counts
        await Promise.all(
          places.map(async (place) => {
            try {
              const res = await reviewApi.get<Review[]>(`/api/reviews/place/${place.id}`);
              const reviewsList = res.data;
              allReviewsCount += reviewsList.length;
              ratingsSum += reviewsList.reduce((sum, r) => sum + r.rating, 0);
              reviewsList.forEach(r => uniqueUserIds.add(r.userId));
            } catch (e) {
              console.error("Failed to fetch reviews for place", place.id, e);
            }
          })
        );

        // Also add users who registered places
        places.forEach(p => {
          if (p.userId) {
            uniqueUserIds.add(p.userId);
          }
        });

        setTotalReviews(allReviewsCount);
        setAverageRating(
          allReviewsCount > 0 ? parseFloat((ratingsSum / allReviewsCount).toFixed(1)) : 0
        );
        setActiveUsersCount(uniqueUserIds.size > 0 ? uniqueUserIds.size : 3); // Fallback to 3 if database is fresh
        setLoadingStats(false);
      };

      loadReviewsForStats();
    } else {
      setLoadingStats(false);
    }
  }, [places]);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero Section - Full Width */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Discover and Review Amazing Places
            </h1>
            <p className="text-xl mb-8 text-blue-100 font-medium">
              Share your experiences, discover new locations, and help others make informed decisions through authentic reviews.
            </p>
            <div className="mt-5 flex gap-4 flex-wrap">
              <Link
                to="/places"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm"
              >
                Explore Places
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section className="py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-950 mb-12">
            Why TrustSpot
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Authentic Reviews
              </h3>
              <p className="text-black leading-relaxed font-medium">
                Read and write genuine reviews from real users. Our verification system ensures trustworthy content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Discover Places
              </h3>
              <p className="text-black leading-relaxed font-medium">
                Find restaurants, cafes, parks, and more. Search by category or location to discover hidden gems.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Community Driven
              </h3>
              <p className="text-black leading-relaxed font-medium">
                Join a growing community of explorers. Share your experiences and help others discover great places.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width */}
      <section className="bg-white py-16 w-full border-y border-gray-100 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingStats ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-extrabold text-blue-600">{activeUsersCount}</div>
                <div className="text-gray-950 font-bold mt-2">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-blue-600">{places.length}</div>
                <div className="text-gray-950 font-bold mt-2">Places Listed</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-blue-600">{totalReviews}</div>
                <div className="text-gray-950 font-bold mt-2">Reviews Posted</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-blue-600">{averageRating > 0 ? averageRating : "0.0"}</div>
                <div className="text-gray-950 font-bold mt-2">Average Rating</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Full Width */}
      <section className="py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-950 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Create Account
              </h3>
              <p className="text-black font-medium leading-relaxed max-w-sm mx-auto">
                Sign up with your email and create your profile to start contributing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Explore & Review
              </h3>
              <p className="text-black font-medium leading-relaxed max-w-sm mx-auto">
                Discover places, read reviews, and share your own experiences with ratings and comments.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Build Community
              </h3>
              <p className="text-black font-medium leading-relaxed max-w-sm mx-auto">
                Like reviews, follow users, and become part of a trusted review community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="bg-blue-600 text-white py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Share Your Experiences?
          </h2>
          <p className="text-xl mb-8 text-blue-100 font-medium">
            Join TrustSpot today and start discovering amazing places.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block shadow-md hover:scale-105 transition-transform"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;