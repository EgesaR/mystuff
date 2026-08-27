import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/auth.reset-password";
import { buildMeta } from "~/lib/seo";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Form, Link, useActionData, useNavigation, useSearchParams } from "react-router";
import { resetPasswordSchema } from "~/features/auth/validation/resetPassword";
import { resetPassword } from "~/features/auth/api";
import { Card, CardContent } from "~/components/ui/card";
import { AlertCircle, Loader2, Mail, Hash, ArrowRight, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  ArrowLeft,
  CircleCheckIcon,
  type CircleCheckIconHandle,
  EyeIcon,
  EyeOffIcon,
  KeyRound,
  type KeyRoundIconHandle,
  ShieldCheck,
  type ShieldCheckIconHandle,
} from "@animateicons/react/lucide";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Reset your password",
    description: "Enter your 6-digit code and new password to secure your account",
    path: "/auth/reset-password",
  });

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const validationResult = resetPasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    const { fieldErrors, formErrors } = validationResult.error.flatten();

    return {
      success: false,
      error: formErrors[0] || "Please check the form for errors.",
      fieldErrors,
    };
  }

  const { email, code, password } = validationResult.data;

  return await resetPassword(email, code, password);
}

const toErrorArray = (errors?: string[]) => errors?.map((message) => ({ message }));

const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  }),
};

const ResetPasswordRoute = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const isSuccess = actionData?.success;
  const fieldErrors =
    actionData && "fieldErrors" in actionData ? actionData.fieldErrors : undefined;

  // Stepper State
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<number>(1);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Controlled values for step persistence across steps
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");

  const checkIconRef = useRef<CircleCheckIconHandle>(null);
  const keyIconRef = useRef<KeyRoundIconHandle>(null);
  const shieldIconRef = useRef<ShieldCheckIconHandle>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    keyIconRef.current?.startAnimation();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      checkIconRef.current?.startAnimation();
    }
  }, [isSuccess]);

  // Fallback to Step 1 if server returned email/code errors after submission
  useEffect(() => {
    if (fieldErrors?.email || fieldErrors?.code) {
      setDirection(-1);
      setStep(1);
    }
  }, [fieldErrors]);

  const handleNextStep = () => {
    setStep1Error(null);
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStep1Error("Please enter a valid email address.");
      return;
    }
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setStep1Error("Please enter a valid 6-digit verification code.");
      return;
    }

    setDirection(1);
    setStep(2);
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setStep(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <Card className="w-full rounded-2xl border border-border p-8 shadow-xl">
        <CardContent>
          <AnimatePresence mode="wait">
            {isSuccess ? (
              // Success View
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
                  <h1 className="text-2xl font-bold tracking-tight">Password Reset Complete</h1>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully updated. You can now log in with your new
                    credentials.
                  </p>
                </div>

                <Button asChild className="w-full mt-6">
                  <Link to="/auth/login">Sign in to your account</Link>
                </Button>
              </motion.div>
            ) : (
              // Stepper View
              <div className="space-y-6">
                {/* Stepper Progress Bar */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        step >= 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 1 ? <Check className="size-3.5 stroke-[3]" /> : "1"}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        step === 1 ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      Verify Code
                    </span>
                  </div>

                  <div
                    className={`h-[2px] flex-1 mx-3 transition-colors ${
                      step > 1 ? "bg-primary" : "bg-border"
                    }`}
                  />

                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        step >= 2
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      2
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        step === 2 ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      New Password
                    </span>
                  </div>
                </div>

                {/* Header Icon & Title */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1"
                  >
                    <KeyRound ref={keyIconRef} className="size-6" />
                  </motion.div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {step === 1 ? "Enter Verification Code" : "Set New Password"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {step === 1
                      ? "Enter your account email and the 6-digit code received."
                      : "Create a strong password for your account."}
                  </p>
                </div>

                {/* Error Banners */}
                <AnimatePresence>
                  {(actionData?.error || step1Error) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{step1Error || actionData?.error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form method="post">
                  {/* Keep email & code submitted in Form regardless of current visible step */}
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="code" value={code} />

                  <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 ? (
                      /* Step 1: Email & Code Inputs */
                      <motion.div
                        key="step-1"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                      >
                        <FieldGroup>
                          <Field data-invalid={!!fieldErrors?.email}>
                            <FieldLabel htmlFor="email-input">Email address</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                          <Field data-invalid={!!fieldErrors?.code}>
                            <FieldLabel htmlFor="code-input">6-Digit Reset Code</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="code-input"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                className="tracking-widest font-mono text-center"
                                required
                              />
                              <InputGroupAddon align="inline-end" className="text-muted-foreground">
                                <Hash className="size-4" />
                              </InputGroupAddon>
                            </InputGroup>
                            {fieldErrors?.code && (
                              <FieldError errors={toErrorArray(fieldErrors.code)} />
                            )}
                          </Field>
                        </FieldGroup>

                        <Button
                          type="button"
                          className="w-full gap-2 mt-4"
                          onClick={handleNextStep}
                        >
                          <span>Continue</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      /* Step 2: Password Inputs */
                      <motion.div
                        key="step-2"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                      >
                        <FieldGroup>
                          <Field data-invalid={!!fieldErrors?.password}>
                            <FieldLabel htmlFor="password">New Password</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                              />
                              <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? (
                                  <EyeIcon className="size-4" />
                                ) : (
                                  <EyeOffIcon className="size-4" />
                                )}
                              </InputGroupAddon>
                            </InputGroup>
                            {fieldErrors?.password && (
                              <FieldError errors={toErrorArray(fieldErrors.password)} />
                            )}
                          </Field>

                          <Field data-invalid={!!fieldErrors?.confirmPassword}>
                            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                              />
                              <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                              >
                                {showConfirmPassword ? (
                                  <EyeIcon className="size-4" />
                                ) : (
                                  <EyeOffIcon className="size-4" />
                                )}
                              </InputGroupAddon>
                            </InputGroup>
                            {fieldErrors?.confirmPassword && (
                              <FieldError errors={toErrorArray(fieldErrors.confirmPassword)} />
                            )}
                          </Field>
                        </FieldGroup>

                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-1/3"
                            onClick={handlePrevStep}
                            disabled={isSubmitting}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="w-2/3 gap-2 px-2"
                            onMouseOver={() => shieldIconRef.current?.startAnimation()}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck ref={shieldIconRef} className="size-4" />
                                <span>Reset password</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Form>

                <div className="text-center pt-2">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Back to sign in
                  </Link>
                </div>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResetPasswordRoute;
