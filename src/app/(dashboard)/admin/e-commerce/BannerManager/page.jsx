// src/components/admin/BannerManager.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "ORDER NOW",
    buttonLink: "/shop",
    image: null
  });

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  // Submit new banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonLink', formData.buttonLink);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        setFormData({
          title: "",
          subtitle: "",
          buttonText: "ORDER NOW",
          buttonLink: "/shop",
          image: null
        });
        fetchBanners();
        alert('Banner added successfully!');
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner');
    } finally {
      setLoading(false);
    }
  };

  // Edit banner
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      image: null
    });
  };

  // Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonLink', formData.buttonLink);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch(`/api/banners/${editingBanner._id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (res.ok) {
        setEditingBanner(null);
        setFormData({
          title: "",
          subtitle: "",
          buttonText: "ORDER NOW",
          buttonLink: "/shop",
          image: null
        });
        fetchBanners();
        alert('Banner updated successfully!');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Failed to update banner');
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchBanners();
        alert('Banner deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingBanner ? 'Edit Banner' : 'Add New Banner'}
        </h2>
        <form onSubmit={editingBanner ? handleUpdate : handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input
              type="text"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banner Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2"
            />
            {editingBanner && !formData.image && (
              <p className="text-sm text-gray-500 mt-1">
                Current image: {editingBanner.imageUrl.split('/').pop()}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
            </button>
            {editingBanner && (
              <button
                type="button"
                onClick={() => {
                  setEditingBanner(null);
                  setFormData({
                    title: "",
                    subtitle: "",
                    buttonText: "ORDER NOW",
                    buttonLink: "/shop",
                    image: null
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Banner List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Banners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-48">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-600 text-sm mt-1">{banner.subtitle}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Button: {banner.buttonText}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {banners.length === 0 && (
          <p className="text-center text-gray-500 py-8">No banners found. Add your first banner!</p>
        )}
      </div>
    </div>
  );
}