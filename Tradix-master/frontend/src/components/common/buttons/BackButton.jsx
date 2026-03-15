import React from 'react';
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Optional: use any icon library or keep using '<'

const BackButton = () => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <Link to="/">
        <span className="flex items-center gap-1 lg:gap-2 justify-center h-10 px-4 rounded-full font-semibold text-sm select-none text-[#f1f7feb5] bg-slate-1 border-slate-1 hover:border hover:bg-slate-1 hover:text-white hover:border-slate-500 focus-visible:ring-4 focus-visible:ring-slate-7 focus-visible:outline-none focus-visible:bg-slate-6 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-slate-1 transition ease-in-out duration-200">
          {/* You can use the icon or just text */}
          {/* <ArrowLeft className="w-4 h-4" /> */}
          <span className="text-lg font-medium">&lt;</span>
          <span>Home</span>
        </span>
      </Link>
    </div>
  );
};

export default BackButton;
