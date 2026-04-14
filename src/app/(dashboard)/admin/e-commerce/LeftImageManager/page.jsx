// src/components/admin/LeftImageManager.jsx
"use client";

import { useState, useEffect } from "react";

export default function LeftImageManager() {
  const [leftImage, setLeftImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    alt: ""
  });
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch left image
  const fetchLeftImage = async () => {
    try {
      const res = await fetch('/api/left-image');
      const data = await res.json();
      setLeftImage(data);
      setFormData({
        image: null,
        alt: data.alt || ""
      });
    } catch (error) {
      console.error('Error fetching left image:', error);
    }
  };

  useEffect(() => {
    fetchLeftImage();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Update left image
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('alt', formData.alt);

      const res = await fetch('/api/left-image', {
        method: 'PUT',
        body: formDataToSend
      });

      if (res.ok) {
        fetchLeftImage();
        setPreviewUrl("");
        alert('Left image updated successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update left image');
      }
    } catch (error) {
      console.error('Error updating left image:', error);
      alert('Failed to update left image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Left Image Management</h1>
      <p className="text-gray-600 mb-6">
        This image appears on the left side of the featured collection section.
      </p>

      {/* Current Image Preview */}
      {leftImage && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Image</h2>
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <img
              src={leftImage.imageUrl}
              alt={leftImage.alt}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Alt Text: {leftImage.alt}</p>
        </div>
      )}

      {/* Update Form */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Update Left Image</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, WEBP. Max size: 5MB
            </p>
          </div>

          {previewUrl && (
            <div>
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              name="alt"
              value={formData.alt}
              onChange={handleInputChange}
              placeholder="Describe the image for accessibility"
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text is used for screen readers and if the image fails to load
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Update Image'}
          </button>
        </form>
      </div>
    </div>
  );
}