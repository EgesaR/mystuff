import React from "react";
import { Button } from "../ui/button";
import { useAuthForm } from "~/hooks/useAuthForm";
import { FaGithub, FaGoogle } from "react-icons/fa";
type Props = {
  isSubmitting: boolean;
  oauth: (provider: "google" | "github") => void;
};

const OAuthButtons = ({ isSubmitting, oauth }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant={"outline"}
        disabled={isSubmitting}
        onClick={() => oauth("google")}
        className="w-full"
      >
        <FaGoogle className="mr-2 size-4" />
        <span>Google</span>
      </Button>
      <Button
        type="button"
        variant={"outline"}
        disabled={isSubmitting}
        onClick={() => oauth("github")}
        className="w-full"
      >
        <FaGithub className="mr-2 size-4" />
        <span>Github</span>
      </Button>
    </div>
  );
};

export default OAuthButtons;
