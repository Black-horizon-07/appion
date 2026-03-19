"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LiquidNavBar from "@/components/LiquidNavBar";

const NO_NAV_PATHS = ["/", "/ai"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV_PATHS.includes(pathname);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ minHeight: "100dvh", willChange: "opacity" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {showNav && <LiquidNavBar />}
    </>
  );
}
