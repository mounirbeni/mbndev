// The site owner's own OpenAI key (Vercel env ADMIN_OPENAI_API_KEY), used by
// the MBN products only for admin accounts that haven't saved a key of their
// own. Buyers always use their own keys.
const prisma = require('./prisma');

/** `user` is req.user (has .role) or a user id. */
async function adminOpenaiKey(user) {
  const key = process.env.ADMIN_OPENAI_API_KEY;
  if (!key || !user) return null;
  const role = typeof user === 'object' ? user.role
    : (await prisma.user.findUnique({ where: { id: String(user) }, select: { role: true } }))?.role;
  return role === 'admin' ? key : null;
}

module.exports = { adminOpenaiKey };
