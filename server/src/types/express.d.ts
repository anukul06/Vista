import type { JwtRole } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: JwtRole
      }
    }
  }
}

export {}
