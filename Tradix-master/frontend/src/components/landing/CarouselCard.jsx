import React from "react";
import { motion } from "framer-motion";

export default function CarousalCard() {
  return (
    <div className="w-[320px] h-[250px] md:w-[370px] flex flex-col items-center bg-[#0B0B0B] rounded-lg border border-gray-800 mx-6 px-6 shadow-lg">
      <motion.p
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mt-6 w-[90%] text-sm text-gray-400 text-center"
      >
        “Tradix has completely changed the way I track my trades. Easy to use,
        beautiful UI, and all the features I need to refine my edge.”
      </motion.p>

      <div className="flex items-center justify-center w-[90%] mt-4">
        <div className="flex items-center gap-2">
          <img src="/vercel.png" width={30} height={30} className="rounded-lg" alt="Vercel Logo" />
          <img src="/vercel_owner.png" width={30} height={30} className="rounded-lg" alt="Vercel Owner" />
        </div>
        <div className="flex flex-col ml-4">
          <p className="text-white font-semibold">Ty-Sharp</p>
          <p className="text-xs text-gray-400">Co-founder of VBercel</p>
        </div>
      </div>
    </div>
  );
}
