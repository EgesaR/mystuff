import AuthForm from "~/components/auth/AuthForm";
import type { Route } from "./+types/auth.login";
import { redirectIfAuthenticated } from "~/lib/loaders/auth.server";
import { signUp } from "~/lib/actions/auth.server";
import { useActionData, useNavigate } from "react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const meta: Route.MetaFunction = () => [
  { title: "Signup" },
  { name: "description", content: "Create a new account" },
  { name: "keywords", content: "Keywords" },
  { name: "author", content: "Author" },
  { name: "robots", content: "index, follow" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  return signUp(request, formData);
}

const AuthSignup = () => {
  const result = useActionData<typeof action>();
  const navigate = useNavigate();

  useEffect(() => {
    if (result?.success === false) {
      // Show server or validation error
      toast.error(result.error);
    } else if (result?.success === true) {
      // Show success message
      toast.success(result.message);

      // Wait 3 seconds, then navigate to the dashboard
      const timer = setTimeout(() => {
        navigate("/dashoard");
      }, 3000);

      // Cleanup the timer if the component unmounts early
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);
  return (
    <div>
      <AuthForm type="sign-up" />
    </div>
  );
};

export default AuthSignup;
