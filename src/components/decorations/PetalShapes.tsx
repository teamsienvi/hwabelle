import { memo } from "react";

interface PetalProps {
  className?: string;
  color?: string;
  size?: number;
}

// Simple rounded petal shape
export const Petal = memo(({ className = "", color = "hsl(var(--petal-pink))", size = 20 }: PetalProps) => (
  <svg
    width={size}
    height={size * 1.4}
    viewBox="0 0 20 28"
    fill="none"
    className={className}
  >
    <path
      d="M10 0C10 0 0 8 0 16C0 22.627 4.477 28 10 28C15.523 28 20 22.627 20 16C20 8 10 0 10 0Z"
      fill={color}
      fillOpacity={0.6}
    />
  </svg>
));
Petal.displayName = "Petal";

// Leaf shape
export const Leaf = memo(({ className = "", color = "hsl(var(--petal-sage))", size = 24 }: PetalProps) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 24 12"
    fill="none"
    className={className}
  >
    <path
      d="M0 6C0 6 4 0 12 0C20 0 24 6 24 6C24 6 20 12 12 12C4 12 0 6 0 6Z"
      fill={color}
      fillOpacity={0.5}
    />
  </svg>
));
Leaf.displayName = "Leaf";

// Small daisy flower
export const Daisy = memo(({ className = "", color = "hsl(var(--petal-yellow))", size = 16 }: PetalProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <circle cx="8" cy="8" r="2.5" fill="hsl(var(--petal-yellow))" fillOpacity={0.8} />
    <ellipse cx="8" cy="2" rx="2" ry="2.5" fill={color} fillOpacity={0.5} />
    <ellipse cx="8" cy="14" rx="2" ry="2.5" fill={color} fillOpacity={0.5} />
    <ellipse cx="2" cy="8" rx="2.5" ry="2" fill={color} fillOpacity={0.5} />
    <ellipse cx="14" cy="8" rx="2.5" ry="2" fill={color} fillOpacity={0.5} />
  </svg>
));
Daisy.displayName = "Daisy";

// Hydrangea petal (small rounded)
export const HydrangeaPetal = memo(({ className = "", color = "hsl(var(--petal-lavender))", size = 12 }: PetalProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    className={className}
  >
    <path
      d="M6 0C2.686 0 0 2.686 0 6C0 9.314 2.686 12 6 12C9.314 12 12 9.314 12 6C12 2.686 9.314 0 6 0ZM6 10C3.791 10 2 8.209 2 6C2 3.791 3.791 2 6 2C8.209 2 10 3.791 10 6C10 8.209 8.209 10 6 10Z"
      fill={color}
      fillOpacity={0.4}
    />
    <circle cx="6" cy="6" r="4" fill={color} fillOpacity={0.5} />
  </svg>
));
HydrangeaPetal.displayName = "HydrangeaPetal";

// Fern frond
export const FernFrond = memo(({ className = "", color = "hsl(var(--petal-sage))", size = 28 }: PetalProps) => (
  <svg
    width={size * 0.4}
    height={size}
    viewBox="0 0 12 28"
    fill="none"
    className={className}
  >
    <path
      d="M6 0L6 28M6 4L2 6M6 4L10 6M6 8L1 11M6 8L11 11M6 12L2 15M6 12L10 15M6 16L1 19M6 16L11 19M6 20L2 23M6 20L10 23M6 24L3 27M6 24L9 27"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity={0.5}
    />
  </svg>
));
FernFrond.displayName = "FernFrond";

// Rose petal (curved)
export const RosePetal = memo(({ className = "", color = "hsl(var(--petal-blush))", size = 18 }: PetalProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M9 0C9 0 18 4 18 10C18 14 14 18 9 18C4 18 0 14 0 10C0 4 9 0 9 0Z"
      fill={color}
      fillOpacity={0.55}
    />
  </svg>
));
RosePetal.displayName = "RosePetal";

// Calla lily petal
export const CallaLily = memo(({ className = "", color = "hsl(var(--petal-pale))", size = 22 }: PetalProps) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 22 29"
    fill="none"
    className={className}
  >
    <path
      d="M11 0C11 0 22 8 22 18C22 24 17 29 11 29C5 29 0 24 0 18C0 8 11 0 11 0Z"
      fill={color}
      fillOpacity={0.45}
    />
    <path
      d="M11 6C11 6 15 11 15 17C15 21 13 24 11 24C9 24 7 21 7 17C7 11 11 6 11 6Z"
      fill={color}
      fillOpacity={0.3}
    />
  </svg>
));
CallaLily.displayName = "CallaLily";

export const petalColors = [
  "hsl(var(--petal-pink))",
  "hsl(var(--petal-lavender))",
  "hsl(var(--petal-sage))",
  "hsl(var(--petal-pale))",
  "hsl(var(--petal-yellow))",
  "hsl(var(--petal-blush))",
];

export const PetalComponents = [Petal, Leaf, Daisy, HydrangeaPetal, RosePetal, CallaLily];
