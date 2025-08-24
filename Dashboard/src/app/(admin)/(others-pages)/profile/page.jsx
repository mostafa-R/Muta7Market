'use client';

import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  Camera,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const AdminProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    bio: '',
    profileImage: {
      url: '',
      public_id: ''
    }
  });
  const [originalData, setOriginalData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1';

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success && data.user) {
        const userData = data.user;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || '',
          isActive: userData.isActive ?? true,
          isEmailVerified: userData.isEmailVerified ?? false,
          isPhoneVerified: userData.isPhoneVerified ?? false,
          bio: userData.bio || '',
          profileImage: {
            url: userData.profileImage?.url || '',
            public_id: userData.profileImage?.public_id || ''
          }
        });
        setOriginalData(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update admin profile
  const updateProfile = async () => {
    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('bio', profileData.bio);
      
      if (profileImage && profileImage.size > 0) {
        formData.append('profileImage', profileImage);
      }

      const response = await fetch(`${API_BASE}/user/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': getAuthHeaders().Authorization
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      toast.success('Profile updated successfully');
      setOriginalData(data.user);
      setIsEditing(false);
      
      // Clear profile image changes
      setProfileImage(null);
      setImagePreview(null);
      
      // Update local storage if needed
      if (data.user) {
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...currentUserData, ...data.user };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New password and confirm password do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return;
      }

      setIsChangingPassword(true);

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await response.json();
      toast.success('Password changed successfully');
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle profile image selection
  const handleProfileImageSelected = (file) => {
    if (file.size > 0) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setImagePreview(null);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original data
      setProfileData({
        name: originalData.name || '',
        email: originalData.email || '',
        phone: originalData.phone || '',
        role: originalData.role || '',
        isActive: originalData.isActive ?? true,
        isEmailVerified: originalData.isEmailVerified ?? false,
        isPhoneVerified: originalData.isPhoneVerified ?? false,
        bio: originalData.bio || '',
        profileImage: {
          url: originalData.profileImage?.url || '',
          public_id: originalData.profileImage?.public_id || ''
        }
      });
      // Reset profile image changes
      setProfileImage(null);
      setImagePreview(null);
    }
    setIsEditing(!isEditing);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile();
  };

  // Fetch profile on component mount
  useEffect(() => {
    if (user && isAdmin()) {
      fetchProfile();
    }
  }, [user]);

  // Check if user is admin
  if (!user || !isAdmin()) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !originalData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Admin Profile" />
        <div className="space-y-6">
          <ComponentCard title="Admin Profile">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="bg-[#1e293b] rounded-t-xl p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile Preview" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : profileData.profileImage?.url ? (
                        <img 
                          src={profileData.profileImage.url} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full text-blue-600 hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.name || 'Admin User'}</h1>
                    <p className="text-blue-100 text-lg">{profileData.role}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profileData.isActive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                      }`}>
                        {profileData.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {profileData.isEmailVerified && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-100">
                          Email Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden File Input for Profile Image */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleProfileImageSelected(file);
                  }
                }}
                className="hidden"
              />

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-b-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    {/* Profile Image Upload */}
                    {isEditing && (
                      <div>
                        <Label className="flex items-center space-x-2 mb-2">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span>Profile Image</span>
                        </Label>
                        <div className="space-y-3">
                          {imagePreview && (
                            <div className="relative w-32 h-32 mx-auto">
                              <img 
                                src={imagePreview} 
                                alt="Profile Preview" 
                                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileImage(null);
                                  setImagePreview(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="name" className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Full Name</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>Email Address</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled={true}
                        className="mt-1 bg-gray-50"
                        placeholder="Email address"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>Phone Number</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                    
                    <div>
                      <Label htmlFor="bio" className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Bio</span>
                      </Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Role</span>
                      </Label>
                      <Input
                        type="text"
                        value={profileData.role}
                        disabled={true}
                        className="mt-1 bg-gray-50"
                        placeholder="User role"
                      />
                      <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                    </div>

                    <div>
                      <Label className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Status</span>
                      </Label>
                      <Input
                        type="text"
                        value={profileData.isActive ? 'Active' : 'Inactive'}
                        disabled={true}
                        className="mt-1 bg-gray-50"
                        placeholder="Account status"
                      />
                      <p className="text-xs text-gray-500 mt-1">Status cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={handleEditToggle}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-6 py-2 rounded-lg flex items-center space-x-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                      </Button>
                    </>
                  )}
                </div>
              </form>

              {/* Password Change Section */}
              <div className="bg-white rounded-xl p-6 mt-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span>Change Password</span>
                  </h3>
                  <Button
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>

                {showPasswordChange && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Password */}
                      <div>
                        <Label htmlFor="currentPassword" className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span>Current Password</span>
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <Label htmlFor="newPassword" className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span>New Password</span>
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="md:w-1/2">
                      <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span>Confirm New Password</span>
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Minimum 8 characters long</li>
                        <li>• Should contain letters, numbers, and special characters</li>
                      </ul>
                    </div>

                    {/* Change Password Button */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={changePassword}
                        disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default AdminProfilePage;
