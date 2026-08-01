import { prisma } from './config/prisma.js'
import { hashPassword } from './utils/password.js'
import { env } from './config/env.js'
import { BADGE_CRITERIA } from '../../shared/constants.js'

const domains = [
  { name: 'Web Development', slug: 'web-development', icon: '\u{1F3E2}', color: 'blue', description: 'Craft sites and apps with modern frameworks & clean code.' },
  { name: 'AI & Machine Learning', slug: 'ai-ml', icon: '\u{1F916}', color: 'purple', description: 'Train models, explore data, and build intelligent systems.' },
  { name: 'Design', slug: 'design', icon: '\u{1F3A8}', color: 'red', description: 'Shape pixels into experiences that feel alive.' },
  { name: 'Innovation', slug: 'innovation', icon: '\u{1F680}', color: 'gold', description: 'Prototype bold ideas and ship them into the world.' },
  { name: 'Cloud', slug: 'cloud', icon: '\u{2601}\u{FE0F}', color: 'blue', description: 'Deploy, scale, and operate systems in the cloud.' },
  { name: 'Cyber Security', slug: 'cyber-security', icon: '\u{1F512}', color: 'red', description: 'Break things safely, then make them unbreakable.' },
  { name: 'Robotics', slug: 'robotics', icon: '\u{1F9BE}', color: 'gold', description: 'Bring code into the physical world.' },
]

const badges = [
  { name: 'First Event', description: 'Registered for your first VISTA event.', icon: '\u{1F331}', criteria: BADGE_CRITERIA.FIRST_EVENT },
  { name: 'Code Warrior', description: 'Got your first challenge submission accepted.', icon: '\u{2694}\u{FE0F}', criteria: BADGE_CRITERIA.CODE_WARRIOR },
  { name: 'Top Contributor', description: 'Five or more accepted challenge submissions.', icon: '\u{1F3C6}', criteria: BADGE_CRITERIA.TOP_CONTRIBUTOR },
  { name: 'Creative Mind', description: 'Attended three or more events.', icon: '\u{1F3A8}', criteria: BADGE_CRITERIA.CREATIVE_MIND },
  { name: 'Rising Star', description: 'Reached 100 XP.', icon: '\u{2B50}', xpThreshold: 100, criteria: BADGE_CRITERIA.XP_100 },
  { name: 'Veteran', description: 'Reached 500 XP.', icon: '\u{1F396}\u{FE0F}', xpThreshold: 500, criteria: BADGE_CRITERIA.XP_500 },
  { name: 'Legend', description: 'Reached 1000 XP.', icon: '\u{1F451}', xpThreshold: 1000, criteria: BADGE_CRITERIA.XP_1000 },
]

async function main() {
  console.log('Seeding domains...')
  for (const domain of domains) {
    await prisma.domain.upsert({ where: { slug: domain.slug }, update: domain, create: domain })
  }

  console.log('Seeding badges...')
  for (const badge of badges) {
    await prisma.badge.upsert({ where: { name: badge.name }, update: badge, create: badge })
  }

  console.log('Seeding default admin account...')
  const passwordHash = await hashPassword(env.seedAdmin.password)
  await prisma.admin.upsert({
    where: { email: env.seedAdmin.email },
    update: {},
    create: { name: 'VISTA Admin', email: env.seedAdmin.email, password: passwordHash },
  })

  console.log('Seeding secondary admin account...')
  const anukulPasswordHash = await hashPassword('Anukul@2006')
  await prisma.admin.upsert({
    where: { email: 'anukulsangwan56@gmail.com' },
    update: { password: anukulPasswordHash },
    create: { name: 'Anukul Sangwan', email: 'anukulsangwan56@gmail.com', password: anukulPasswordHash },
  })

  console.log('Seed complete.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
