// src/app/terms-conditions/page.js
"use client";

import { useState, useEffect } from "react";

export default function TermsAndConditionsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/terms-conditions');
        const data = await res.json();
        setSections(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching terms & conditions:', error);
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Render section based on type
  const renderSection = (section) => {
    if (section.type === 'heading') {
      return (
        <div key={section._id}>
          <h2 className="text-xl font-semibold text-[#1f1f1f]">
            {section.section}
          </h2>
        </div>
      );
    } else if (section.type === 'list') {
      return (
        <div key={section._id}>
          <h2 className="text-xl font-semibold text-[#1f1f1f]">
            {section.section}
          </h2>
          <ul className="list-disc space-y-2 pl-6 mt-2">
            {section.listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      return (
        <div key={section._id}>
          <h2 className="text-xl font-semibold text-[#1f1f1f]">
            {section.section}
          </h2>
          <p className="mt-2">{section.content}</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1ea] px-4 py-12 sm:px-8 lg:px-20 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-4 py-12 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <h1 className="mb-6 text-3xl font-bold text-[#1f1f1f]">
          Terms & Conditions
        </h1>

        <div className="space-y-5 text-[16px] leading-8 text-gray-700">
          {sections.length > 0 ? (
            sections.map((section) => renderSection(section))
          ) : (
            // Fallback content if database is empty
            <>
              <p>
                Welcome to Gruham. By using our website, you agree to the following
                terms and conditions.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Use of Website
              </h2>
              <p>
                You agree to use this website only for lawful purposes and in a way
                that does not harm the website, its users, or its services.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Product Information
              </h2>
              <p>
                We try to ensure that all product descriptions, pricing, and images
                are accurate. However, minor errors may occur and we reserve the
                right to correct them at any time.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Orders
              </h2>
              <p>
                All orders placed through the website are subject to availability
                and confirmation. We reserve the right to refuse or cancel any order
                if required.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Pricing & Payment
              </h2>
              <p>
                All prices are listed in applicable currency and are subject to
                change without prior notice. Payment must be completed before order
                processing.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Shipping & Delivery
              </h2>
              <p>
                Delivery timelines are estimated and may vary depending on location,
                courier service, or other external factors.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Intellectual Property
              </h2>
              <p>
                All website content including logo, text, images, graphics, and
                design belongs to Gruham and may not be used without permission.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Limitation of Liability
              </h2>
              <p>
                Gruham will not be responsible for indirect or incidental damages
                arising from the use of our website or products, except where
                required by law.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Changes to Terms
              </h2>
              <p>
                We may update these terms from time to time. Continued use of the
                website means you accept the updated terms.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}