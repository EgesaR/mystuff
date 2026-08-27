import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-background">
      {/* Ambient glow — scales down on small screens */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 sm:h-80 md:h-96 lg:h-[28rem]"
        aria-hidden
      >
        <div
          className="absolute bottom-0 left-1/2 h-full w-[min(100vw,40rem)] -translate-x-1/2 rounded-[50%] bg-linear-to-t from-violet-500/25 via-cyan-400/10 to-transparent blur-3xl dark:from-violet-500/35 dark:via-purple-400/20 sm:w-[min(100vw,50rem)] md:w-[min(100vw,56rem)]"
          style={{ animationDuration: "10s" }}
        />
      </div>

      {/* Content — scrolls when the form is taller than the viewport */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
