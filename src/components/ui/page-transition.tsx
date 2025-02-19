import { m } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="animate-in fade-in-50 duration-500"
    >
      {children}
    </m.div>
  );
}
