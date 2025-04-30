import type { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { useState, Suspense } from "react";
import { Form } from "~/components/Form";
import Spinner from "~/components/Spinner";

export const meta: MetaFunction = () => {
  return [
    { title: "My Stuff" },
    { name: "description", content: "Welcome to Remix!" },
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

export default function Index() {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<TODO[]>([
    {
      id: 1,
      text: "Take out trash",
      checked: false,
      time: "5 mins",
    },
    {
      id: 2,
      text: "Do laundry",
      checked: false,
      time: "10 mins",
    },
    {
      id: 3,
      text: "Have existential crisis",
      checked: true,
      time: "12 hrs",
    },
    {
      id: 4,
      text: "Get dog food",
      checked: false,
      time: "1 hrs",
    },
  ]);

  const isLoading = navigation.state !== "idle";

  return (
    <ErrorBoundary>
      {isLoading ? (
        <Spinner size={60} strokeWidth={6} color="#0071c2" />
      ) : (
        <Suspense fallback={<Spinner size={60} strokeWidth={6} color="#0071c2" />}>
        </Suspense>
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
