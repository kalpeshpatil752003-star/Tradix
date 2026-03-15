import Footer from "components/landing/Footer";
import Navbar from "components/landing/Navbar";
import React from "react";

const Cookies = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white px-6 md:px-12 py-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="max-w-4xl w-full mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-blue-600 text-center mb-12">
            Cookie Policy
          </h1>

          {/* Other Sections (left aligned) */}
          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              What are Cookies
            </h2>
            <p className="mb-6 leading-relaxed text-white/55">
              <strong>Cookies</strong> are small data files that may include an anonymous unique identifier. 
              They are sent to your browser by a website and stored on your device.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              How We Use Cookies
            </h2>
            <p className="mb-6 leading-relaxed text-white/55">
              At Resend, we use cookies and similar technologies (like local storage) to monitor activity on our service and store certain types of information.
            </p>

            <p className="mb-6 leading-relaxed text-white/55">
              We categorize cookies into two types:
            </p>

            <ul className="list-disc list-inside mb-6 space-y-2 text-white/55">
              <li><strong className="text-white">Essential Cookies:</strong> Necessary for basic website or application functionality.</li>
              <li><strong className="text-white">Marketing Cookies:</strong> Used to identify users and collect behavioral data.</li>
            </ul>

            <p className="mb-6 font-semibold text-white/55">
              Note: Resend only uses <span className="text-blue-600">essential cookies</span>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Cookies We Set
            </h2>
            <p className="mb-6 leading-relaxed text-white/55">
              When you log in, we use cookies provided by <strong>Supabase</strong> to maintain your session. 
              These cookies keep you signed in as you navigate through pages. Once you log out, these cookies are removed or invalidated to restrict access to authenticated features.
            </p>
            <p className="mb-6 leading-relaxed text-white/55">
              For more information, refer to the{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Supabase Privacy Policy
              </a>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Third-Party Cookies
            </h2>
            <p className="mb-6 leading-relaxed text-white/55">
              We use <strong>Stripe</strong>, a third-party payment service, to securely process payments and prevent fraud.
            </p>
            <p className="leading-relaxed text-white/55">
              For more information, refer to the{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Stripe Privacy Policy
              </a>.
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Cookies;
