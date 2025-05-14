import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { FiPlus } from "react-icons/fi";

export const meta: MetaFunction = () => {
 return [{ title: "Calendar" }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
 return defer({});
};

const CalendarPage = () => {
 return (
  <div className="w-full h-full flex">
   <div className="py-5 pt-8 px-3 sm:px-6 flex flex-col gap-4 w-full">
    <nav className="flex items-center justify-between">
     <h1 className="text-2xl font-medium text-gray-900 dark:text-neutral-100">
      Calendar
     </h1>
     <button className="flex items-center gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-700 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-600">
      <FiPlus className="size-4 sm:size-6" />
      New Task
     </button>
    </nav>
   </div>
  </div>
 );
};

export default CalendarPage;
