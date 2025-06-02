import { DOMKeyframesDefinition, AnimationOptions, ElementOrSelector, useAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

// Type for animation parameters
type AnimateParams = [
  ElementOrSelector,
  DOMKeyframesDefinition,
  (AnimationOptions | undefined)?
];

// Type for a single animation or an array of animations
type Animation = AnimateParams | AnimateParams[];

// Custom hook for handling motion timeline animations
 const useMotionTimeline = (keyframes: Animation[], count: number = 1) => {
  const mounted = useRef(true);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    mounted.current = true;
    handleAnimate();
    return () => {
      mounted.current = false;
    };
  }, [keyframes, count]); // Dependencies for dynamic updates

  const processAnimation = async (animation: Animation) => {
    try {
      if (Array.isArray(animation[0])) {
        // Handle nested animations (array of AnimateParams)
        await Promise.all(
          animation.map(async (a) => {
            await processAnimation(a as AnimateParams);
          })
        );
      } else {
        // Handle single animation
        const [selector] = animation as AnimateParams;
        if (typeof selector === "string" && !document.querySelector(selector)) {
          console.warn(`No elements found for selector: ${selector}`);
          return;
        }
        await animate(...(animation as AnimateParams));
      }
    } catch (error) {
      console.error("Animation failed:", error);
    }
  };

  const handleAnimate = async () => {
    for (let i = 0; i < count; i++) {
      for (const animation of keyframes) {
        if (!mounted.current) return;
        await processAnimation(animation);
      }
    }
  };

  return scope;
};

export default useMotionTimeline