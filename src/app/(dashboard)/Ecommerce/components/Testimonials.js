"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar, FaTruck, FaShieldAlt, FaUser, FaEnvelope, FaComment } from "react-icons/fa";
import { BsPatchCheckFill } from "react-icons/bs";
import { MdSupportAgent } from "react-icons/md";
import { toast } from "react-toastify";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    review: "",
    rating: 5,
    position: ""
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.review) {
      toast.error("Please enter your name and review");
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        name: formData.name,
        email: formData.email,
        review: formData.review,
        rating: formData.rating,
        position: formData.position || "Customer"
      };

      const res = await fetch('/api/testimonials/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Thank you for your review! It will be displayed after admin approval.");
        setFormData({
          name: "",
          email: "",
          review: "",
          rating: 5,
          position: ""
        });
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onClick = null, onHover = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''} ${
            i <= (interactive ? hoverRating || rating : rating) 
              ? "text-yellow-500" 
              : "text-gray-300"
          }`}
          onClick={() => interactive && onClick && onClick(i)}
          onMouseEnter={() => interactive && onHover && onHover(i)}
          onMouseLeave={() => interactive && onHover && onHover(0)}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-20">
        <div className="w-full px-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* TESTIMONIAL SECTION */}
      <section className="bg-gray-100 py-20">
        <div className="w-full px-12">
          <h2 className="text-4xl font-bold text-center mb-16">
            Customer Testimonials
          </h2>

          {/* Write a Review Button */}
          <div className="text-center mb-10">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-[#5c5f2a] text-white rounded-full font-semibold hover:bg-[#4a4d20] transition shadow-md"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {/* Review Form */}
          {showForm && (
            <div className="max-w-2xl mx-auto mb-12 bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-center mb-6">Share Your Experience</h3>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#5c5f2a] focus:ring-1 focus:ring-[#5c5f2a] outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#5c5f2a] focus:ring-1 focus:ring-[#5c5f2a] outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position/Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5c5f2a] focus:ring-1 focus:ring-[#5c5f2a] outline-none"
                    placeholder="e.g., Happy Customer, Food Lover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {renderStars(formData.rating, true, handleRatingClick, setHoverRating)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review *
                  </label>
                  <div className="relative">
                    <FaComment className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="review"
                      value={formData.review}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#5c5f2a] focus:ring-1 focus:ring-[#5c5f2a] outline-none"
                      placeholder="Share your experience with our products..."
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  <p className="font-semibold">Note:</p>
                  <p>Your review will be visible after admin approval. This helps us maintain quality.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#5c5f2a] text-white rounded-full font-semibold hover:bg-[#4a4d20] transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Testimonials Display */}
          {testimonials.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No testimonials available yet. Be the first to write a review!
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {testimonials.map((item, index) => (
                <div
                  key={item._id || index}
                  className="bg-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-[70px] h-[70px]">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-[70px] h-[70px] rounded-full bg-gray-300 flex items-center justify-center">
                          <FaUser className="text-3xl text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      {item.position && (
                        <p className="text-sm text-gray-500">{item.position}</p>
                      )}
                      <div className="flex gap-1 mt-1">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-7 text-lg">
                    {item.review}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="bg-gray-100 py-14">
        <div className="w-full px-12">
          <div className="grid md:grid-cols-4 text-center">
            <div className="flex flex-col items-center gap-3 md:border-r border-gray-300">
              <FaTruck className="text-3xl text-orange-500" />
              <h3 className="font-semibold text-lg">Free Shipping</h3>
              <p className="text-gray-600 text-sm">Orders above ₹200</p>
            </div>

            <div className="flex flex-col items-center gap-3 md:border-r border-gray-300">
              <BsPatchCheckFill className="text-3xl text-yellow-500" />
              <h3 className="font-semibold text-lg">Best Price</h3>
              <p className="text-gray-600 text-sm">Guaranteed deals</p>
            </div>

            <div className="flex flex-col items-center gap-3 md:border-r border-gray-300">
              <MdSupportAgent className="text-3xl text-pink-500" />
              <h3 className="font-semibold text-lg">Premium Support</h3>
              <p className="text-gray-600 text-sm">Phone and email support</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <FaShieldAlt className="text-3xl text-green-500" />
              <h3 className="font-semibold text-lg">Secure Payments</h3>
              <p className="text-gray-600 text-sm">Secured by best tech</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}