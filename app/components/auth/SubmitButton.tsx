import React from "react";
import { Button } from "../ui/button";

interface SubmitButtonProps {
  type: "sign-in" | "sign-up";
  formId: string;
  isSubmitting: boolean;
}

const SubmitButton = ({ type, formId, isSubmitting }: SubmitButtonProps) => {
  const isSignIn = type === "sign-in";
  return (
    <Button
      type="submit"
      form={formId}
      className="w-full mt-4"
      size={"lg"}
      disabled={isSubmitting}
    >
      {isSubmitting
        ? isSignIn
          ? "Siging you in..."
          : "Creating account..."
        : isSignIn
          ? "Sign in"
          : "Create Account"}
    </Button>
  );
};

export default SubmitButton;
