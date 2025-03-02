// Message style tokens for consistent message styling

export const messageStyles = {
  // Message types
  types: {
    error: {
      background: "bg-destructive/10",
      border: "border-destructive/20",
      text: "text-destructive",
      icon: "text-destructive",
    },
    success: {
      background: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-700 dark:text-green-500",
      icon: "text-green-500",
    },
    warning: {
      background: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-700 dark:text-yellow-500",
      icon: "text-yellow-500",
    },
    info: {
      background: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-700 dark:text-blue-500",
      icon: "text-blue-500",
    },
  },

  // Message sizes
  sizes: {
    sm: "p-2 text-xs rounded-md",
    md: "p-3 text-sm rounded-lg",
    lg: "p-4 text-base rounded-xl",
  },

  // Message variants
  variants: {
    solid: {
      error: "bg-destructive text-destructive-foreground",
      success: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white",
    },
    subtle: {
      error: "bg-destructive/10 text-destructive border border-destructive/20",
      success:
        "bg-green-500/10 text-green-700 dark:text-green-500 border border-green-500/20",
      warning:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-500/20",
      info: "bg-blue-500/10 text-blue-700 dark:text-blue-500 border border-blue-500/20",
    },
    outline: {
      error: "border border-destructive text-destructive bg-transparent",
      success:
        "border border-green-500 text-green-700 dark:text-green-500 bg-transparent",
      warning:
        "border border-yellow-500 text-yellow-700 dark:text-yellow-500 bg-transparent",
      info: "border border-blue-500 text-blue-700 dark:text-blue-500 bg-transparent",
    },
  },

  // Message animations
  animations: {
    slideIn: "animate-in slide-in-from-top-full duration-300",
    slideOut: "animate-out slide-out-to-top-full duration-300",
    fadeIn: "animate-in fade-in-0 duration-300",
    fadeOut: "animate-out fade-out-0 duration-300",
  },
};

export const toastStyles = {
  // Toast positions
  positions: {
    topLeft: "top-0 left-0",
    topCenter: "top-0 left-1/2 -translate-x-1/2",
    topRight: "top-0 right-0",
    bottomLeft: "bottom-0 left-0",
    bottomCenter: "bottom-0 left-1/2 -translate-x-1/2",
    bottomRight: "bottom-0 right-0",
  },

  // Toast variants (inherits from messageStyles)
  variants: messageStyles.variants,

  // Toast animations
  animations: {
    slideInRight: "animate-in slide-in-from-right-full duration-300",
    slideOutRight: "animate-out slide-out-to-right-full duration-300",
    slideInLeft: "animate-in slide-in-from-left-full duration-300",
    slideOutLeft: "animate-out slide-out-to-left-full duration-300",
    slideInUp: "animate-in slide-in-from-bottom-full duration-300",
    slideOutUp: "animate-out slide-out-to-bottom-full duration-300",
    slideInDown: "animate-in slide-in-from-top-full duration-300",
    slideOutDown: "animate-out slide-out-to-top-full duration-300",
  },
};

export const alertStyles = {
  // Alert variants (inherits from messageStyles)
  variants: messageStyles.variants,

  // Alert sizes
  sizes: {
    sm: "p-3 text-xs rounded-md",
    md: "p-4 text-sm rounded-lg",
    lg: "p-5 text-base rounded-xl",
  },
};
