
export const sectionVariants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } },
  exit: { y: -100, opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } },
};

export const titleVariants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { x: 100, opacity: 0, transition: { duration: 0.4, ease: "easeOut" } },
  transition: { staggerChildren: 0.2}
};

export const childVariants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { y: -50, opacity: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const iconVariants = {
  initial: { scale: 0, opacity: 0, rotate: -15 },
  animate: {
    scale: [0, 1.3, 1],
    opacity: [0, 1],
    rotate: [-15, 10, 0],
    transition: { duration: 1.2, ease: "easeOut", times: [0, 0.5, 1] },
  },
  exit: { scale: 0, opacity: 0, rotate: -15, transition: { duration: 0.4, ease: "easeIn" } },
};

export const containerVariants = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, delayChildren: 0.1, delay: 0.5, ease: "easeIn" } },
  exit: { opacity: 0, y:-100, transition: { staggerChildren: 0.2, staggerDirection: -1, duration: 0.4, ease: "easeIn" } },
};