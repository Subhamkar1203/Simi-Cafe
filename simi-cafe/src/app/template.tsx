"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98, y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 w-full"
    >
      {children}
    </motion.div>
  );
}
