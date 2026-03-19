"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Sparkles, Timer as TimerIcon, User } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/ai", icon: Sparkles, label: "AI", isCenter: true },
  { href: "/timer", icon: TimerIcon, label: "Timer" },
  { href: "/profile", icon: User, label: "Profile" },
];

// Get index of a path in NAV_ITEMS (excluding center)
function getNavIndex(path: string): number {
  const nonCenter = NAV_ITEMS.filter((i) => !i.isCenter);
  const idx = nonCenter.findIndex((i) => i.href === path);
  return idx >= 0 ? idx : 0;
}

export default function LiquidNavBar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);
  const [tappedTab, setTappedTab] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const handleClick = useCallback((href: string) => {
    setTappedTab(href);
    setActiveTab(href);
    setTimeout(() => setTappedTab(null), 500);
  }, []);

  // For the sliding indicator, compute a pixel offset based on nav item index
  const nonCenterItems = useMemo(() => NAV_ITEMS.filter((i) => !i.isCenter), []);
  const activeIndex = useMemo(() => {
    const idx = nonCenterItems.findIndex((i) => i.href === activeTab);
    return idx >= 0 ? idx : -1;
  }, [activeTab, nonCenterItems]);

  // Each nav item slot is 52px wide + 0px gap, center button takes ~60px
  // Layout: [item0 52] [item1 52] [center 60] [item2 52] [item3 52]
  // Pill offset needs to account for center button gap
  const ITEM_WIDTH = 52;
  const CENTER_WIDTH = 60;
  const PAD = 8;

  const pillLeft = useMemo(() => {
    if (activeIndex < 0) return 0;
    if (activeIndex < 2) {
      return PAD + activeIndex * ITEM_WIDTH;
    }
    // After center button
    return PAD + 2 * ITEM_WIDTH + CENTER_WIDTH + (activeIndex - 2) * ITEM_WIDTH;
  }, [activeIndex]);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "max-content",
        maxWidth: "92vw",
        height: "64px",
        background: "rgba(18, 18, 22, 0.45)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "32px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8px",
        gap: "0px",
        zIndex: 100,
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Sliding pill — absolute positioned, uses CSS transition for reliable horizontal slide */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: "absolute",
            left: `${pillLeft}px`,
            top: "8px",
            width: `${ITEM_WIDTH}px`,
            height: "48px",
            background: "rgba(255,255,255,0.10)",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "left 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
            zIndex: 0,
          }}
        />
      )}

      {/* Active dot — also uses CSS transition */}
      {activeIndex >= 0 && (
        <div
          style={{
            position: "absolute",
            left: `${pillLeft + ITEM_WIDTH / 2 - 2}px`,
            bottom: "8px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
            transition: "left 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
            zIndex: 0,
          }}
        />
      )}

      {NAV_ITEMS.map((item) => {
        const isActive =
          activeTab === item.href ||
          (item.href.includes("#") && activeTab === item.href.split("#")[0]);
        const isTapped = tappedTab === item.href;
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleClick(item.href)}
              style={{
                position: "relative",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                margin: "0 6px",
                boxShadow: "0 4px 16px var(--card-active-border)",
                border: "1px solid rgba(255,255,255,0.15)",
                transform: "translateY(-6px)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                zIndex: 1,
              }}
            >
              <Icon size={22} strokeWidth={2.5} />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => handleClick(item.href)}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "48px",
              width: "52px",
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
              textDecoration: "none",
              transition: "color 0.25s ease",
              WebkitTapHighlightColor: "transparent",
              zIndex: 1,
            }}
          >
            {/* Light glow on tap */}
            {isTapped && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 0.6, 0], scale: [0.3, 1.3, 1.5] }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Icon with subtle scale */}
            <motion.div
              style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
              animate={
                isTapped
                  ? { scale: [1, 1.2, 1] }
                  : { scale: 1 }
              }
              transition={
                isTapped
                  ? { duration: 0.3, times: [0, 0.4, 1], ease: "easeOut" }
                  : { duration: 0.15 }
              }
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
