// app/routes/dashboard.notes.tsx
import { Outlet } from "react-router";

export default function NotesLayout() {
  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Nested child routes (index list or dynamic $id view) render inside this outlet */}
      <Outlet />
    </div>
  );
}
