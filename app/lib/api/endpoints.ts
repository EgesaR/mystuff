export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    logoutAll: "/auth/logout-all",

    refresh: "/auth/refresh",

    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",

    me: "/auth/me",

    oauth: {
      google: "/auth/oauth/google",
      github: "/auth/oauth/github",
    },
  },

  users: {
    me: "/users/me",

    byId(id: string) {
      return `/users/${encodeURIComponent(id)}`;
    },
  },

  files: {
    root: "/files",
    collections: "/files/collections",
    uploads: "/uploads",
  },

  notes: {
    root: "/notes",

    byId(noteId: string) {
      return `/notes/${encodeURIComponent(noteId)}`;
    },

    media(noteId: string) {
      return `/notes/${encodeURIComponent(noteId)}/media`;
    },

    comments(noteId: string) {
      return `/notes/${encodeURIComponent(noteId)}/comments`;
    },
  },

  media: "/media",

  notifications: {
    root: "/notifications",
    ws: "/ws/notifications",
  },

  logs: "/logs",

  feedback: {
    root: "/feedback",
    ws: "/ws/feedback",
  },

  shares: "/shares",

  workspace: "/tabs",

  accent: {
    profile: "/accent/profile",
    correct: "/accent/correct",

    forget(word: string) {
      return `/accent/forget/${encodeURIComponent(word)}`;
    },
  },

  health: "/health",
} as const;
