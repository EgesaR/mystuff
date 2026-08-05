// endpoints.ts

export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    logout: "/api/auth/logout",
    logoutAll: "/api/auth/logout-all",

    refresh: "/api/auth/refresh",

    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    changePassword: "/api/auth/change-password",

    me: "/api/auth/me",

    oauth: {
      google: "/api/auth/oauth/google",
      github: "/api/auth/oauth/github",
    },
  },

  users: {
    me: "/api/users/me",

    byId(id: string) {
      return `/api/users/${id}`;
    },
  },
  files: {
    root: "/api/files",
    collections: "/api/files/collections",
    uploads: "/uploads",
  },

  notes: {
    root: "/api/notes",
    byId(noteId: string) {
      return `/api/notes/${noteId}`;
    },
    media(noteId: string) {
      return `/api/notes/${noteId}/media`;
    },
    comments: (id: string) => `/api/notes/${id}/comments`,
  },
  media: "/api/media",
  notifications: "/api/notifications",
  logs: "/api/logs",
  feedback: "/api/feedback",
  shares: "/api/shares",
  workspace: "/api/tabs",

  accent: {
    profile: "/api/accent/profile",
    correct: "/api/accent/correct",

    forget(word: string) {
      return `/api/accent/forget/${encodeURIComponent(word)}`;
    },
  },

  health: "/api/health",
} as const;
