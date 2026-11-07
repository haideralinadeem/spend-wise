export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Returns an error message, or null when the password is acceptable.
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one letter and one number.'
  }
  return null
}

// True only for real calendar dates written as YYYY-MM-DD (rejects 2025-02-31).
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  if (y < 2000 || y > 2100) return false
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}
