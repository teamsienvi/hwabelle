import { useEffect, useState, memo } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { PetalComponents, petalColors } from "@/components/decorations/PetalShapes";

interface BurstPetal {
  id: number;
  Component: typeof PetalComponents[number];
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
}

const BURST_COUNT = 12;

const generateBurstPetals = (): BurstPetal[] =>
  Array.from({ length: BURST_COUNT }, (_, i) => ({
    id: i,
    Component: PetalComponents[Math.floor(Math.random() * PetalComponents.length)],
    angle: (i / BURST_COUNT) * 360 + (Math.random() - 0.5) * 30,
    distance: 80 + Math.random() * 120,
    size: 12 + Math.random() * 12,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    delay: i * 0.03,
    rotation: Math.random() * 360,
  }));

interface FlowerBurstProps {
  className?: string;
  originX?: "left" | "center" | "right";
  originY?: "top" | "center" | "bottom";
}

const FlowerBurst = ({ 
  className = "", 
  originX = "center", 
  originY = "center" 
}: FlowerBurstProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [petals] = useState(generateBurstPetals);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [isInView, hasTriggered]);

  const getOriginPosition = () => {
    let x = "50%";
    let y = "50%";
    
    if (originX === "left") x = "10%";
    if (originX === "right") x = "90%";
    if (originY === "top") y = "10%";
    if (originY === "bottom") y = "90%";
    
    return { x, y };
  };

  const origin = getOriginPosition();

  if (shouldReduceMotion) return <div ref={ref} className={className} />;

  return (
    <div 
      ref={ref} 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {hasTriggered && petals.map((petal) => {
        const { Component, angle, distance, size, color, delay, rotation } = petal;
        const radians = (angle * Math.PI) / 180;
        const endX = Math.cos(radians) * distance;
        const endY = Math.sin(radians) * distance;

        return (
          <motion.div
            key={petal.id}
            className="absolute pointer-events-none"
            style={{ 
              left: origin.x, 
              top: origin.y,
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
              opacity: [0, 0.8, 0.6, 0], 
              scale: [0, 1.2, 1, 0.8],
              rotate: rotation,
            }}
            transition={{
              duration: 2,
              delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <Component size={size} color={color} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default memo(FlowerBurst);
