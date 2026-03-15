import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import GetStartedButton from "components/common/buttons/GetStarted";

export default function GetStartedBanner() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col md:flex-row justify-between items-start w-full max-w-7xl mx-auto px-6 py-12 md:p-20 rounded-2xl bg-black shadow-[0_1px_200px_#4c23ff1a] overflow-hidden mb-20"
    >
      {/* Left Content */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col justify-start items-stretch w-full md:w-1/2 max-w-[700px]"
      >
        <div className="mb-4 md:mb-6">
          <h2 className="text-3xl sm:text-4xl md:text-[56px] leading-tight md:leading-[64px] font-extrabold text-white tracking-[0]">
            Ready to level up<br />
            <span className="bg-gradient-to-r from-red to-green bg-clip-text text-transparent">
              your trading?
            </span>
          </h2>
        </div>

        <div className="mb-8 md:mb-12">
          <p className="text-base leading-6 text-gray-300">
            The one tool that lets you do everything you need to improve your
            trading strategy. Get started today.
          </p>
        </div>

        <div className="flex justify-center md:justify-start w-full">
          <Link to="/auth/signup" className="inline-block">
            <GetStartedButton className="bg-white text-black rounded-lg px-6 md:px-40 py-3 md:py-4 font-semibold text-base md:text-lg gap-1 hover:bg-white/20 transition duration-300 ease-in-out">
              Get Started
            </GetStartedButton>
          </Link>
        </div>
      </motion.div>

      {/* Image Section with Animation */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        className="hidden md:block absolute inset-y-0 -right-[25%] max-w-[70%]"
      >
        <div className="transform -rotate-[20deg] w-full h-auto">
          <img
            src="/pic1.png"
            loading="lazy"
            alt="Visual representation of analytics dashboard for traders"
            className="w-full h-auto"
          />
        </div>
      </motion.div>
    </section>
  );
}
