import { useNavigation } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import Button from "~/components/Button";
import Spinner from "~/components/Spinner";
import DragCloseDrawer from "~/components/DragCloseDrawer";
import TextFormatDragDrawer from "~/components/TextFormatDragDrawer";
import { CgFileAdd } from "react-icons/cg";
import { CiHashtag } from "react-icons/ci";

export const meta: MetaFunction = () => {
  return [
    { title: "My Stuff" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface TextFormatData {
  font: string;
  fontSize: number;
  fontColor: string;
  alignment: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface ErrorBoundaryProps {
  error?: Error;
  children: React.ReactNode;
}

function ErrorBoundary({ error, children }: ErrorBoundaryProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div>
          <h1>Error</h1>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function Index() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [textData, setTextData] = useState<TextFormatData | null>(null);
  const navigation = useNavigation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();

  const isLoading = navigation.state !== "idle";

  return (
    <ErrorBoundary>
      {isLoading ? (
        <div className="h-full w-full grid place-content-center">
          <Spinner size={60} strokeWidth={6} color="#0071c2" />
        </div>
      ) : (
        <div className="h-full w-full flex">
          <div className="py-5 pt-10 px-3 sm:px-6 sm:pr-0 flex flex-col gap-4 w-full">
            <section className="w-full flex justify-end itemms-center">
              <div className="space-x-1">
                <Button btn_type="outline">
                  <CgFileAdd className="text-lg" /> New Note
                </Button>
                <Button btn_type="outline">
                  <CiHashtag className="text-lg" /> New Task
                </Button>
                <Button btn_type="outline">
                  <CgFileAdd className="text-lg" /> Plan a new schedule
                </Button>
              </div>
            </section>
            <section className="relative flex items-center justify-center h-[205px] rounded-xl bg-gray-100 shadow-lg overflow-hidden">
              <img
                alt="Hello"
                src="/bg.webp"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-start sm:px-12">
                <div className="text-[22px] sm:text-3xl tracking-tight font-medium text-white flex flex-row sm:flex-row gap-1.5 text-center sm:text-left">
                  <span className="text-white/80">
                    Good{" "}
                    {hours < 12
                      ? "morning"
                      : hours >= 17
                      ? "evening"
                      : "afternoon"}
                    ,
                  </span>
                  <span className="font-semibold">Raymond</span>
                </div>
              </div>
            </section>
            <main>
              {/* Recent Section */}
              <section className="px-2 sm:px-3 my-4 rounded-xl shadow-sm flex itemms-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Recents
                </h1>
              </section>
              <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
              <div>{JSON.stringify(textData)}</div>
              <TextFormatDragDrawer
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                setData={setTextData}
              />
            </main>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
