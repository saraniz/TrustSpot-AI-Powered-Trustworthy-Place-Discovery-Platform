import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceStore } from '../store/placeStore';
import { useAuthStore } from '../store/authStore';


const CreatePlacePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    category: 'Restaurant',
    imageUrlsInput: '',
  });
  
  const [placeImages, setPlaceImages] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createPlace, loading } = usePlaceStore();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPlaceImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (formData.imageUrlsInput.trim()) {
      setPlaceImages((prev) => [...prev, formData.imageUrlsInput.trim()]);
      setFormData((prev) => ({ ...prev, imageUrlsInput: '' }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setPlaceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name.trim() || !formData.address.trim() || !formData.description.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    // Process image URLs
    const imageUrls = [...placeImages];

    // If no images provided, use a placeholder based on category
    if (imageUrls.length === 0) {
      const categoryImages: Record<string, string> = {
        Restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        Cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        Park: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
        Hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        Museum: "https://images.unsplash.com/photo-1554907906-bab22b5e3735?auto=format&fit=crop&w=800&q=80",
        Shopping: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      };
      imageUrls.push(categoryImages[formData.category] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80");
    }

    const lat = parseFloat(formData.latitude) || 40.7128;
    const lng = parseFloat(formData.longitude) || -74.0060;

    const newPlace = await createPlace({
      name: formData.name,
      description: formData.description,
      address: formData.address,
      latitude: lat,
      longitude: lng,
      category: formData.category,
      imageUrls,
      userId: currentUser?.id,
    });

    if (newPlace) {
      navigate('/places');
    } else {
      setSubmitError("Failed to create place. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Add a New Place</h1>
          <p className="text-gray-500 mt-1">Register a location to start receiving reviews.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Central Park Espresso"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Park">Park</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Museum">Museum</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. 123 Main St, New York, NY 10001"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="e.g. 40.7128"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="e.g. -74.0060"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe the place, what it offers, vibe, and facilities..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place Images (File upload or URL)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="imageUrlsInput"
                    placeholder="Paste image URL here..."
                    value={formData.imageUrlsInput}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Add URL
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Previews */}
              {placeImages.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-dashed">
                  {placeImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {placeImages.length === 0 && (
                <p className="text-xs text-gray-400">If left blank, a high-quality stock photo matching the category will be used.</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] disabled:opacity-75"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Submit Place'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlacePage;
