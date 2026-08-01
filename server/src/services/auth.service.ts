import { userRepository } from '../repositories/user.repository.js'
import { adminRepository } from '../repositories/admin.repository.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import type { SignupInput, LoginInput } from '../validation/auth.validation.js'

function toPublicUser(user: {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  year: string
  githubUsername: string | null
  avatarUrl: string | null
  xp: number
  level: number
  role: string
}) {
  const { id, name, email, rollNumber, department, year, githubUsername, avatarUrl, xp, level, role } = user
  return { id, name, email, rollNumber, department, year, githubUsername, avatarUrl, xp, level, role }
}

async function issueTokens(userId: string, role: 'STUDENT' | 'ADMIN') {
  const payload = { sub: userId, role }
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  }
}

export const authService = {
  async signup(input: SignupInput) {
    const [existingEmail, existingRoll] = await Promise.all([
      userRepository.findByEmail(input.email),
      userRepository.findByRollNumber(input.rollNumber),
    ])
    if (existingEmail) throw ApiError.conflict('An account with this email already exists')
    if (existingRoll) throw ApiError.conflict('An account with this roll number already exists')

    const passwordHash = await hashPassword(input.password)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
      rollNumber: input.rollNumber,
      department: input.department,
      year: input.year,
      githubUsername: input.githubUsername,
    })

    const tokens = await issueTokens(user.id, 'STUDENT')
    return { user: toPublicUser(user), ...tokens }
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email)
    if (user) {
      const valid = await comparePassword(input.password, user.password)
      if (!valid) throw ApiError.unauthorized('Invalid email or password')

      const tokens = await issueTokens(user.id, user.role as 'STUDENT' | 'ADMIN')
      return { user: toPublicUser(user), ...tokens }
    }

    const admin = await adminRepository.findByEmail(input.email)
    if (!admin) throw ApiError.unauthorized('Invalid email or password')

    const valid = await comparePassword(input.password, admin.password)
    if (!valid) throw ApiError.unauthorized('Invalid email or password')

    const tokens = await issueTokens(admin.id, 'ADMIN')
    return {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        rollNumber: 'ADMIN',
        department: 'ADMIN',
        year: 'FIRST',
        githubUsername: null,
        avatarUrl: null,
        xp: 9999,
        level: 99,
        role: 'ADMIN',
      },
      ...tokens,
    }
  },

  async refresh(refreshToken: string) {
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token')
    }

    const user = await userRepository.findById(payload.sub)
    if (user) {
      const tokens = await issueTokens(user.id, user.role as 'STUDENT' | 'ADMIN')
      return { user: toPublicUser(user), ...tokens }
    }

    const admin = await adminRepository.findById(payload.sub)
    if (!admin) throw ApiError.unauthorized('User no longer exists')

    const tokens = await issueTokens(admin.id, 'ADMIN')
    return {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        rollNumber: 'ADMIN',
        department: 'ADMIN',
        year: 'FIRST',
        githubUsername: null,
        avatarUrl: null,
        xp: 9999,
        level: 99,
        role: 'ADMIN',
      },
      ...tokens,
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId)
    if (user) return toPublicUser(user)

    const admin = await adminRepository.findById(userId)
    if (!admin) throw ApiError.notFound('User not found')

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      rollNumber: 'ADMIN',
      department: 'ADMIN',
      year: 'FIRST',
      githubUsername: null,
      avatarUrl: null,
      xp: 9999,
      level: 99,
      role: 'ADMIN',
    }
  },
}
