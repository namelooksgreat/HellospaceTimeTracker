// Animation tokens for consistent animations across the application

export const transitionDurations = {
  // Standard transition durations
  fast: "150ms",
  medium: "300ms",
  slow: "500ms",
  slower: "700ms",
  slowest: "1000ms",
};

export const transitionEasings = {
  // Standard transition easings
  default: "cubic-bezier(0.4, 0, 0.2, 1)", // ease
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)", // ease-in
  out: "cubic-bezier(0, 0, 0.2, 1)", // ease-out
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)", // ease-in-out
  // Custom easings
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Bouncy spring
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // More pronounced bounce
  gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Gentle ease
};

export const hoverEffects = {
  // Standard hover effects
  subtle: "hover:brightness-105 hover:scale-[1.01] transition-all",
  scale: "hover:scale-[1.02] transition-transform",
  lift: "hover:-translate-y-0.5 transition-transform",
  glow: "hover:shadow-md hover:shadow-primary/10 transition-shadow",
  highlight: "hover:bg-accent/10 transition-colors",
  border: "hover:border-primary/50 transition-colors",
  opacity: "hover:opacity-90 transition-opacity",
  // Combined effects
  button:
    "hover:brightness-105 hover:scale-[1.01] hover:shadow-sm transition-all",
  card: "hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 transition-all",
  link: "hover:text-primary hover:underline transition-all",
};

export const animationKeyframes = {
  // Standard animation keyframes
  fadeIn: "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }",
  fadeOut: "@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }",
  slideInUp:
    "@keyframes slideInUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
  slideInDown:
    "@keyframes slideInDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
  slideInLeft:
    "@keyframes slideInLeft { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }",
  slideInRight:
    "@keyframes slideInRight { from { transform: translateX(10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }",
  pulse: "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }",
  spin: "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
  bounce:
    "@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }",
};

export const animationClasses = {
  // Standard animation classes
  fadeIn: "animate-fadeIn",
  fadeOut: "animate-fadeOut",
  slideInUp: "animate-slideInUp",
  slideInDown: "animate-slideInDown",
  slideInLeft: "animate-slideInLeft",
  slideInRight: "animate-slideInRight",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
};
