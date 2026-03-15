import React, { useState, useEffect, useRef } from "react";
import Footer from "components/landing/Footer";
import Navbar from "components/landing/Navbar";

const Blog = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const sliderRef = useRef(null);
  const isHovered = useRef(false);

  const handleSubscribe = () => {
    console.log("Subscribing with:", email);
    setEmail("");
    setShowForm(false);
  };

  // Auto-scroll with pause on hover
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const delay = 20;

    const scroll = () => {
      if (!isHovered.current) {
        scrollAmount += scrollStep;
        if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
          scrollAmount = 0;
        }
        slider.scrollLeft = scrollAmount;
      }
    };

    const interval = setInterval(scroll, delay);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white px-6 md:px-12 py-20 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          {/* Top Section */}
          <div className="w-full flex flex-col items-center justify-between mb-12 mt-2 gap-2 md:flex-row md:gap-0">
            <h2 className="font-display text-[3rem] md:text-[3.5rem] tracking-tight leading-[120%] mb-2 bg-clip-text text-transparent bg-white/90">
              Blog
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center border border-slate-600 bg-black text-white/55 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-slate-700 text-sm h-8 pl-3 pr-3 gap-1 rounded-full"
              >
                <span className="text-[#70757E]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2m6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5z" />
                  </svg>
                </span>
                <span>Subscribe</span>
              </button>

              {showForm && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-black border border-slate-600 rounded-xl shadow-lg p-4 w-64 z-50">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-white/20 bg-black text-white rounded-md focus-visible:ring-2 focus-visible:ring-white/50 placeholder-gray-400"
                    placeholder="you@example.com"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="mt-3 w-full text-sm font-semibold bg-white hover:bg-white/55 text-black py-1.5 rounded-lg transition"
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Blog Card + Text */}
          <section className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
            {/* Card */}
            <div className="relative max-w-md w-full">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full blur-3xl opacity-30 z-0" />
              <div className="bg-black rounded-2xl shadow-xl relative border border-white/20 transition hover:ring-2 hover:ring-white/50">
                <img
                  src="https://images.pexels.com/photos/241544/pexels-photo-241544.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Blog Post"
                  className="w-full h-60 object-cover rounded-t-2xl"
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
                      Trading Education
                    </span>
                    <span className="text-gray-300 text-xs">• Mar 18, 2025</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white leading-snug">
                    TradingView Bar Replay vs. Tradix: <br />
                    Which is Most Accurate for Backtesting?
                  </h3>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="max-w-lg w-full text-center lg:text-left space-y-6">
              <h2 className="text-3xl font-bold leading-snug mb-2">
                News & Insights from <br className="hidden md:block" />
                the Tradix team
              </h2>
              <p className="text-gray-300 text-base">
                Get the latest news and industry insights curated and delivered to your inbox every Friday.
              </p>
              <form className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:w-auto flex-1 px-4 py-3 border border-white/20 bg-black text-white rounded-md focus-visible:ring-2 focus-visible:ring-white/50 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-white/70 text-black font-semibold px-6 py-3 rounded-xl transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Auto-Scrolling Feature Cards */}
      <div className="bg-black text-white px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-white/80 text-transparent bg-clip-text">
            What’s Coming to Tradix
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            We’re actively building the next generation of trading tools. Here’s a preview of what’s launching soon.
          </p>

          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              onMouseEnter={() => (isHovered.current = true)}
              onMouseLeave={() => (isHovered.current = false)}
              className="flex space-x-8 no-scrollbar transition-all duration-300"
              style={{
                overflowX: "auto", // allow scrolling
              }}
                      >
              {[
                {
                  title: "AI Trade Insights",
                  description:
                    "Leverage advanced AI models to receive real-time suggestions based on your trading history.",
                },
                {
                  title: "Multi-Asset Backtesting",
                  description:
                    "Backtest across stocks, forex, crypto, and more—seamlessly and accurately.",
                },
                {
                  title: "Real-Time Analytics",
                  description:
                    "Monitor portfolio performance and market trends with powerful live dashboards.",
                },
                {
                  title: "Strategy Templates",
                  description:
                    "Launch backtests instantly using prebuilt or custom strategy templates.",
                },
                {
                  title: "Team Collaboration",
                  description:
                    "Invite team members to work together on strategies, reports, and dashboards.",
                },
                {
                  title: "Mobile App",
                  description:
                    "Access key features and alerts on the go with our upcoming iOS and Android apps.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 md:w-[22rem] bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-md hover:ring-2 hover:ring-white/20 transition text-left overflow-hidden"
                  >
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-4">
                  {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Blog;
