import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useLegacyIOS } from "~/legacy/hooks/useLegacyIOS";

// Restrict to actual HTML tags that framer-motion supports
type HTMLTag = keyof HTMLElementTagNameMap;

type LegacyMotionProps<T extends HTMLTag = "div"> = HTMLMotionProps<T> & {
  as?: T;
  children?: ReactNode;
};

export default function LegacyMotion<T extends HTMLTag = "div">({
  as,
  children,
  ...props
}: LegacyMotionProps<T>) {
  const legacyIOS = useLegacyIOS();
  const tag = (as ?? "div") as T;

  if (!legacyIOS) {
    const MotionComponent = motion[tag] as React.ComponentType<
      HTMLMotionProps<T>
    >;
    return <MotionComponent {...props}>{children}</MotionComponent>;
  }

  /*
   * iOS 12:
   * Render a normal element and strip Framer Motion-specific props.
   */
  const {
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    variants: _variants,
    whileHover: _whileHover,
    whileTap: _whileTap,
    whileFocus: _whileFocus,
    whileInView: _whileInView,
    viewport: _viewport,
    layout: _layout,
    layoutId: _layoutId,
    drag: _drag,
    dragConstraints: _dragConstraints,
    dragElastic: _dragElastic,
    dragMomentum: _dragMomentum,
    dragTransition: _dragTransition,
    onAnimationStart: _onAnimationStart,
    onAnimationComplete: _onAnimationComplete,
    onUpdate: _onUpdate,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onViewportEnter: _onViewportEnter,
    onViewportLeave: _onViewportLeave,
    style,
    ...rest
  } = props;

  const legacyStyle = style as CSSProperties | undefined;
  const safeProps = rest as HTMLAttributes<HTMLElement>;

  const Component = tag as ElementType;

  return (
    <Component {...safeProps} style={legacyStyle}>
      {children}
    </Component>
  );
}
