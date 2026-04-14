// src/components/admin/AboutManager.jsx
"use client";

import { useState, useEffect } from "react";

export default function AboutManager() {
  const [aboutContents, setAboutContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    language: "en",
    title: "",
    content: "",
    order: 0,
    isActive: true
  });

  // Fetch about contents
  const fetchAboutContents = async () => {
    try {
      const res = await fetch('/api/about');
      const data = await res.json();
      setAboutContents(data);
    } catch (error) {
      console.error('Error fetching about contents:', error);
    }
  };

  useEffect(() => {
    fetchAboutContents();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit new about content
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({
          language: "en",
          title: "",
          content: "",
          order: 0,
          isActive: true
        });
        fetchAboutContents();
        alert('About content added successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add about content');
      }
    } catch (error) {
      console.error('Error adding about content:', error);
      alert('Failed to add about content');
    } finally {
      setLoading(false);
    }
  };

  // Edit about content
  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      language: content.language,
      title: content.title,
      content: content.content,
      order: content.order,
      isActive: content.isActive
    });
  };

  // Update about content
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/about/${editingContent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setEditingContent(null);
        setFormData({
          language: "en",
          title: "",
          content: "",
          order: 0,
          isActive: true
        });
        fetchAboutContents();
        alert('About content updated successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update about content');
      }
    } catch (error) {
      console.error('Error updating about content:', error);
      alert('Failed to update about content');
    } finally {
      setLoading(false);
    }
  };

  // Delete about content
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this about content?')) return;

    try {
      const res = await fetch(`/api/about/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchAboutContents();
        alert('About content deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting about content:', error);
      alert('Failed to delete about content');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">About Page Management</h1>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingContent ? 'Edit About Content' : 'Add New About Content'}
        </h2>
        <form onSubmit={editingContent ? handleUpdate : handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Language *</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="en">English</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., About Us, आमच्याबद्दल"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="10"
              required
              placeholder="Enter your about page content here..."
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports HTML formatting for bold, italic, etc.
            </p>
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
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first. Same language content will be grouped together.
            </p>
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
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingContent ? 'Update Content' : 'Add Content'}
            </button>
            {editingContent && (
              <button
                type="button"
                onClick={() => {
                  setEditingContent(null);
                  setFormData({
                    language: "en",
                    title: "",
                    content: "",
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

      {/* About Content List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing About Content</h2>
        <div className="space-y-4">
          {aboutContents.map((content) => (
            <div key={content._id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-lg">{content.title}</span>
                  <span className={`ml-3 px-2 py-1 text-xs rounded ${
                    content.language === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {content.language === 'en' ? 'English' : 'मराठी'}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    content.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {content.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(content)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(content._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                    {content.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Order: {content.order} | Created: {new Date(content.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        {aboutContents.length === 0 && (
          <p className="text-center text-gray-500 py-8">No about content found. Add your first content!</p>
        )}
      </div>
    </div>
  );
}