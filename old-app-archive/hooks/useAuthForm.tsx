import {
  signInSchema,
  signUpSchema,
  type SignInData,
  type SignUpData,
} from "~/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmit } from "react-router";

export const useAuthForm = (type: "sign-in" | "sign-up") => {
  const isSignIn = type === "sign-in";
  const submit = useSubmit();

  const form = useForm<SignInData | SignUpData>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),

    defaultValues: isSignIn
      ? { email: "", password: "" }
      : { username: "", email: "", password: "", confirmPassword: "" },
  });

  const oauth = (provider: "google" | "github") => {
    submit({ intent: provider }, { method: "post" });
  };

  const onSubmit = form.handleSubmit((values) => {
    submit(values, { method: "post" });
  });

  return { form, onSubmit, oauth };
};
