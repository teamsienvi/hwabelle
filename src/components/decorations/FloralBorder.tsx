import { memo } from "react";
import { Petal, Leaf, RosePetal, CallaLily, HydrangeaPetal, Daisy } from "./PetalShapes";

interface FloralBorderProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "all";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CornerCluster = memo(({ 
  position, 
  size = "md" 
}: { 
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size: "sm" | "md" | "lg";
}) => {
  const sizeMultiplier = size === "sm" ? 0.6 : size === "lg" ? 1.3 : 1;
  
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  const rotations = {
    "top-left": "rotate-0",
    "top-right": "rotate-90",
    "bottom-left": "-rotate-90",
    "bottom-right": "rotate-180",
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} pointer-events-none z-10`}
      style={{
        width: 120 * sizeMultiplier,
        height: 120 * sizeMultiplier,
      }}
    >
      <div className={`relative w-full h-full ${rotations[position]}`}>
        {/* Main arrangement */}
        <div className="absolute top-2 left-2" style={{ transform: "rotate(-15deg)" }}>
          <CallaLily size={28 * sizeMultiplier} color="hsl(var(--petal-pale))" />
        </div>
        <div className="absolute top-8 left-12" style={{ transform: "rotate(25deg)" }}>
          <RosePetal size={20 * sizeMultiplier} color="hsl(var(--petal-pink))" />
        </div>
        <div className="absolute top-4 left-20" style={{ transform: "rotate(-30deg)" }}>
          <Petal size={16 * sizeMultiplier} color="hsl(var(--petal-blush))" />
        </div>
        <div className="absolute top-16 left-4" style={{ transform: "rotate(45deg)" }}>
          <Leaf size={22 * sizeMultiplier} color="hsl(var(--petal-sage))" />
        </div>
        <div className="absolute top-12 left-16" style={{ transform: "rotate(-10deg)" }}>
          <HydrangeaPetal size={14 * sizeMultiplier} color="hsl(var(--petal-lavender))" />
        </div>
        <div className="absolute top-20 left-10" style={{ transform: "rotate(20deg)" }}>
          <Daisy size={12 * sizeMultiplier} color="hsl(var(--petal-yellow))" />
        </div>
        {/* Additional small accents */}
        <div className="absolute top-6 left-6" style={{ transform: "rotate(60deg)" }}>
          <HydrangeaPetal size={10 * sizeMultiplier} color="hsl(var(--petal-lavender))" />
        </div>
        <div className="absolute top-14 left-20" style={{ transform: "rotate(-45deg)" }}>
          <Leaf size={16 * sizeMultiplier} color="hsl(var(--petal-sage))" />
        </div>
      </div>
    </div>
  );
});
CornerCluster.displayName = "CornerCluster";

const FloralBorder = ({ position = "all", size = "md", className = "" }: FloralBorderProps) => {
  const positions: Array<"top-left" | "top-right" | "bottom-left" | "bottom-right"> = 
    position === "all" 
      ? ["top-left", "top-right", "bottom-left", "bottom-right"]
      : [position];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {positions.map((pos) => (
        <CornerCluster key={pos} position={pos} size={size} />
      ))}
    </div>
  );
};

export default memo(FloralBorder);
