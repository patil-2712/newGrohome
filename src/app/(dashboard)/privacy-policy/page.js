// src/app/privacy-policy/page.js
"use client";

import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch('/api/privacy-policy');
        const data = await res.json();
        setSections(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
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
          Privacy Policy
        </h1>

        <div className="space-y-5 text-[16px] leading-8 text-gray-700">
          {sections.length > 0 ? (
            sections.map((section) => renderSection(section))
          ) : (
            // Fallback content if database is empty
            <>
              <p>
                At Gruham, we value your privacy and are committed to protecting
                your personal information.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Information We Collect
              </h2>
              <p>
                We may collect your name, email address, phone number, shipping
                address, billing details, and order information when you use our
                website.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                How We Use Your Information
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>To process and deliver your orders</li>
                <li>To provide customer support</li>
                <li>To improve our website and services</li>
                <li>To send order updates and important notifications</li>
                <li>To share promotional offers only when allowed</li>
              </ul>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Data Protection
              </h2>
              <p>
                We take reasonable steps to protect your information from
                unauthorized access, misuse, or disclosure.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Sharing of Information
              </h2>
              <p>
                We do not sell or rent your personal information. Your information
                may only be shared with delivery partners, payment providers, or
                service providers when necessary to complete your order or operate
                the website.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Cookies
              </h2>
              <p>
                Our website may use cookies to improve your browsing experience and
                understand website usage patterns.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Your Rights
              </h2>
              <p>
                You may request access, correction, or deletion of your personal
                data by contacting us.
              </p>

              <h2 className="text-xl font-semibold text-[#1f1f1f]">
                Contact
              </h2>
              <p>
                For any privacy-related questions, please contact us through the
                Contact Us page.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}