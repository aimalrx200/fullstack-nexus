// apps/nexus-commerce/frontend/src/components/common/PageTransition.jsx

import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
