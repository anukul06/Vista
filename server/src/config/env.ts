import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  // Deliberately NOT named PORT — some dev-tooling sandboxes export a generic
  // PORT env var for the primary web process (here, the Vite client), and a
  // same-named var on the API would silently steal that port from Vite.
  port: Number(process.env.API_PORT ?? 4000),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@vista.club',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'change-me-now',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },

  github: {
    token: process.env.GITHUB_TOKEN ?? '',
  },
}
