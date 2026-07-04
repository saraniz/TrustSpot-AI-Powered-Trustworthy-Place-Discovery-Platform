import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { userProfile, loading, error, fetchUserProfile, updateUserProfile, updateProfileImage, updateCoverImage } = useUserStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  const [profileImageInput, setProfileImageInput] = useState('');
  const [coverImageInput, setCoverImageInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile(currentUser.id).then((profile) => {
        if (profile) {
          setFormData({
            name: profile.name,
            email: profile.email,
            bio: profile.bio || '',
          });
          setProfileImageInput(profile.profileImageUrl || '');
          setCoverImageInput(profile.coverImageUrl || '');
        }
      });
    }
  }, [currentUser, fetchUserProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfileImageInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCoverImageInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateUserProfile(currentUser.id, formData);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(error || "Failed to update profile details.");
    }
  };

  const handleImageUpdate = async (type: 'profile' | 'cover') => {
    if (!currentUser) return;
    setSaveSuccess(false);
    setSaveError(null);

    let success;
    if (type === 'profile') {
      success = await updateProfileImage(currentUser.id, profileImageInput);
    } else {
      success = await updateCoverImage(currentUser.id, coverImageInput);
    }

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(error || `Failed to update ${type} image.`);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">Please log in to manage your profile.</p>
      </div>
    );
  }

  const resolvedProfile = userProfile || currentUser;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            {resolvedProfile.coverImageUrl && (
              <img
                src={resolvedProfile.coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Avatar and Basic Metadata */}
          <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row md:items-end md:space-x-6">
            <div className="-mt-16 relative w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-md flex-shrink-0">
              {resolvedProfile.profileImageUrl ? (
                <img
                  src={resolvedProfile.profileImageUrl}
                  alt={resolvedProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-4xl">
                  {resolvedProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900">{resolvedProfile.name}</h1>
              <p className="text-gray-500">{resolvedProfile.email}</p>
              {resolvedProfile.bio && (
                <p className="text-sm text-gray-600 mt-2 max-w-xl italic">"{resolvedProfile.bio}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Panel Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Details Form */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Edit Profile Details</h3>
            
            {saveSuccess && (
              <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm font-medium">
                Changes saved successfully!
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                {saveError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Share details about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm transition-all"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Photos Management */}
          <div className="space-y-6">
            
             {/* Avatar URL form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Profile Picture</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">IMAGE URL</label>
                  <input
                    type="text"
                    placeholder="https://domain.com/photo.jpg"
                    value={profileImageInput}
                    onChange={(e) => setProfileImageInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">OR UPLOAD FILE</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileFileChange}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
              <button
                onClick={() => handleImageUpdate('profile')}
                disabled={loading}
                className="w-full py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs hover:bg-gray-100 transition-all"
              >
                Update Avatar
              </button>
            </div>

            {/* Cover URL form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Cover Image</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">IMAGE URL</label>
                  <input
                    type="text"
                    placeholder="https://domain.com/cover.jpg"
                    value={coverImageInput}
                    onChange={(e) => setCoverImageInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">OR UPLOAD FILE</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
              <button
                onClick={() => handleImageUpdate('cover')}
                disabled={loading}
                className="w-full py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs hover:bg-gray-100 transition-all"
              >
                Update Cover
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
