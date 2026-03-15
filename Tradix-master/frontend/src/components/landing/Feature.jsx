import React, { Suspense } from "react";
import { motion } from "framer-motion";

const ButtonGroup = React.lazy(() =>
  import("components/common/buttons/ButtonGroup")
);

export default function Features() {
  return (
    <motion.section
      className="flex-col-reverse lg:flex-row max-w-7xl items-center my-24 md:p-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Replaced video with img */}
      <motion.img
        src="/feature.jpeg"
        alt="Feature visual"
        className="md:w-[190px] md:h-[190px] w-[120px] h-[120px] object-cover mx-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />

      <motion.h3
        className="text-5xl w-[60%] mx-auto text-[#EDEDED] my-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Everything in your control
      </motion.h3>

      <motion.p
        className="text-center w-[60%] text-sm md:text-base mx-auto text-[#90959A]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        All the features you need to manage your Trading, access detailed
        logs, maintain editorial trust, and keep your journal site reliable –
        with zero friction.
      </motion.p>

      <Suspense
        fallback={
          <p className="text-center text-gray-400 mt-4">Loading buttons...</p>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ButtonGroup />
        </motion.div>
      </Suspense>
    </motion.section>
  );
}
