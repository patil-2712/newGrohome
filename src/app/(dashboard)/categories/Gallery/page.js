"use client";

import Image from "next/image";

const galleryImages = [
  { id: 1, src: "/ladoo.jpg", alt: " Special ladoos For you" },
  { id: 2, src: "/specialladoo.jpg", alt: "Dink Ladoo / Gondh Ladoo / Edible Gum Ladoo" },
  { id: 3, src: "/basmati.jpg", alt: " Basmati Rice" },
  { id: 4, src: "/elaichishrikhand.jpg", alt: "Shrikhand" },
  { id: 5, src: "/burfi.jpg", alt: "Special Burfi" },
  { id: 6, src: "/kharvas2.jpg", alt: "Fresh Kharavas" },
  { id: 7, src: "/besanflour.jpg", alt: " Freshly Milled Flours" },
  { id: 8, src: "/kachori.jpg", alt: "Fresh Kachori Food" },

];

export default function GalleryPage() {
  return (
    <div className="px-6 md:px-16 py-14 bg-[#fafafa] min-h-screen">

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-12">
        Our Food Gallery
      </h1>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

        {galleryImages.map((image) => (
          <div
            key={image.id}
            className="relative h-72 rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
          >

            {/* Image */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition duration-500 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
              <p className="text-white text-lg font-semibold tracking-wide">
                {image.alt}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}