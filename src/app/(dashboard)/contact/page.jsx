// src/app/contact/page.js
"use client";

import { useState, useEffect } from "react";
import { FaPhoneAlt } from "react-icons/fa";

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contact');
        const data = await res.json();
        setContacts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen py-16 px-4 flex flex-col items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4 flex flex-col items-center">

      {/* BIG TITLE */}
      <h1 className="text-5xl font-bold text-red-600 mb-12 tracking-wider">
        CONTACT US
      </h1>

      <div className="max-w-3xl w-full space-y-10">
        {contacts.map((contact) => (
          <div key={contact._id}>
            <h2 className="text-2xl font-semibold text-red-600 mb-2 text-center">
              {contact.shopName}
            </h2>
            {contact.address.map((line, idx) => (
              <p key={idx} className="text-center">{line}</p>
            ))}
            {contact.phone && (
              <p className="flex justify-center items-center gap-2 mt-2">
                <FaPhoneAlt /> {contact.phone}
              </p>
            )}
          </div>
        ))}

        {/* Fallback if no contacts in database */}
        {contacts.length === 0 && (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-2 text-center">
                The Gruham Foods Shop - Periyar Nagar
              </h2>
              <p className="text-center">103, Periyar Nagar,</p>
              <p className="text-center">Erode,</p>
              <p className="flex justify-center items-center gap-2 mt-2">
                <FaPhoneAlt /> 0424 4030204
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-2 text-center">
                The Gruham Foods Shop - Kollampalayam
              </h2>
              <p className="text-center">A K Square 95/1 Gandhiji Street,</p>
              <p className="text-center">Karur Bypass Rd, Kollampalayam,</p>
              <p className="text-center">Erode.</p>
              <p className="flex justify-center items-center gap-2 mt-2">
                <FaPhoneAlt /> 0424 2902457
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-2 text-center">
                The Gruham Foods Shop - Perundurai Road
              </h2>
              <p className="text-center">G T Square, 41, Perundurai Rd</p>
              <p className="text-center">Erode.</p>
              <p className="flex justify-center items-center gap-2 mt-2">
                <FaPhoneAlt /> 0424 3555607
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-2 text-center">
                The Gruham Foods Shop - Tiruchengode
              </h2>
              <p className="text-center">5/7, Kokkarayanpettai Road,</p>
              <p className="text-center">
                Valaraigate, Opp to Kathir Eye Hospital,
              </p>
              <p className="text-center">Tiruchengode.</p>
            </div>
          </>
        )}
      </div>

    </div>
  );
}