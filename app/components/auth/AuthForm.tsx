import React, { useId } from "react";
import { useNavigation } from "react-router";
import * as z from "zod";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useAuthForm } from "~/hooks/useAuthForm";
import OAuthButtons from "./OAuthButtons";
import AuthFields from "./AuthFields";
import SubmitButton from "./SubmitButton";
import AuthFooter from "./AuthFooter";

type AuthFormProps = { type: "sign-in" | "sign-up" };

const AuthForm = ({ type }: AuthFormProps) => {
  const isSignIn = type === "sign-in";
  const formId = useId();

  const { state } = useNavigation();
  const { form, onSubmit, oauth } = useAuthForm(type);
  const isSubmitting = state === "submitting";
  return (
    <div className="flex w-full sm:w-lg flex-col justify-center px-2 sm:px-8">
      {/* Header */}
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          {isSignIn ? "Welcome back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSignIn ? "Sign in your account" : "Sign up for a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-3">
        {/* OAuth */}
        {isSignIn && (
          <>
            <OAuthButtons oauth={oauth} isSubmitting={isSubmitting} />
            <div className="relative flex gap-3 justify-center items-center">
              <div className="h-0.5 rounded-full w-full flex-1 bg-zinc-500/40" />
              <div className="flex justify-center text-xs uppercase">
                or continue with email
              </div>
              <div className="h-0.5 rounded-full w-full flex-1 bg-zinc-500/40" />
            </div>
          </>
        )}
        {/* Fields */}
        <form id={formId} method="post" onSubmit={onSubmit}>
          <AuthFields type={type} form={form} />
        </form>
      </CardContent>
      {/* Footer */}
      <CardFooter className="flex flex-col mt-4 space-y-4.5">
        <SubmitButton type={type} formId={formId} isSubmitting={isSubmitting} />

        <AuthFooter type={type} />
      </CardFooter>
    </div>
  );
};

export default AuthForm;
