import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes Page" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function NotesPage() {
  return (
    <div className="h-full w-full flex">
      <div className="py-5 pt-8 px-6 flex flex-col gap-2.5 w-[40%]">
        <h1 className="text-2xl font-medium">Notes</h1>
        <ul className="flex flex-col gap-3.5">
          <NoteCard />
          <NoteCard />
          <NoteCard />
        </ul>
      </div>
      <div className="py-8 px-10 flex flex-col gap-4 w-[60%]">
        <div className="w-full h-[260px] flex items-center justify-center">
          <img
            src="/sleeping on desk.png"
            alt="sleeping on desk"
            className="h-full w-[275px]"
          />
        </div>
        <h1 className="text-xl font-medium">Write down the ideas in 2025 2024 20234</h1>
        <div className="flex gap-1 text-orange-400 text-sm">
          <label>#ideas</label>
          <label>#to-do's</label>
          <label>#morning</label>
        </div>
      </div>
    </div>
  );
}

const NoteCard = () => {
  return (
    <li className="px-4 py-4 flex flex-col h-36 hover:bg-[#F7B25E] transition-all duration-200 ease-in-out rounded-xl text-sm">
      <label className="font-medium text-base">Write down your ideas</label>
      <div className="flex gap-1 mt-2.5 text-[#FDF2CF]">
        <label>#ideas</label>
        <label>#to-do's</label>
        <label>#morning</label>
      </div>
      <p className="text-[#FDF2CF]">
        "Sometimes on Mondays, when servers at A16 are ...
      </p>
      <div className="flex items-center justify-between text-[#FDF2CF] mt-4">
        <div>1 day</div>
        <div className="flex -space-x-1 overflow-hidden">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="inline-block size-6 rounded-full ring-2 ring-white"
          />
          <img
            alt=""
            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="inline-block size-6 rounded-full ring-2 ring-white"
          />
          <img
            alt=""
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            className="inline-block size-6 rounded-full ring-2 ring-white"
          />
          <img
            alt=""
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="inline-block size-6 rounded-full ring-2 ring-white"
          />
        </div>
      </div>
    </li>
  );
};
