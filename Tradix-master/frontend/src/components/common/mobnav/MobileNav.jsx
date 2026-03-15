import { Link } from "react-router-dom";
import { RxHamburgerMenu, RxCross1 } from "react-icons/rx";
import { useState } from "react";

export default function MobileNav() {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <div className="md:max-w-7xl mx-auto w-full max-w-5xl px-6 h-[58px] flex md:hidden justify-between items-center">
        <Link to="/" className="lg:w-[180px]">
        <div className="text-2xl font-bold text-white">Tradix</div>
        </Link>

        <div className="gap-4 flex">
          {showNav ? (
            <button
              className="text-[rgb(120,125,129)] hover:text-slate-50 transition ease-in-out duration-150"
              onClick={() => setShowNav(false)}
            >
              <RxCross1 className="text-3xl" />
            </button>
          ) : (
            <button
              className="text-[rgb(120,125,129)] hover:text-slate-50 transition ease-in-out duration-150"
              onClick={() => setShowNav(true)}
            >
              <RxHamburgerMenu className="text-3xl" />
            </button>
          )}
        </div>
      </div>

      {showNav && (
        <div className="bg-black h-auto md:hidden mx-auto py-6 w-full px-4 z-30">
          <div className="flex-col">
            <Link to="/auth/login">
            <button className="text-[rgb(190,193,196)] h-[46px] rounded-md w-full bg-[#1C1E24] transition ease-in-out duration-150 font-bold hover:bg-[#282a2f] border border-[#42444b]">
              Sign in
            </button>
            </Link>
            <Link to="/auth/signup">
            <button className="mt-4 flex items-center justify-center bg-white rounded-md h-[46px] w-full text-gray-800 hover:bg-white/90 transition ease-in-out duration-150">
              <p className="text-sm font-bold">Get Started</p>
            </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
