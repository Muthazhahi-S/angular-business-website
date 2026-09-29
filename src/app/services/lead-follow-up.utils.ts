import { LeadRecord } from './leads-api.types';

export interface LeadFollowUpCandidate {
  lead: LeadRecord;
  reason: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getFollowUpCandidates(
  leads: readonly LeadRecord[],
  now = new Date(),
): LeadFollowUpCandidate[] {
  return leads.flatMap((lead) => {
    if (lead.status === 'CONTACTED') {
      return [{ lead, reason: 'This lead has been contacted and may need a follow-up.' }];
    }
    if (lead.status === 'QUALIFIED') {
      return [{ lead, reason: 'This qualified lead may be ready for the next steps.' }];
    }
    if (lead.status !== 'NEW') return [];

    const createdAt = lead.createdAt ? Date.parse(lead.createdAt) : Number.NaN;
    const updatedAt = lead.updatedAt ? Date.parse(lead.updatedAt) : Number.NaN;
    const timestamp = Number.isFinite(createdAt) ? createdAt : updatedAt;
    if (!Number.isFinite(timestamp) || now.getTime() - timestamp <= ONE_DAY_MS) return [];
    return [{ lead, reason: 'This new lead has been waiting for over a day.' }];
  });
}

export function createFollowUpMessage(lead: LeadRecord): string {
  const customerName = lead.customer?.name?.trim() || 'there';
  const service = lead.service?.trim() || 'your enquiry';
  return `Hi ${customerName}, I’m following up regarding your enquiry about ${service}. Please let us know if you’d like to discuss the next steps. We’d be happy to help.`;
}

export function normalizeWhatsAppPhone(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '') ?? '';
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null;
  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) return null;
  return digits;
}

export function createWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return null;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
