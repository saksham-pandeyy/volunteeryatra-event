export const routes = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    updateProfile: "/auth/profile",
    uploadAvatar: "/auth/avatar",
    removeAvatar: "/auth/avatar",
  },
  events: {
    list: "/events",
    create: "/events",
    stats: "/events/stats",
    exportCsv: "/events/export/csv",
    byId: (eventId: string) => `/events/${eventId}`,
    update: (eventId: string) => `/events/${eventId}`,
    updateStatus: (eventId: string) => `/events/${eventId}/status`,
    delete: (eventId: string) => `/events/${eventId}`,
  },
  upload: {
    file: "/upload",
  },
  participants: {
    apply: (eventId: string) => `/events/${eventId}/apply`,
    list: (eventId: string) => `/events/${eventId}/participants`,
    cancel: (eventId: string, participantId: string) =>
      `/events/${eventId}/participants/${participantId}`,
  },
} as const;
