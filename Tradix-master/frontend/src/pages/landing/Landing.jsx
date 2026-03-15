import React, { useEffect, useState } from 'react';
import Feature from 'components/landing/Feature';
import FeatureSection from 'components/landing/FeatureSection';
import Feedbacks from 'components/landing/Feedback';
import Footer from 'components/landing/Footer';
import GetStartedBanner from 'components/landing/GetStartedBanner';
import Hero from 'components/landing/Hero';
import Navbar from 'components/landing/Navbar';
import PreLoader from 'components/preloader/Preloader';

// 🧠 Memory-persistent flag
let hasShownPreloader = false;

const Landing = () => {
  const [loading, setLoading] = useState(!hasShownPreloader);

  useEffect(() => {
    if (!hasShownPreloader) {
      const timer = setTimeout(() => {
        hasShownPreloader = true;
        setLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between bg-black">
        <Hero />
        <div>
          <FeatureSection />
          <Feature />
          <Feedbacks />
          <GetStartedBanner />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

