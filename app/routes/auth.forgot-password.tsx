import React, { useEffect, useRef } from "react";
import type { Route } from "./+types/auth.forgot-password";
import { AnimatePresence, motion } from "framer-motion";
import { buildMeta } from "~/lib/seo";
import { forgotPasswordSchema } from "~/features/auth/validation";
import { forgotPassword } from "~/features/auth/api";
import { Form, Link, useActionData, useNavigation } from "react-router";
import {
  type CircleCheckIconHandle,
  type MailIconHandle,
  CircleCheckIcon,
  ArrowLeft,
  MailIcon,
} from "@animateicons/react/lucide";
import type { Variants } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertCircle, Loader2, Mail, SendIcon } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Forgot your password",
    description: "Enter your email to receive a password reset link",
    path: "/auth/forgot-password",
  });

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const validationResult = forgotPasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    const { fieldErrors, formErrors } = validationResult.error.flatten();

    return {
      success: false,
      error: formErrors[0] || "Please enter a valid email address.",
      fieldErrors,
    };
  }
  return await forgotPassword(formData);
}

const toErrorArray = (errors?: string[]) => errors?.map((message) => ({ message }));

const ForgotPasswordRoute = () => {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const isSuccess = actionData?.success;
  const fieldErrors =
    actionData && "fieldErrors" in actionData ? actionData.fieldErrors : undefined;

  const mailIconRef = useRef<MailIconHandle>(null);
  const checkIconRef = useRef<CircleCheckIconHandle>(null);

  useEffect(() => {
    mailIconRef.current?.startAnimation();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      checkIconRef.current?.startAnimation();
    }
  }, [isSuccess]);

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const iconVariants: Variants = {
    initial: { scale: 0.8, rotate: -10 },
    animate: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 15 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full max-w-md"
    >
      <Card className="w-full rounded-2xl border border-border p-8 shadow-xl">
        <CardContent>
          <AnimatePresence mode="wait">
            {isSuccess ? (
              // Success State View
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-4 py-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <CircleCheckIcon ref={checkIconRef} className="size-8" />
                </motion.div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                  <p className="text-sm text-muted-foreground">
                    {actionData && "message" in actionData && actionData.message
                      ? actionData.message
                      : "We sent a 6-digit password reset code to your email."}
                  </p>
                </div>

                <div className="w-full space-y-2 mt-4">
                  <Button asChild className="w-full">
                    <Link to="/auth/reset-password">Enter 6-Digit Code</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/auth/login" className="gap-2">
                      <ArrowLeft className="size-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              // Forgot Password Form View
              <motion.div
                key="form-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1"
                  >
                    <MailIcon ref={mailIconRef} className="size-6" />
                  </motion.div>
                  <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                  <p className="text-sm text-muted-foreground">
                    No worries! Enter your email address below and we'll send you a reset link.
                  </p>
                </div>

                {/** Action Error Banner */}
                <AnimatePresence>
                  {actionData?.error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{actionData.error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form method="post" className="space-y-4">
                  <FieldGroup>
                    {/** Email Input */}
                    <Field data-invalid={!!fieldErrors?.email}>
                      <FieldLabel htmlFor="email">Email address</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          required
                        />
                        <InputGroupAddon align="inline-end" className="text-muted-foreground">
                          <Mail className="size-4" />
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldErrors?.email && (
                        <FieldError errors={toErrorArray(fieldErrors.email)} />
                      )}
                    </Field>
                  </FieldGroup>

                  <Button type="submit" className="w-full gap-2 mt-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <SendIcon className="size-4" />
                        <span>Send reset link</span>
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center pt-2">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Back to sign in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordRoute;
