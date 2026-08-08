import type { AccountStatus, BillingCycle, PaymentRecord, TenantPlan, UserAccount } from '../types';

/**
 * This SPA intentionally does not implement identity or billing. Those are
 * security boundaries and must be provided by a server-side integration.
 * Keeping a client-side substitute here would create a production bypass.
 */
const AUTH_CONFIGURATION_MESSAGE =
  'Authentication is not configured. Connect a server-side identity provider before enabling accounts.';
const BILLING_CONFIGURATION_MESSAGE =
  'Checkout is not configured. Connect Stripe through a server-side payment service.';

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = Number(hasMinLength) + Number(hasUppercase && hasLowercase) + Number(hasNumber) + Number(hasSpecial);
  const label: PasswordStrength['label'] = score === 4 ? 'Strong' : score === 3 ? 'Good' : score === 2 ? 'Fair' : 'Weak';
  return { score, label, hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
}

export function validateStrongPassword(password: string) {
  const strength = evaluatePasswordStrength(password);
  const errors: string[] = [];
  if (!strength.hasMinLength) errors.push('at least 12 characters');
  if (!strength.hasUppercase) errors.push('an uppercase letter');
  if (!strength.hasLowercase) errors.push('a lowercase letter');
  if (!strength.hasNumber) errors.push('a number');
  if (!strength.hasSpecial) errors.push('a special character');
  return { isValid: errors.length === 0, ...strength, errors };
}

export interface RegistrationInput {
  fullName: string;
  email: string;
  companyName: string;
  password: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
}

export interface PaymentDetailsInput {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
  billingZip: string;
}

export function getUsers(): UserAccount[] { return []; }
export function saveUsers(_users: UserAccount[]): void { /* server-owned in production */ }
export function getCurrentUser(): UserAccount | null { return null; }
export function setCurrentUser(_user: UserAccount | null): void { /* server-owned in production */ }
export function getPaymentRecords(): PaymentRecord[] { return []; }

export function registerPendingUser(_input: RegistrationInput): { success: boolean; error: string } {
  return { success: false, error: AUTH_CONFIGURATION_MESSAGE };
}

export function authenticateUser(_email: string, _password: string): { success: boolean; user?: UserAccount; error: string } {
  return { success: false, error: AUTH_CONFIGURATION_MESSAGE };
}

export function processStripePayment(_user: UserAccount, _details: PaymentDetailsInput): { success: boolean; error: string } {
  return { success: false, error: BILLING_CONFIGURATION_MESSAGE };
}

export function updateUserAccountStatus(_userId: string, _newStatus: AccountStatus): UserAccount[] {
  return [];
}
