// In-memory store for demo mode.
// Trade-off (documented in README): production should use Redis/DB.

export const sessionStore = {
  metadataByVideoId: {
    A: null,
    B: null,
  },
  lastRunAt: null,
};

