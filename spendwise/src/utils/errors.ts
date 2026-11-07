// Turns technical errors into short messages a person can act on.
export function friendlyError(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : ''
  const m = message.toLowerCase()

  if (m.includes('invalid login credentials')) return 'The email or password is incorrect.'
  if (m.includes('already registered')) return 'An account with this email already exists. Try signing in.'
  if (m.includes('email not confirmed')) return 'Confirm your email first. Check your inbox for the link.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a minute and try again.'
  if (m.includes('different from the old password')) return 'Choose a password different from your current one.'
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Could not reach the server. Check your internet connection.'
  }
  return message || 'Something went wrong. Please try again.'
}
