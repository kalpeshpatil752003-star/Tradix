import Footer from "components/landing/Footer";
import Navbar from "components/landing/Navbar";
import React from "react";

const Privacy = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white px-6 md:px-12 py-20 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-white/90">
            Privacy Policy
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 mt-16 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-white">
           1. Introduction
          </h2>


          <p className="mb-6 text-white/55 leading-relaxed">
            This privacy notice discloses the privacy practices for Tradix LLC.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            Tradix (“us”, “we”, or “our”) operates the www.tradix.com website.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            This privacy notice applies solely to information collected by this website. It will notify you of the following:
          </p>

          <ul className="list-decimal list-inside mb-6 text-white/55 space-y-2">
            <li>What personally identifiable information is collected from you through the website, how it is used, and with whom it may be shared.</li>
            <li>What choices are available to you regarding the use of your data.</li>
            <li>The security procedures in place to protect against the misuse of your information.</li>
            <li>How you can correct any inaccuracies in the information.</li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 mt-16 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-white">
           2. Information Collection, Use, and Sharing
          </h2>

          <p className="mb-6 text-white/55 leading-relaxed">
            We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us when using the site. We will not sell or rent this information to anyone.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            We use your information to provide the services of the site. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request. Specifically:
          </p>

          <ul className="list-disc list-inside mb-6 text-white/55 space-y-2">
            <li>If you explicitly share a trade publicly, certain information about your trade will be made available on the site. (You can see examples by looking at other shared trades on the site). If you do not wish this information to be public, please do not share trades.</li>
          </ul>

          <p className="mb-6 text-white/55 leading-relaxed">
            Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            We collect statistical information on web traffic using a third-party web analytics service; this may use a cookie on your computer, but no user-identifiable information is ever shared with this third party other than typical web analytics such as IP address, browser, etc.
          </p>

          <p className="mb-6 text-white/55 leading-relaxed">
            In no event will your individual data be made available to anyone, nor will any personally identifiable information be made available or associated with any of the data.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Privacy;
