import React from "react";
import {
 motion,
 useDragControls,
 useMotionValue,
 useAnimate
} from "framer-motion";

interface DragCloseDrawerProps {
 open: Boolean;
 setOpen: () => void;
 children: React.ReactNode;
}

const DragCloseDrawer = ({ open, setOpen, children }) => {
 const controls = useDragControls();
 const y = useMotionValue(0);
 const [scope, animate] = useAnimate();

 const handleClose = async () => {
  animate(scope.current, { opacity: [1, 0] });
  const yStart = typeof y.get() === "number" ? y.get() : 0;
  await animate("#drag-drawer", { y: [yStart, 500] });
  setOpen(false);
 };

 return (
  <>
   {open && (
    <motion.div
     ref={scope}
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     onClick={handleClose}
     className="fixed inset-0 z-50 bg-neutral-950/70"
    >
     <motion.div
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ ease: "easeInOut" }}
      onClick={e => e.stopPropagation()}
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      style={{ y }}
      onDragEnd={() => {
       if (y.get() >= 100) {
        handleClose();
       }
      }}
      id="drag-drawer"
      className="absolute bottom-0 h-[75vh] w-full overflow-hidden rounded-3xl bg-neutral-900"
     >
      <div className="absolute left-0 right-0 top-0 flex justify-center bg-neutral-900 p-4">
       <button
        onPointerDown={e => controls.start(e)}
        className="h-2 w-14 cursor-grab touch-none rounded-full bg-neutral-600 active:cursor-grabbing"
       />
      </div>
      <div className="z-0 h-full overflow-auto p-4 pt-10">{children}</div>
     </motion.div>
    </motion.div>
   )}
  </>
 );
};

export default DragCloseDrawer;
