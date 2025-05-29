import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

const WelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const tabs = [
    {
      title: "Welcome to MyStuff",
      description:
        "Keep notes, create tasks, make schedules anywhere, anytime on MyStuff.",
    },
    {
      title: "Organize Your Notes",
      description:
        "Easily create, edit, and categorize your notes to stay organized and productive.",
    },
    {
      title: "Manage Your Tasks",
      description:
        "Create tasks, set priorities, and track progress with intuitive tools.",
    },
    {
      title: "Plan Your Schedules",
      description:
        "Build schedules, set reminders, and manage your time effectively with MyStuff.",
    },
    {
      title: "Sync & Share",
      description:
        "Access your data across devices and share with others seamlessly.",
    },
  ];

  const handleNext = () => {
    if (tabIndex < tabs.length - 1) {
      setTabIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (tabIndex > 0) {
      setTabIndex((prev) => prev - 1);
    }
  };

  // Variants for section animation (slide in from bottom, out to top)
  const sectionVariants = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: { y: -100, opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  // Variants for title (both parts slide in from right, out to left)
  const titleVariants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.3 } },
  };

  // Variants for child elements (badge, description, buttons)
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.2,
        staggerDirection: -1,
      },
    },
  };

  const childVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
        <DialogPanel className="w-full max-w-4xl h-[80vh] bg-white dark:bg-zinc-800 rounded-lg flex justify-center items-center flex-col">
          <AnimatePresence mode="wait">
            <motion.section
              key={tabIndex}
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full flex flex-col justify-center items-center p-6 sm:p-12 space-y-6"
            >
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center space-y-6 text-center"
              >
                {/* Tab Indicators */}
                <motion.div variants={childVariants} className="flex space-x-2">
                  {tabs.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === tabIndex
                          ? "bg-amber-500 dark:bg-amber-400"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    />
                  ))}
                </motion.div>

                {/* Badge */}
                <motion.span
                  variants={childVariants}
                  className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/50 px-3 py-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 ring-1 ring-yellow-600/20 dark:ring-yellow-600/30 ring-inset w-fit"
                >
                  {tabIndex === 0 ? "New" : tabs[tabIndex].title}
                </motion.span>

                {/* Dialog Title with split animation */}
                <motion.div className="flex items-center space-x-2">
                  <DialogTitle
                    as={motion.span}
                    variants={titleVariants}
                    className="font-normal text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100"
                  >
                    {tabs[tabIndex].title.split("MyStuff")[0]}
                  </DialogTitle>
                  <motion.label
                    variants={titleVariants}
                    className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent font-normal text-3xl sm:text-5xl"
                  >
                    MyStuff
                  </motion.label>
                </motion.div>

                {/* Description */}
                <Description as={motion.p} variants={childVariants} className="text-lg text-zinc-700 dark:text-zinc-300 max-w-2xl">
                  {tabs[tabIndex].description}
                </Description>

                {/* Buttons */}
                <motion.div variants={childVariants} className="flex space-x-4 mt-auto">
                  {tabIndex > 0 && (
                    <Button
                      className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      onClick={handlePrevious}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    className="px-6 py-2 bg-amber-500 dark:bg-amber-600 text-white dark:text-zinc-100 rounded-md hover:bg-amber-600 dark:hover:bg-amber-700"
                    onClick={handleNext}
                  >
                    {tabIndex === tabs.length - 1 ? "Get Started" : "Next"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.section>
          </AnimatePresence>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default WelcomeDialog;