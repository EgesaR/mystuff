import AuthForm from "~/components/auth/AuthForm";
import type { Route } from "./+types/auth.login";
import { redirectIfAuthenticated } from "~/lib/loaders/auth.server";
import { signIn } from "~/lib/actions/auth.server";
import { useActionData } from "react-router";

export const meta: Route.MetaFunction = () => [
  { title: "Login" },
  { name: "description", content: "Description" },
  { name: "keywords", content: "Keywords" },
  { name: "author", content: "Author" },
  { name: "robots", content: "index, follow" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  return signIn(request, formData);
}

const AuthLogin = () => {
  const result = useActionData<typeof action>();
  return (
    <div>
      <AuthForm type="sign-in" />

      {result?.success === false && <p>{result.error}</p>}
    </div>
  );
};

export default AuthLogin;
