import type { MetaFunction } from "@remix-run/node";
import AppBar from "~/components/AppBar";
import SideBar from "~/components/SideBar";

export const meta: MetaFunction = () => {
  return [
    { title: "My Stuff" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="h-full w-full">
      <AppBar />
      <div className="w-full h-full flex">
        <SideBar />
        <div>

        </div>
      </div>
    </div>
  );
}