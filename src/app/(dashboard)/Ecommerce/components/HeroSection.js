// src/components/HeroSection.jsx
"use client";

import { useState, useEffect, useRef } from "react";

export default function HeroSection() {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/videos');
        const data = await res.json();
        setVideos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Auto-play next video when current ends
  useEffect(() => {
    if (videoRef.current && videos.length > 1) {
      videoRef.current.addEventListener('ended', () => {
        setCurrent((prev) => (prev + 1) % videos.length);
      });
    }
  }, [videos.length, current]);

  // Reset video player when current changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log('Auto-play prevented:', err));
    }
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (loading) {
    return (
      <section className="w-full bg-gray-100 py-12">
        <div className="text-center py-20">
          <div className="text-gray-500">Loading videos...</div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="w-full bg-gray-100 py-12">
        <div className="text-center py-20">
          <p className="text-gray-500">No videos available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-100 py-12">
      
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Spread the love!!</h1>
        <p className="mt-2 text-lg text-gray-600">
          Love for your Foodies
        </p>
      </div>

      {/* Slider */}
      <div className="relative w-full px-4 md:px-10 lg:px-16">

        {/* FULL WIDTH VIDEO */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-video bg-black">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 h-full w-full"
            controls
            autoPlay
          >
            <source src={videos[current].videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Navigation Buttons - Only show if more than 1 video */}
        {videos.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black px-4 py-2 text-white shadow-md transition z-10"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black px-4 py-2 text-white shadow-md transition z-10"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {videos.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 w-3 rounded-full transition ${
                current === index ? "bg-black" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      )}

    </section>
  );
}