import type { AccountStatus, BillingCycle, PaymentRecord, TenantPlan, UserAccount, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const AUTH_CONFIGURATION_MESSAGE = 'Authentication is unavailable. Contact your administrator if this persists.';
const BILLING_CONFIGURATION_MESSAGE = 'Checkout is not configured. Connect Stripe through a server-side payment service.';
const VALID_ROLES: UserRole[] = ['Super Admin', 'Security Analyst', 'Client Admin', 'Developer', 'Executive Viewer'];

type Membership = { tenant_id: string; role: string };
export type AuthenticatedUser = UserAccount & { tenantId: string };

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
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
}

export interface PaymentDetailsInput { cardNumber: string; expiry: string; cvv: string; cardholderName: string; billingZip: string; }

async function resolveCurrentUser(): Promise<{ user?: AuthenticatedUser; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { error: AUTH_CONFIGURATION_MESSAGE };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return {};

  const { data: membership, error: membershipError } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle<Membership>();

  if (membershipError) return { error: 'Workspace access could not be verified. Contact your administrator.' };
  if (!membership || !VALID_ROLES.includes(membership.role as UserRole)) {
    return { error: 'Your account is authenticated but has not been assigned to a workspace.' };
  }

  const metadata = user.user_metadata ?? {};
  return {
    user: {
      id: user.id,
      tenantId: membership.tenant_id,
      fullName: typeof metadata.full_name === 'string' ? metadata.full_name : user.email?.split('@')[0] || 'User',
      email: user.email || '',
      companyName: typeof metadata.company_name === 'string' ? metadata.company_name : 'VulnWiz Workspace',
      role: membership.role as UserRole,
      status: 'ACTIVE' as AccountStatus,
      createdAt: user.created_at,
      selectedPlan: 'Standard Pro',
      billingCycle: 'monthly',
    },
  };
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const { user } = await resolveCurrentUser();
  return user ?? null;
}

export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: false, error: AUTH_CONFIGURATION_MESSAGE };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: 'Invalid email address or password.' };
  const resolved = await resolveCurrentUser();
  return resolved.user ? { success: true, user: resolved.user } : { success: false, error: resolved.error || AUTH_CONFIGURATION_MESSAGE };
}

export async function registerPendingUser(input: RegistrationInput): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: false, error: AUTH_CONFIGURATION_MESSAGE };
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { full_name: input.fullName, company_name: input.companyName },
    },
  });
  if (error) return { success: false, error: error.message };

  // A non-null session means Supabase Confirm Email is disabled. Do not treat
  // this as a successful verified signup in the UI.
  if (data.session) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'Email confirmation is not enabled. Enable Confirm Email in Supabase before allowing signups.',
    };
  }
  return { success: true };
}

export async function signOut(): Promise<void> { await supabase?.auth.signOut(); }

// Billing and account-state changes remain server-owned.
export function getUsers(): UserAccount[] { return []; }
export function saveUsers(_users: UserAccount[]): void { /* server-owned */ }
export function setCurrentUser(_user: UserAccount | null): void { /* retained for legacy preview callers */ }
export function getPaymentRecords(): PaymentRecord[] { return []; }
export function processStripePayment(_user: UserAccount, _details: PaymentDetailsInput): { success: boolean; error: string } { return { success: false, error: BILLING_CONFIGURATION_MESSAGE }; }
export function updateUserAccountStatus(_userId: string, _newStatus: AccountStatus): UserAccount[] { return []; }
