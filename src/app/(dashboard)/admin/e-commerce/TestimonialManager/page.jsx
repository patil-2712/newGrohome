"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  FaStar, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaUserCheck, 
  FaUser,
  FaEnvelope,
  FaComment,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    rating: 5,
    position: "",
    image: null,
    order: 0,
    isActive: true
  });

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch('/api/testimonials/pending');
      const data = await res.json();
      setPendingReviews(data);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    fetchPendingReviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('review', formData.review);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch('/api/testimonials', {
        method: 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        setFormData({
          name: "",
          review: "",
          rating: 5,
          position: "",
          image: null,
          order: 0,
          isActive: true
        });
        fetchTestimonials();
        alert('Testimonial added successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add testimonial');
      }
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Failed to add testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/testimonials/${id}/approve`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchPendingReviews();
        fetchTestimonials();
        alert('Review approved successfully!');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingItem(testimonial);
    setFormData({
      name: testimonial.name,
      review: testimonial.review,
      rating: testimonial.rating,
      position: testimonial.position || "",
      image: null,
      order: testimonial.order || 0,
      isActive: testimonial.isActive
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('review', formData.review);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch(`/api/testimonials/${editingItem._id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (res.ok) {
        setEditingItem(null);
        setFormData({
          name: "",
          review: "",
          rating: 5,
          position: "",
          image: null,
          order: 0,
          isActive: true
        });
        fetchTestimonials();
        alert('Testimonial updated successfully!');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      alert('Failed to update testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchTestimonials();
        fetchPendingReviews();
        alert('Testimonial deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"} />
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Testimonial Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "active"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Active Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "pending"
              ? "border-b-2 border-amber-500 text-amber-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position/Title</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., Happy Customer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Review *</label>
            <textarea
              name="review"
              value={formData.review}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Write the customer review..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">Active (show on website)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer Image *</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2"
            />
            {editingItem && !formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Current image:</p>
                <Image
                  src={editingItem.imageUrl}
                  alt={editingItem.name}
                  width={50}
                  height={50}
                  className="rounded-full mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    name: "",
                    review: "",
                    rating: 5,
                    position: "",
                    image: null,
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

      {/* Active Testimonials List */}
      {activeTab === "active" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Testimonials ({testimonials.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <FaUser className="text-2xl text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                        {testimonial.position && (
                          <p className="text-sm text-gray-500">{testimonial.position}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{testimonial.review}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-400">Order: {testimonial.order || 0}</span>
                        {testimonial.submittedBy === 'customer' && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            Customer Review
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Reviews List */}
      {activeTab === "pending" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-amber-600">Pending Reviews ({pendingReviews.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingReviews.map((review) => (
              <div key={review._id} className="border border-amber-200 bg-amber-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-2xl text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{review.name}</h3>
                        {review.position && (
                          <p className="text-sm text-gray-500">{review.position}</p>
                        )}
                        {review.email && (
                          <p className="text-xs text-gray-400">{review.email}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{review.review}</p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => handleApprove(review._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
                      >
                        <FaUserCheck className="text-xs" /> Approve
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pendingReviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">No pending reviews.</p>
          )}
        </div>
      )}
    </div>
  );
}