import type { UserRole, UserAccount } from '../types';
import { getUsers, saveUsers, setCurrentUser } from './saasAuthService';

export interface UserInvitation {
  token: string;
  inviterName: string;
  inviterEmail: string;
  tenantId: string;
  tenantName: string;
  inviteeEmail: string;
  role: UserRole;
  createdAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

const INVITATIONS_STORAGE_KEY = 'vulnwiz_user_invitations_v1';

// Initial seed invitations for demo purposes
const SEED_INVITATIONS: UserInvitation[] = [
  {
    token: 'inv_demo_analyst_123',
    inviterName: 'Charlen Baloukjy',
    inviterEmail: 'charlen@acmefinancial.com',
    tenantId: 't-acme-01',
    tenantName: 'Acme Financial Security Inc.',
    inviteeEmail: 'alex.vance@acmefinancial.com',
    role: 'Security Analyst',
    createdAt: '2026-08-05 12:00:00',
    status: 'pending',
  },
];

export function getInvitations(): UserInvitation[] {
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(SEED_INVITATIONS));
      return SEED_INVITATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_INVITATIONS;
  }
}

export function saveInvitations(invitations: UserInvitation[]): void {
  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
}

export interface CreateInvitationInput {
  inviterName: string;
  inviterEmail: string;
  tenantId: string;
  tenantName: string;
  inviteeEmail: string;
  role: UserRole;
}

export function createInvitation(input: CreateInvitationInput): { invitation: UserInvitation; inviteUrl: string } {
  const token = `inv_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;
  const invitation: UserInvitation = {
    token,
    inviterName: input.inviterName || 'Super Admin',
    inviterEmail: input.inviterEmail,
    tenantId: input.tenantId,
    tenantName: input.tenantName,
    inviteeEmail: input.inviteeEmail.toLowerCase(),
    role: input.role,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: 'pending',
  };

  const invitations = getInvitations();
  invitations.unshift(invitation);
  saveInvitations(invitations);

  const inviteUrl = `${window.location.origin}${window.location.pathname}?inviteToken=${token}`;
  return { invitation, inviteUrl };
}

export function getInvitationByToken(token: string): UserInvitation | null {
  const invitations = getInvitations();
  const found = invitations.find(inv => inv.token === token);
  return found || null;
}

export interface AcceptInvitationInput {
  token: string;
  fullName: string;
  password: string;
}

export function acceptInvitation(input: AcceptInvitationInput): { success: boolean; user?: UserAccount; error?: string } {
  const invitations = getInvitations();
  const invIndex = invitations.findIndex(inv => inv.token === input.token);

  if (invIndex === -1) {
    return { success: false, error: 'Invalid or expired invitation token.' };
  }

  const invitation = invitations[invIndex];
  if (invitation.status === 'accepted') {
    return { success: false, error: 'This invitation has already been accepted.' };
  }

  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === invitation.inviteeEmail.toLowerCase());

  const passwordHash = 'hashed_' + btoa(input.password);
  let acceptedUser: UserAccount;

  if (existingUserIndex !== -1) {
    acceptedUser = {
      ...users[existingUserIndex],
      fullName: input.fullName || users[existingUserIndex].fullName,
      role: invitation.role,
      companyName: invitation.tenantName,
      status: 'ACTIVE',
      passwordHash,
    };
    users[existingUserIndex] = acceptedUser;
  } else {
    acceptedUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      fullName: input.fullName || 'Team Member',
      email: invitation.inviteeEmail.toLowerCase(),
      companyName: invitation.tenantName,
      role: invitation.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      selectedPlan: 'Enterprise MSSP',
      billingCycle: 'annual',
      passwordHash,
    };
    users.unshift(acceptedUser);
  }

  // Update invitation status
  invitations[invIndex] = {
    ...invitation,
    status: 'accepted',
  };

  saveInvitations(invitations);
  saveUsers(users);
  setCurrentUser(acceptedUser);

  return { success: true, user: acceptedUser };
}
