import React from "react";
import Navbar from "components/landing/Navbar";
import Footer from "components/landing/Footer";

const About = () => {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white min-h-screen px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Heading */}
          <section className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-white/90 bg-clip-text text-transparent">
              About Tradix
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              At Tradix, we're building the future of intelligent trading by
              combining AI, automation, and powerful analytics.
            </p>
          </section>

          {/* Mission Section */}
          <section className="space-y-4 px-4 md:px-8">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-gray-400">
              We aim to democratize access to professional-grade trading tools
              for all traders—regardless of experience. By leveraging
              cutting-edge technology and human-centered design, we make
              advanced backtesting, market insights, and collaboration
              accessible and intuitive.
            </p>
          </section>

          {/* Vision Section */}
          <section className="space-y-4 px-4 md:px-8">
            <h2 className="text-2xl font-semibold">Our Vision</h2>
            <p className="text-gray-400">
              To become the go-to platform for strategic traders by continuing
              to innovate, educate, and empower users with tools that adapt to
              the rapidly evolving markets.
            </p>
          </section>

          {/* Journey Section */}
          <section className="space-y-4 px-4 md:px-8">
            <h2 className="text-2xl font-semibold">Our Journey</h2>
            <p className="text-gray-400">
              Tradix started as a small idea among a team of traders and
              developers frustrated by the lack of modern, flexible backtesting
              platforms. Since then, we’ve grown into a full-fledged platform
              trusted by thousands of traders globally.
            </p>
          </section>

          {/* Our Story Section */}
          <section className="bg-black text-white py-28 px-8 md:px-32 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold mb-12">
              Our story
            </h2>
            <p className="text-base md:text-[1.125rem] md:leading-[1.75] text-slate-400 font-normal mx-auto mt-12 max-w-[640px] tracking-wide text-left md:text-left px-2 md:px-6">
              Tradix started as an{" "}
              <strong className="font-normal text-slate-200">
                open-source
              </strong>{" "}
              project in 2025. We were{" "}
              <strong className="font-normal text-slate-200">driven</strong> by
              the realization that most trading journals were either{" "}
              <strong className="font-normal text-slate-200">
                too expensive
              </strong>{" "}
              or lacked{" "}
              <strong className="font-normal text-slate-200">
                flexibility
              </strong>
              . Traders needed a reliable and customizable way to track their
              performance, analyze data, and grow consistently—without being
              locked behind paywalls.
              <br />
              <br />
              As we connected with more traders, it became clear that the real
              struggle was{" "}
              <strong className="font-normal text-slate-200">
                visibility
              </strong>{" "}
              and{" "}
              <strong className="font-normal text-slate-200">insight</strong>.
              Many platforms offered generic logs, but few allowed in-depth
              metrics, emotional tracking, or strategy refinement. We wanted to
              change that, so we set out to build something truly{" "}
              <strong className="font-normal text-slate-200">
                trader-focused
              </strong>
              .
              <br />
              <br />
              In 2025, we launched the Tradix platform—a{" "}
              <strong className="font-normal text-slate-200">
                free, open-source
              </strong>{" "}
              trading journal built by traders, for traders. With the support of
              our growing community, we’re creating a tool that empowers
              everyone from{" "}
              <strong className="font-normal text-slate-200">
                beginners to pros
              </strong>{" "}
              to understand their trades and improve continuously.
              <br />
              <br />
              We believe in{" "}
              <strong className="font-normal text-slate-200">
                transparency
              </strong>
              , <strong className="font-normal text-slate-200">freedom</strong>,
              and <strong className="font-normal text-slate-200">growth</strong>
              —and we’re excited to build this journey with you.
            </p>
          </section>

          {/* Team Section */}
          {/* Team Section */}
          <section className="mb-40 md:mt-24 px-4">
            <h2 className="font-display text-[2.5rem] tracking-tight leading-tight text-center text-slate-900 dark:text-white">
              The Team behind it
            </h2>
            <p className="text-base md:text-lg text-center text-slate-600 dark:text-slate-400 font-medium mt-4 mb-12 max-w-2xl mx-auto">
              Developing a smart journal for traders
              <br /> to efficiently analyze valuable insights into trading
              patterns
            </p>

            {/* Flex container for two images */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              {/* First Image */}
              <img
                alt="The core team together in a workspace"
                loading="lazy"
                width={400}
                height={400}
                decoding="async"
                className="rounded-xl shadow-md"
                src="sakshi.jpg"
                style={{ color: "transparent" }}
              />

              {/* Second Image */}
              <img
                alt="Another team moment"
                loading="lazy"
                width={370}
                height={370}
                decoding="async"
                className="rounded-xl shadow-md"
                src="Antima.jpg"
                style={{ color: "transparent" }}
              />
            </div>

            {/* Description */}
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-4">
              Meet the founder of Tradix — a visionary leader reshaping the
              future of trading analytics and journaling.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
