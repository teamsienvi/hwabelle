import { useEffect, useState, memo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PetalComponents, petalColors } from "@/components/decorations/PetalShapes";

interface BurstPetal {
  id: string;
  Component: typeof PetalComponents[number];
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
  x: number;
  y: number;
}

const BURST_COUNT = 8;
const THROTTLE_MS = 800; // Minimum time between bursts

const generateBurstPetals = (centerX: number, centerY: number): BurstPetal[] =>
  Array.from({ length: BURST_COUNT }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    Component: PetalComponents[Math.floor(Math.random() * PetalComponents.length)],
    angle: (i / BURST_COUNT) * 360 + (Math.random() - 0.5) * 40,
    distance: 60 + Math.random() * 100,
    size: 10 + Math.random() * 14,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    delay: i * 0.02,
    rotation: Math.random() * 360,
    x: centerX,
    y: centerY,
  }));

const ScrollFlowerBurst = () => {
  const shouldReduceMotion = useReducedMotion();
  const [bursts, setBursts] = useState<BurstPetal[][]>([]);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime < THROTTLE_MS) return;
    
    setLastScrollTime(now);
    
    // Random position on screen
    const x = Math.random() * window.innerWidth;
    const y = window.scrollY + Math.random() * window.innerHeight;
    
    const newBurst = generateBurstPetals(x, y);
    setBursts(prev => [...prev.slice(-3), newBurst]); // Keep only last 4 bursts
    
    // Clean up after animation
    setTimeout(() => {
      setBursts(prev => prev.slice(1));
    }, 2500);
  }, [lastScrollTime]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {bursts.flat().map((petal) => {
          const { Component, angle, distance, size, color, delay, rotation, x, y, id } = petal;
          const radians = (angle * Math.PI) / 180;
          const endX = Math.cos(radians) * distance;
          const endY = Math.sin(radians) * distance;

          return (
            <motion.div
              key={id}
              className="absolute pointer-events-none"
              style={{ 
                left: x, 
                top: y,
                translateX: "-50%",
                translateY: "-50%",
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0, 
                scale: 0,
                rotate: 0,
              }}
              animate={{ 
                x: endX, 
                y: endY, 
                opacity: [0, 0.7, 0.5, 0], 
                scale: [0, 1.1, 0.9, 0.6],
                rotate: rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Component size={size} color={color} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default memo(ScrollFlowerBurst);
