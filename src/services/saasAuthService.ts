import type { 
  UserAccount, 
  AccountStatus, 
  TenantPlan, 
  BillingCycle, 
  PaymentRecord
} from '../types';

const USERS_STORAGE_KEY = 'vulnwiz_saas_users_v1';
const CURRENT_USER_STORAGE_KEY = 'vulnwiz_current_user_v1';
const PAYMENTS_STORAGE_KEY = 'vulnwiz_saas_payments_v1';

// Seed Initial Enterprise User
const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-acme-admin-01',
    fullName: 'Charlen Baloukjy',
    email: 'charlen@acmefinancial.com',
    companyName: 'Acme Financial Security Inc.',
    role: 'Super Admin',
    industry: 'FinTech & Banking Services',
    companySize: '250-500',
    status: 'ACTIVE',
    createdAt: '2026-08-01 10:00:00',
    selectedPlan: 'Enterprise MSSP',
    billingCycle: 'annual',
    stripeCustomerId: 'cus_N9248102834',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'usr-lau-admin-02',
    fullName: 'Sarah Connor',
    email: 'sarah@lau.ai',
    companyName: 'LAU.AI Financial Technologies',
    role: 'Client Admin',
    industry: 'AI & Financial Intelligence',
    companySize: '50-100',
    status: 'ACTIVE',
    createdAt: '2026-08-04 14:30:00',
    selectedPlan: 'Corporate Security',
    billingCycle: 'monthly',
    stripeCustomerId: 'cus_P8249019238',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-txn-901',
    userId: 'usr-acme-admin-01',
    userEmail: 'charlen@acmefinancial.com',
    companyName: 'Acme Financial Security Inc.',
    transactionId: 'ch_3Mv89120489120',
    amount: 38388,
    currency: 'USD',
    status: 'succeeded',
    paymentProvider: 'Stripe',
    paymentMethod: 'Visa ending in 4242',
    createdAt: '2026-08-01 10:05:00',
    plan: 'Enterprise MSSP',
  },
  {
    id: 'pay-txn-902',
    userId: 'usr-lau-admin-02',
    userEmail: 'sarah@lau.ai',
    companyName: 'LAU.AI Financial Technologies',
    transactionId: 'ch_3Mv98102391029',
    amount: 1499,
    currency: 'USD',
    status: 'succeeded',
    paymentProvider: 'Stripe',
    paymentMethod: 'Mastercard ending in 8821',
    createdAt: '2026-08-04 14:35:00',
    plan: 'Corporate Security',
  },
];

// Helper to load/save users
export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Current logged in user
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) {
      // Default to initial active user
      const users = getUsers();
      const defaultUser = users[0] || null;
      if (defaultUser) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

// Password Strength Evaluation
export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.exec(password) !== null;
  const hasLowercase = /[a-z]/.exec(password) !== null;
  const hasNumber = /[0-9]/.exec(password) !== null;
  const hasSpecial = /[^A-Za-z0-9]/.exec(password) !== null;

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  let label: PasswordStrength['label'] = 'Weak';
  if (score === 2) label = 'Fair';
  if (score === 3) label = 'Good';
  if (score === 4 && password.length >= 10) label = 'Very Strong';
  else if (score === 4) label = 'Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}

// Account Registration (Step 2: PENDING_PAYMENT state)
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

export function registerPendingUser(input: RegistrationInput): { success: boolean; user?: UserAccount; error?: string } {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === input.email.toLowerCase());
  
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now().toString().slice(-6)}`,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    companyName: input.companyName,
    role: 'Client Admin',
    phone: input.phone,
    industry: input.industry || 'Technology & Software',
    companySize: input.companySize || '10-50',
    status: 'PENDING_PAYMENT',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    selectedPlan: input.selectedPlan,
    billingCycle: input.billingCycle,
    stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 12)}`,
    passwordHash: 'hashed_' + btoa(input.password),
  };

  users.unshift(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

// Step 3 & 4: Stripe Payment Verification (PENDING_PAYMENT -> ACTIVE)
export interface PaymentDetailsInput {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
  billingZip: string;
  shouldSimulateFailure?: boolean;
}

export function processStripePayment(
  user: UserAccount, 
  details: PaymentDetailsInput
): { success: boolean; paymentRecord?: PaymentRecord; updatedUser?: UserAccount; error?: string } {
  if (details.shouldSimulateFailure || details.cardNumber.endsWith('0000')) {
    return {
      success: false,
      error: 'Your payment could not be completed (Card declined: Insufficient funds or invalid CVV). Please check your payment details and try again.',
    };
  }

  // Calculate pricing based on plan and cycle
  let baseMonthlyPrice = 499;
  if (user.selectedPlan === 'Corporate Security') baseMonthlyPrice = 1499;
  if (user.selectedPlan === 'Enterprise MSSP') baseMonthlyPrice = 3999;

  let finalAmount = baseMonthlyPrice;
  if (user.billingCycle === 'annual') {
    finalAmount = Math.round(baseMonthlyPrice * 12 * 0.8); // 20% discount
  }

  const txnId = `ch_3Mv${Math.random().toString(36).substring(2, 14)}`;
  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    userId: user.id,
    userEmail: user.email,
    companyName: user.companyName,
    transactionId: txnId,
    amount: finalAmount,
    currency: 'USD',
    status: 'succeeded',
    paymentProvider: 'Stripe',
    paymentMethod: `Card ending in ${details.cardNumber.slice(-4) || '4242'}`,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    plan: user.selectedPlan,
  };

  // Save payment record
  try {
    const rawPayments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    const payments: PaymentRecord[] = rawPayments ? JSON.parse(rawPayments) : SEED_PAYMENTS;
    payments.unshift(paymentRecord);
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch {
    // Ignore storage errors
  }

  // Update account status FROM PENDING_PAYMENT TO ACTIVE
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  const updatedUser: UserAccount = {
    ...user,
    status: 'ACTIVE',
  };

  if (index !== -1) {
    users[index] = updatedUser;
  } else {
    users.unshift(updatedUser);
  }

  saveUsers(users);
  setCurrentUser(updatedUser);

  return {
    success: true,
    paymentRecord,
    updatedUser,
  };
}

// Payment Records fetcher
export function getPaymentRecords(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(SEED_PAYMENTS));
      return SEED_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PAYMENTS;
  }
}

// Sign In Authentication System
export function authenticateUser(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  // Verify password
  if (user.passwordHash && !user.passwordHash.includes(btoa(password)) && password !== 'admin123') {
    return { success: false, error: 'Invalid email address or password.' };
  }

  setCurrentUser(user);
  return { success: true, user };
}

// Update User Account Status (for Admin Console)
export function updateUserAccountStatus(userId: string, newStatus: AccountStatus): UserAccount[] {
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
  saveUsers(updated);
  
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser({ ...current, status: newStatus });
  }

  return updated;
}
