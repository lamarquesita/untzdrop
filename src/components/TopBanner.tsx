"use client";

import { motion } from "framer-motion";
import { springs } from "@/lib/animations";

export default function TopBanner() {
  return (
    <motion.div
      className="text-center py-2 px-2 text-[11px] text-muted border-b border-border-subtle font-[family-name:var(--font-chakra)]"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.smooth}
    >
      Los precios los fija cada vendedor y pueden variar del valor original.
    </motion.div>
  );
}
