import GetStartedButton from "components/common/buttons/GetStarted";
import Footer from "components/landing/Footer";
import Navbar from "components/landing/Navbar";
import React, { useState } from "react";

const ContactUs = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white px-6 md:px-12 py-20 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-pink-500 to-violet-500 text-left mb-16">
            Get in touch
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-72">
            {/* Left Column - Contact Form */}
            <form className="space-y-10">
              <div>
                <label htmlFor="email" className="block text-sm text-white/70 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-white/20 bg-black text-white rounded-md px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-white/70 mb-2">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I'd like to know how Resend can help me with…"
                  className="w-full h-32 resize-none border border-white/20 bg-black text-white rounded-md p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                />
              </div>

              <GetStartedButton
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-white text-black border px-6 h-10 font-semibold text-sm hover:bg-white/90 transition focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Submit
              </GetStartedButton>
            </form>

            {/* Right Column - Contact Info */}
            <div className="space-y-10">
              <ContactInfo label="Get help" email="support@tradix.com" />
              <ContactInfo label="Work at Tradix" email="careers@tradix.com" />
              <ContactInfo label="Report security concerns" email="security@tradix.com" />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

function ContactInfo({ label, email }) {
  return (
    <div className="group">
      <p className="text-sm text-white/70 mb-1">{label}</p>
      <div className="flex items-center text-sm text-white">
        <span className="mr-2">{email}</span>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1 p-1 rounded hover:bg-white/10"
          aria-label="Copy email"
          onClick={() => navigator.clipboard.writeText(email)}
        >
          <svg
            fill="none"
            height="20"
            width="20"
            viewBox="0 0 24 24"
            stroke="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 6.75H7.75C6.64543 6.75 5.75 7.64543 5.75 8.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V8.75C18.25 7.64543 17.3546 6.75 16.25 6.75H15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M14 8.25H10C9.44772 8.25 9 7.80228 9 7.25V5.75C9 5.19772 9.44772 4.75 10 4.75H14C14.5523 4.75 15 5.19772 15 5.75V7.25C15 7.80228 14.5523 8.25 14 8.25Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M9.75 12.25H14.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M9.75 15.25H14.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
export default ContactUs;
