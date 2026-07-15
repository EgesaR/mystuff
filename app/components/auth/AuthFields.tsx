import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { useAuthForm } from "~/hooks/useAuthForm";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

type Props = {
  type: "sign-in" | "sign-up";
  form: ReturnType<typeof useAuthForm>["form"];
};

const AuthFields = ({ type, form }: Props) => {
  const isSignIn = type === "sign-in";

  return (
    <FieldGroup>
      {!isSignIn && (
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${type}-username`}>Username</FieldLabel>

              <Input
                {...field}
                id={`${type}-username`}
                type="text"
                placeholder="@username"
                autoComplete="username"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${type}-email`}>Email</FieldLabel>

            <Input
              {...field}
              id={`${type}-email`}
              type="email"
              placeholder="you@email.com"
              // In sign-in, the email acts as the credential identifier (username)
              autoComplete={isSignIn ? "username" : "email"}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        id={`${type}-password`}
        autoComplete={isSignIn ? "current-password" : "new-password"}
      />

      {!isSignIn && (
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          id={`${type}-confirmPassword`}
          autoComplete="new-password"
        />
      )}
    </FieldGroup>
  );
};

type PasswordFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  id: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
};

function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  id,
  autoComplete,
  placeholder = "••••••••",
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>

          <InputGroup>
            <InputGroupInput
              {...field}
              id={id}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              autoComplete={autoComplete}
            />

            <InputGroupAddon
              align="inline-end"
              className="cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeOffIcon className="size-4" />
              )}
            </InputGroupAddon>
          </InputGroup>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default AuthFields;
