// Shared between client and server — keep this file plain JS (no types-only
// syntax) so Vite can import it directly from the client without transpilation
// surprises, while the server imports it too (ts-node/tsx handle plain JS fine).

export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
})

export const XP_RULES = Object.freeze({
  JOIN_EVENT: 20,
  ATTEND_EVENT: 40,
  COMPLETE_CHALLENGE: 100,
  WIN_EVENT: 300,
  UPLOAD_PROJECT: 60,
})

// One level per 500 XP. Kept as a single formula (not a lookup table) so it
// never drifts out of sync between client display code and server scoring.
export const XP_PER_LEVEL = 500

export function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpIntoCurrentLevel(xp) {
  return xp % XP_PER_LEVEL
}

export function xpForNextLevel() {
  return XP_PER_LEVEL
}

// criteria keys map 1:1 to Badge.criteria in the DB — the badge engine
// checks these after every XP-affecting action.
export const BADGE_CRITERIA = Object.freeze({
  FIRST_EVENT: 'FIRST_EVENT',
  CODE_WARRIOR: 'CODE_WARRIOR', // first accepted challenge submission
  TOP_CONTRIBUTOR: 'TOP_CONTRIBUTOR', // 5+ accepted challenge submissions
  CREATIVE_MIND: 'CREATIVE_MIND', // 3+ events attended
  XP_100: 'XP_100',
  XP_500: 'XP_500',
  XP_1000: 'XP_1000',
})

export const EVENT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
})

export const REGISTRATION_STATUS = Object.freeze({
  REGISTERED: 'REGISTERED',
  CANCELLED: 'CANCELLED',
  ATTENDED: 'ATTENDED',
  WINNER: 'WINNER',
})

export const SUBMISSION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
})
