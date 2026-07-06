import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router";

interface AuthFooterProps {
  type: "sign-in" | "sign-up";
}

const AuthFooter = ({ type }: AuthFooterProps) => {
  const isSignIn = type === "sign-in";
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {isSignIn && (
        <div className="text-right">
          <Link
            to={"/forgot-password"}
            className="text-sm text-blue-400 hover:underline"
          >
            Forgot Password
          </Link>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm whitespace-nowrap">
          {isSignIn ? "Don't have an account?" : "Already have an account"}
        </p>
        <Link
          to={isSignIn ? "/auth/signup" : "/auth/login"}
          className="text-blue-400 hover:underline text-sm"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Link>
      </div>
    </div>
  );
};

export default AuthFooter;
