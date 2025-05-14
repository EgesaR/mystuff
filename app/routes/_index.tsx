import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import React, { useState, useEffect, Suspense } from "react";
import { Form } from "~/components/Form";
import Spinner from "~/components/Spinner";
import Button from "~/components/Button";
import TextFormatDragDrawer from "~/components/TextFormatDragDrawer";

export const meta: MetaFunction = () => {
 return [
  { title: "My Stuff" },
  { name: "description", content: "Welcome to Remix!" }
 ];
};

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

type AlignmentVariant = "left" | "center" | "justify" | "right";

export default function Index() {
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [data, setData] = useState(null);

 const navigation = useNavigation();
 const [time, setTime] = useState(new Date());
 let hours = time.getHours();
 const [todos, setTodos] = useState<TODO[]>([
  {
   id: 1,
   text: "Take out trash",
   checked: false,
   time: "5 mins"
  },
  {
   id: 2,
   text: "Do laundry",
   checked: false,
   time: "10 mins"
  },
  {
   id: 3,
   text: "Have existential crisis",
   checked: true,
   time: "12 hrs"
  },
  {
   id: 4,
   text: "Get dog food",
   checked: false,
   time: "1 hrs"
  }
 ]);

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
         Good {hours < 12 ? "morning" : hours === 12 ? "afternoon" : "evening"},
        </div>
        <div>Raymond</div>
       </div>
      </nav>
      <main>
       
       <Button onClick={() => setDrawerOpen(true)}> open Drawer </Button>
       <div>{JSON.stringify(data)}</div>
       <TextFormatDragDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setData={setData}
       />
      </main>
     </div>
    </div>
   )}
  </ErrorBoundary>
 );
}

export type TODO = {
 id: number;
 text: string;
 checked: boolean;
 time: string;
};
