/**
 * Public demo accounts documented at https://dummyjson.com/docs/auth.
 * Overridable through environment variables so the suite can point at another environment.
 */
export const credentials = {
  valid: {
    username: process.env.API_USERNAME ?? 'emilys',
    password: process.env.API_PASSWORD ?? 'emilyspass',
  },
};

export const knownProduct = { id: 1, title: 'Essence Mascara Lash Princess', category: 'beauty' } as const;

export const uniqueTitle = (prefix = 'QA Automation Product') => `${prefix} ${Date.now().toString(36)}`;
