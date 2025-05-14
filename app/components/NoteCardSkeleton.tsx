const NoteCardSkeleton = () => (
 <tr className="animate-pulse">
  <td className="px-4 py-4 whitespace-nowrap">
   <div className="flex flex-col">
    <div className="h-4 bg-gray-200 rounded-full dark:bg-neutral-700 w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-1/2"></div>
   </div>
  </td>
  <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
   <div className="flex gap-1">
    <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-12"></div>
    <div className="h-3 bg-gray-200 rounded-full dark:bg-neutral-700 w-12"></div>
   </div>
  </td>
  <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
   <div className="h-4 bg-gray-200 rounded-full dark:bg-neutral-700 w-24"></div>
  </td>
  <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap">
   <div className="flex -space-x-1">
    <div className="size-6 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
    <div className="size-6 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
   </div>
  </td>
  <td className="px-4 py-4 whitespace-nowrap text-right">
   <div className="h-5 w-5 bg-gray-200 rounded-full dark:bg-neutral-700"></div>
  </td>
 </tr>
);

export default NoteCardSkeleton;
