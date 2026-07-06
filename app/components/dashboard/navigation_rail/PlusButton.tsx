import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";

const DURATION = 0.9;
const ACTIVE_ROTATION = 225;

interface PlusButtonProps {
  isActive?: boolean;
}

const PlusButton = ({ isActive = false }: PlusButtonProps) => {
  const rotation = useMotionValue(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const borderRadius = useTransform(
    rotation,
    [0, 135, 360],
    ["6px", "6px", "9999px"],
  );

  const backgroundColor = useTransform(
    rotation,
    [0, 135, 360],
    ["transparent", "transparent", "#3b82f6"],
  );

  const iconColor = useTransform(
    rotation,
    [0, 135, 360],
    ["hsl(var(--foreground))", "hsl(var(--foreground))", "#ffffff"],
  );

  const animateTo = (target: number) => {
    animRef.current?.stop();

    const current = rotation.get();
    const distance = Math.abs(target - current);

    animRef.current = animate(rotation, target, {
      duration: DURATION * (distance / 360),
      ease: [0.4, 0, 0.2, 1],
    });
  };

  React.useEffect(() => {
    animateTo(isActive ? ACTIVE_ROTATION : 0);
  }, [isActive]);

  const handleHoverStart = () => {
    if (isActive) return;
    animateTo(360);
  };

  const handleHoverEnd = () => {
    if (isActive) return;
    animateTo(0);
  };

  return (
    <Button
      asChild
      variant="ghost"
      size="icon-lg"
      aria-label="Add"
      className="size-4 p-5 hover:bg-transparent hover:outline-0 focus:outline-0 active:outline-0"
    >
      <motion.button
        type="button"
        style={{ borderRadius, backgroundColor, outline: "none" }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        aria-pressed={isActive}
      >
        <motion.span
          style={{ rotate: rotation, color: iconColor }}
          className="flex items-center justify-center"
        >
          <PlusIcon className="size-6" />
        </motion.span>
      </motion.button>
    </Button>
  );
};

export default PlusButton;
