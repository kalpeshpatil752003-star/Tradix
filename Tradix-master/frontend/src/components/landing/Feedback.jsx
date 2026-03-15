import React from "react";
import Carousal from "./Carousel"; // Adjust the path if needed
import { motion } from "framer-motion";

export default function Feedbacks() {
  return (
    <section className="flex flex-col items-center gap-6 max-w-7xl mx-auto overflow-hidden px-4 md:px-8 py-12">
      <motion.h3
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-3xl md:text-4xl font-semibold text-center text-[#EDEDED]"
      >
        Beyond expectations
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="text-center text-sm md:text-base text-[#90959A] max-w-2xl"
      >
        Tradix is driving remarkable trading experiences that enable consistent growth for traders of all levels.
      </motion.p>

      <Carousal />
    </section>
  );
}
