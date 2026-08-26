import React, { useId } from "react";
import { useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useAuthForm } from "../hooks/useAuthForm";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto px-2 sm:px-0"
    >
      <Card className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl">
        {/* Header */}
        <CardHeader className="space-y-1.5 text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSignIn ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {isSignIn
              ? "Enter your credentials to access your account"
              : "Enter your details below to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* OAuth Buttons */}
          <OAuthButtons oauth={oauth} isSubmitting={isSubmitting} />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Or continue with email
            </div>
          </div>

          {/* Form Fields with Motion Transition */}
          <AnimatePresence mode="wait">
            <motion.form
              key={type}
              id={formId}
              method="post"
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: isSignIn ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignIn ? 10 : -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-4"
            >
              <AuthFields type={type} form={form} />
            </motion.form>
          </AnimatePresence>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <SubmitButton type={type} formId={formId} isSubmitting={isSubmitting} />
          <AuthFooter type={type} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AuthForm;
