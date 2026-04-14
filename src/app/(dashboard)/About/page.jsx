// src/app/about/page.js
"use client";

import { useState, useEffect } from "react";

export default function AboutPage() {
  const [aboutContents, setAboutContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const res = await fetch('/api/about');
        const data = await res.json();
        setAboutContents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching about content:', error);
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Group content by language
  const englishContent = aboutContents.filter(c => c.language === 'en');
  const marathiContent = aboutContents.filter(c => c.language === 'mr');

  return (
    <div className="bg-white min-h-screen">

      {/* Container */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* English Content */}
        {englishContent.length > 0 && (
          <>
            <h1 className="text-4xl font-bold mb-10 text-black">
              {englishContent[0]?.title || "About Us"}
            </h1>
            <div className="space-y-6 text-gray-800 text-lg leading-relaxed">
              {englishContent.map((content) => (
                <div 
                  key={content._id}
                  dangerouslySetInnerHTML={{ __html: content.content }}
                  className="space-y-6"
                />
              ))}
            </div>
          </>
        )}

        {/* Marathi Content */}
        {marathiContent.length > 0 && (
          <div className="mt-10 space-y-6 text-gray-800 text-lg leading-relaxed">
            {marathiContent.map((content) => (
              <div 
                key={content._id}
                dangerouslySetInnerHTML={{ __html: content.content }}
                className="space-y-6"
              />
            ))}
          </div>
        )}

        {/* Fallback if no content in database */}
        {aboutContents.length === 0 && (
          <>
            <h1 className="text-4xl font-bold mb-10 text-black">About Us</h1>
            <div className="space-y-6 text-gray-800 text-lg leading-relaxed">
              <p>
                Gruham is a community-driven initiative by a group of passionate
                women from rural Maharashtra, who are committed to preserving the
                traditional food practices that have been passed down for
                generations.
                <strong>
                  {" "}
                  Our range of natural and unadulterated products includes spices,
                  pickles, chutneys, and ready-to-eat snacks that offer an authentic
                  taste of Maharashtra.
                </strong>{" "}
                We take great care in maintaining the authenticity and purity of
                our products, without using any synthetic or artificial additives.
              </p>

              <p className="font-semibold">
                By supporting Gruham, you not only get high-quality products but
                also contribute to the empowerment of rural women and the
                preservation of traditional food practices.
              </p>
            </div>

            <div className="mt-10 space-y-6 text-gray-800 text-lg leading-relaxed">
              <p>
                गृहाम हा ग्रामीण महाराष्ट्रातील खाद्यसंस्कृतीची आवड असलेल्या
                महिलांच्या गटाचा एक समुदाय-चालित उपक्रम आहे, ज्या पिढ्यानपिढ्या
                चालत आलेल्या पारंपरिक खाद्य पद्धतींचे जतन करण्यासाठी वचनबद्ध
                आहेत. आमच्या नैसर्गिक आणि भेसळविरहित उत्पादनांच्या श्रेणीमध्ये
                मसाले, लोणची, चटण्या आणि महाराष्ट्राची अस्सल चव देणारे तयार
                स्नॅक्स यांचा समावेश आहे. आम्ही कोणत्याही कृत्रिम किंवा कृत्रिम
                पदार्थांचा वापर न करता आमच्या उत्पादनांची सात्विकता आणि शुद्धता
                राखण्यासाठी खूप काळजी घेतो.
              </p>

              <p className="font-semibold">
                गृहामला पाठिंबा देऊन, तुम्हाला केवळ उच्च दर्जाची उत्पादने मिळत
                नाहीत तर ग्रामीण महिलांच्या सक्षमीकरणात आणि पारंपरिक खाद्य
                पद्धतींचे जतन करण्यातही हातभार लागतो.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}