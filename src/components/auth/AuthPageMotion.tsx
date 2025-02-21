import { LazyMotion, AnimatePresence, m, domAnimation } from "framer-motion";

export default function AuthPageMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <m.div
              className="inline-block mb-2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <m.div
                className="relative z-10"
                animate={{
                  rotate: [-8, 0, 8, 0, -8],
                  x: [-3, 3, -3, 3, -3],
                  y: [-2, 0, -2, 0, -2],
                  scale: [1, 1.05, 1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(var(--primary), 0.3))",
                    "drop-shadow(0 0 20px rgba(var(--primary), 0.8))",
                    "drop-shadow(0 0 0px rgba(var(--primary), 0.3))",
                  ],
                }}
                transition={{
                  rotate: {
                    repeat: Infinity,
                    duration: 0.2,
                    repeatDelay: 2,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  },
                  x: {
                    repeat: Infinity,
                    duration: 0.2,
                    repeatDelay: 2,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  },
                  y: {
                    repeat: Infinity,
                    duration: 0.2,
                    repeatDelay: 2,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 0.2,
                    repeatDelay: 2,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  },
                  filter: {
                    repeat: Infinity,
                    duration: 0.8,
                    repeatDelay: 1.2,
                    ease: "easeInOut",
                  },
                }}
              >
                <img
                  src="/hellospace-tracker-black.png"
                  alt="Hellospace Tracker"
                  className="h-16 sm:h-20 w-auto block dark:hidden relative z-10"
                />
                <img
                  src="/hellospace-tracker-white.png"
                  alt="Hellospace Tracker"
                  className="h-16 sm:h-20 w-auto hidden dark:block relative z-10"
                />
              </m.div>
            </m.div>
            <p className="text-sm text-muted-foreground text-center">
              Join the Global Productivity Community
            </p>
          </div>

          {children}
        </div>
      </div>
    </LazyMotion>
  );
}
