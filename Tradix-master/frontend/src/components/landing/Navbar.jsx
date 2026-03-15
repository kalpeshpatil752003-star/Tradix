import React from "react";
import { Link, useLocation } from "react-router-dom";
import MobileNav from "components/common/mobnav/MobileNav";
import GetStartedButton from "components/common/buttons/GetStarted";
import { motion } from "framer-motion";
import Logo from "assets/logo/index";

export default function Navbar() {
  const location = useLocation();

  // Add all routes where you want to disable animation
  const noAnimationRoutes = ["/contactus", "/cookie-policy", "/privacy-policy", "/terms-of-service", "/about-us", "/blog", "/auth/login", "/auth/signup"];
  const disableAnimation = noAnimationRoutes.includes(location.pathname);

  const NavContent = (
    <>
      <div className="md:max-w-full lg:max-w-7xl mx-auto w-full px-6 h-[58px] hidden md:flex flex-row justify-between items-center">
        <Link to="/home" className="w-[100px] lg:w-[180px] pt-10 md:pt-0">
          <Logo />
        </Link>
        <div className="gap-4 flex">
          <Link to={"/auth/login"}>
            <span className="outline-none transition duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-slate-7 items-center justify-center select-none rounded-full disabled:cursor-not-allowed disabled:opacity-70 transition ease-in-out duration-200 bg-slate-1 border-slate-1 hover:border text-[#70757E] hover:bg-slate-5 hover:text-white hover:border-slate-500 focus-visible:ring-4 focus-visible:ring-slate-7 focus-visible:outline-none focus-visible:bg-slate-6 disabled:hover:bg-slate-1 text-sm h-10 gap-0 px-4 font-semibold hidden lg:flex">
              Sign In
            </span>
          </Link>
          <Link to={"/auth/signup"}>
            <GetStartedButton className="ml-4 bg-white text-black w-fit hover:bg-white/40">
              Get Started
            </GetStartedButton>
          </Link>
        </div>
      </div>
      <MobileNav />
    </>
  );

  return disableAnimation ? (
    <nav className="pt-2 w-full z-30 sticky top-0 bg-black text-white border-b border-white/10">
      {NavContent}
    </nav>
  ) : (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ ease: [0.17, 0.67, 0.83, 0.67], duration: 0.8 }}
      className="pt-2 w-full z-30 sticky top-0 bg-black text-white border-b border-white/10"
    >
      {NavContent}
    </motion.nav>
  );
}
