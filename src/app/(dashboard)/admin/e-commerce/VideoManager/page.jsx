// src/components/admin/VideoManager.jsx
"use client";

import { useState, useEffect } from "react";

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: null,
    order: 0,
    isActive: true
  });

  // Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit new video
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video) {
      alert('Please select a video file');
      return;
    }
    
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('video', formData.video);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);

      const res = await fetch('/api/videos', {
        method: 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        setFormData({
          title: "",
          description: "",
          video: null,
          order: 0,
          isActive: true
        });
        fetchVideos();
        alert('Video uploaded successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  // Edit video
  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      video: null,
      order: video.order,
      isActive: video.isActive
    });
  };

  // Update video
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);

      const res = await fetch(`/api/videos/${editingVideo._id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (res.ok) {
        setEditingVideo(null);
        setFormData({
          title: "",
          description: "",
          video: null,
          order: 0,
          isActive: true
        });
        fetchVideos();
        alert('Video updated successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    } finally {
      setUploading(false);
    }
  };

  // Delete video
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchVideos();
        alert('Video deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Video Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingVideo ? 'Edit Video' : 'Upload New Video'}
        </h2>
        <form onSubmit={editingVideo ? handleUpdate : handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Video File * {editingVideo && '(Leave empty to keep current video)'}
            </label>
            <input
              type="file"
              name="video"
              onChange={handleInputChange}
              accept="video/mp4,video/webm,video/ogg"
              required={!editingVideo}
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: MP4, WebM, OGG. Max size: 100MB
            </p>
            {editingVideo && !formData.video && (
              <p className="text-sm text-gray-500 mt-1">
                Current video: {editingVideo.videoUrl.split('/').pop()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : editingVideo ? 'Update Video' : 'Upload Video'}
            </button>
            {editingVideo && (
              <button
                type="button"
                onClick={() => {
                  setEditingVideo(null);
                  setFormData({
                    title: "",
                    description: "",
                    video: null,
                    order: 0,
                    isActive: true
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

      {/* Video List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="border rounded-lg overflow-hidden shadow-sm">
              <video className="w-full h-48 object-cover" controls>
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
                {video.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{video.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Order: {video.order}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {videos.length === 0 && (
          <p className="text-center text-gray-500 py-8">No videos found. Upload your first video!</p>
        )}
      </div>
    </div>
  );
}