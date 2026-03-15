import React, { useRef } from "react";
import GetStartedButton from "components/common/buttons/GetStarted";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={heroRef}
      className="flex flex-col-reverse md:flex-row max-w-7xl items-center md:items-start lg:items-center md:p-8 md:mt-10 lg:mt-0"
    >
      {/* Text content */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ ease: [0.17, 0.67, 0.83, 0.67], duration: 0.8 }}
        className="flex-col text-center md:text-left justify-center items-center md:w-[50%] lg:w-auto"
      >
        <h1 className="my-6 text-6xl md:text-7xl text-[#EAEAEA] leading-tight">
          Trade Smarter<br />
          Stay in the 1%
        </h1>
        <p className="my-4 mx-4 md:mx-0 text-[#93989D] text-base md:text-lg">
          Where top traders log, learn, and improve. No fees <br />
          no limits—just pure trading insights
        </p>
        <div className="flex flex-col mt-6 md:flex-row items-center md:items-start justify-center md:justify-start mx-4 md:mx-0">
          <Link to={"/auth/signup"}>
            <GetStartedButton className="h-[46px] px-9 bg-white hover:bg-white/40">
              Get Started
            </GetStartedButton>
          </Link>
          <a href="Tradix_User_Guide.pdf" target="_blank" rel="noopener noreferrer">
            <GetStartedButton className="bg-transparent mt-4 md:mt-0 text-center hover:border hover:text-white text-slate-600 md:ml-4 h-[46px] px-9 text-lg">
              Documentation
            </GetStartedButton>
          </a>
        </div>
      </motion.div>

      {/* Animated Video Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ ease: "easeOut", duration: 1, delay: 0.2 }}
        className="md:ml-10 flex items-center justify-center w-[340px] h-[340px] lg:w-[640px] lg:h-[640px]"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-[70%] h-[70%] object-cover"
        >
          <source src="/herovd.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </section>
  );
}
