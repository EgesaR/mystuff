import { useNavigation } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import Button from "~/components/Button";
import Spinner from "~/components/Spinner";
import DragCloseDrawer from "~/components/DragCloseDrawer";
import TextFormatDragDrawer from "~/components/TextFormatDragDrawer";

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
          <div className="py-5 pt-8 px-3 sm:px-6 flex flex-col gap-4 w-full">
            <nav className="flex items-center">
              <div className="text-[22px] sm:text-2xl tracking-tight font-normal flex gap-1.5">
                <div className="text-white/80">
                  Good {hours < 12 ? "morning" : hours >= 17 ? "evening" : "afternoon"},
                </div>
                <div>Raymond</div>
              </div>
            </nav>
            <main>
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