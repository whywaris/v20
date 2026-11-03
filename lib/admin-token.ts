// Minimal shape of a Supabase user that the ADMIN_EMAILS check needs.
type IdentityUser = { identities?: { provider: string; identity_data?: { email?: unknown } }[] | null };

// True only if the user has a Google login whose Google-verified email is in ADMIN_EMAILS (comma-separated).
// Ignoring the account's own email field means an email/password sign-up for the same address can't pass.
export function isWhitelistedGoogleAdmin(user: IdentityUser, adminEmails = process.env.ADMIN_EMAILS || ''): boolean {
  const allowed = adminEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return false;
  return (user.identities ?? []).some((i) => {
    const email = i.identity_data?.email;
    return i.provider === 'google' && typeof email === 'string' && allowed.includes(email.trim().toLowerCase());
  });
}
