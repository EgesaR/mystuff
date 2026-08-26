export type AppUser = {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string;
  bio?: string | null;
  is_active: boolean;
  is_developer?: boolean;
  updated_at?: string;
};

export type CurrentUserState = {
  user: AppUser | null;
  isPending: boolean;
};

export type ActionResult =
  | { success: true; message: string; fieldErrors?: never }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  username: string;
  email: string;
  password: string;
  //confirmPassword: string
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
