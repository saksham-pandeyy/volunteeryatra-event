export const routes = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  events: {
    list: "/events",
    create: "/events",
    stats: "/events/stats",
    byId: (eventId: string) => `/events/${eventId}`,
    update: (eventId: string) => `/events/${eventId}`,
    updateStatus: (eventId: string) => `/events/${eventId}/status`,
    delete: (eventId: string) => `/events/${eventId}`,
  },
  participants: {
    apply: (eventId: string) => `/events/${eventId}/apply`,
    list: (eventId: string) => `/events/${eventId}/participants`,
    cancel: (eventId: string, participantId: string) =>
      `/events/${eventId}/participants/${participantId}`,
  },
} as const;
