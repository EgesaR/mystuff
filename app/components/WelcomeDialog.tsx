import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStickyNote, FaTasks, FaCalendarAlt } from "react-icons/fa";
import Button from "./Button";

// Define variants inline to ensure correct typing
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Number (in seconds)
    },
  },
  exit: { opacity: 0 },
};

const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const iconVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } },
};

const sectionVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const customTitleVariants = {
  initial: { y: 50, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
  exit: { y: -50, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const customDescriptionVariants = {
  initial: { y: 30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.5 },
  },
  exit: { y: -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const leftSideVariants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: { x: 100, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

const rightSideVariants = {
  initial: { y: 100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
  exit: { y: -100, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

interface Tab {
  title: string;
  description: string;
  icon?: JSX.Element;
  gradient?: string;
  badge?: string;
}

const WelcomeDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [isShrinking, setIsShrinking] = useState<boolean>(false);
  const dialogPanelRef = useRef<HTMLDivElement>(null);

  const tabs: Tab[] = [
    {
      title: "Unleash Your Productivity with MyStuff",
      description:
        "Dive into a world of seamless organization! Create notes, conquer tasks, and master your schedules anytime, anywhere with MyStuff.",
    },
    {
      title: "Supercharge Your Notes",
      description:
        "Transform chaos into clarity! Craft, edit, and organize your notes with lightning speed to boost your productivity.",
      icon: <FaStickyNote className="text-8xl text-white" />,
      gradient: "from-blue-500 to-purple-600",
      badge: "Notes Power",
    },
    {
      title: "Crush Your Tasks",
      description:
        "Take control like never before! Set priorities, track progress, and smash your goals with intuitive task management tools.",
      icon: <FaTasks className="text-8xl text-white" />,
      gradient: "from-green-500 to-cyan-600",
      badge: "Task Mastery",
    },
    {
      title: "Rule Your Schedules",
      description:
        "Own your time with epic planning! Build schedules, set blazing-fast reminders, and stay ahead of every moment with MyStuff.",
      icon: <FaCalendarAlt className="text-8xl text-white" />,
      gradient: "from-purple-500 to-pink-600",
      badge: "Schedule Pro",
    },
    {
      title: "Sync & Share with Flair",
      description:
        "Stay connected and unstoppable! Access your notes, tasks, and schedules across devices and share them effortlessly with others.",
    },
  ];

  const handleNext = (): void => {
    if (tabIndex < tabs.length - 1) {
      setTabIndex((prev) => prev + 1);
      setIsShrinking(false);
    } else {
      setTimeout(() => setIsOpen(false), 900);
    }
  };

  const handlePrevious = (): void => {
    if (tabIndex > 0) {
      setTabIndex((prev) => prev - 1);
      setIsShrinking(tabIndex === 1);
    }
  };

  const dialogPanelVariants = {
    initial: { width: "56rem", y: 100, opacity: 0 },
    animate: {
      width: "56rem",
      y: 0,
      opacity: 1,
      transition: { ease: "easeInOut", duration: 1.25 },
    },
    expanded: {
      width: "100%",
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    shrunk: {
      width: "56rem",
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeInOut", delay: 0.2 },
    }, 
  };
  return (
    <Dialog
      static
      open={isOpen}
      onClose={() => setTimeout(() => setIsOpen(false), 900)}
      className="relative z-[100]"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-0"
          >
            <DialogPanel
              as={motion.div}
              ref={dialogPanelRef}
              variants={dialogPanelVariants}
              initial="initial"
              animate={
                tabIndex === 0
                  ? isShrinking
                    ? "shrunk"
                    : "animate"
                  : tabIndex >= 1 && tabIndex <= 3
                  ? "expanded"
                  : "animate"
              }
              className={`bg-white dark:bg-zinc-950 rounded-lg flex justify-center items-center flex-col w-full overflow-hidden ${
                tabIndex === 0
                  ? "max-w-4xl h-[80vh] p-6 sm:p-12 sm:py-0"
                  : tabIndex === 4
                  ? "max-w-4xl h-[80vh] p-8"
                  : "h-full p-0"
              }`}
              id="dialogPanel"
            >
              <AnimatePresence mode="wait">
                <motion.section
                  key={tabIndex}
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`w-full h-full flex ${
                    tabIndex >= 1 && tabIndex <= 3 ? "flex-row" : "flex-col"
                  } justify-center items-center ${
                    tabIndex >= 1 && tabIndex <= 3 ? "pl-4 sm:pl-6" : "p-8"
                  } space-y-6 overflow-visible`} // Only left padding for tabs 1-3
                >
                  <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex ${
                      tabIndex >= 1 && tabIndex <= 3 ? "flex-row w-full" : "flex-col w-full"
                    } items-center justify-center space-y-4 sm:space-y-4 sm:space-x-4 items-center h-full`}
                  >
                    <motion.div
                      variants={tabIndex >= 1 && tabIndex <= 3 ? leftSideVariants : childVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={`flex flex-col space-y-6 ${
                        tabIndex >= 1 && tabIndex <= 3
                          ? "w-1/2 h-full justify-center pl-4 sm:pl-10 sm:pt-12 sm:pb-14  items-start text-left"
                          : "w-full items-center"
                      }`}
                    >
                      <motion.div
                        variants={childVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`flex space-x-2 ${
                          tabIndex >= 1 && tabIndex <= 3
                            ? "justify-start"
                            : "justify-center"
                        }`}
                      >
                        {tabs.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 w-4 rounded-full transition-all duration-300 ease-in-out ${
                              index === tabIndex
                                ? "bg-orange-500 dark:bg-orange-400"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </motion.div>

                      {tabs[tabIndex].badge && (
                        <motion.span
                          variants={childVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="inline-flex items-center rounded-md bg-amber-800 dark:bg-amber-900/50 px-3 py-1 text-sm font-bold text-white dark:text-amber-200 ring-1 ring-amber-400 ring-inset dark:ring-amber-400 w-fit"
                        >
                          {tabs[tabIndex].badge}
                        </motion.span>
                      )}

                      <motion.div
                        variants={childVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex items-center space-x-1"
                      >
                        <DialogTitle
                          as={motion.h2}
                          variants={customTitleVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ staggerChildren: 0.3 }}
                          custom={tabIndex}
                          className="font-normal text-4xl sm:text-[37px] text-white dark:text-zinc-100"
                        >
                          {tabs[tabIndex].title.split("MyStuff")[0]}
                          {tabs[tabIndex].title.includes("MyStuff") && (
                            <motion.label
                              variants={customTitleVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent font-bold text-4xl sm:text-4xl"
                            >
                              MyStuff
                            </motion.label>
                          )}
                        </DialogTitle>
                      </motion.div>

                      <motion.div
                        variants={customDescriptionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-[17px] font-light text-white dark:text-gray-400 max-w-xl"
                      >
                        <Description as="p">{tabs[tabIndex].description}</Description>
                      </motion.div>

                      <motion.div
                        variants={childVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex space-x-4 mt-auto"
                      >
                        {tabIndex > 0 && (
                          <Button
                            className="px-12 py-2 bg-gray-400 dark:bg-gray-500 text-gray-800 dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-400 rounded-md"
                            onClick={handlePrevious}
                          >
                            Previous
                          </Button>
                        )}
                        <Button
                          className="px-12 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 dark:text-white font-bold rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                          onClick={handleNext}
                        >
                          {tabIndex === tabs.length - 1 ? "Get Started" : "Next"}
                        </Button>
                      </motion.div>
                    </motion.div>

                    {tabIndex >= 1 && tabIndex <= 3 && (
                      <motion.div
                        variants={rightSideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`w-1/2 h-full flex items-center justify-center bg-gradient-to-br ${tabs[tabIndex].gradient} p-0`} // No padding
                      >
                        <motion.div
                          variants={iconVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          {tabs[tabIndex].icon}
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.section>
              </AnimatePresence>
            </DialogPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default WelcomeDialog;