import sizes from './brochure-sizes.generated.json';

/**
 * Brochure registry. Files live in /public/brochures.
 *
 * - `page`  : the page whose form unlocks it (null = registered, not linked yet)
 * - `group` : the unlock group. One successful submission unlocks every file in the group.
 *
 * This module is imported by the client form script, so the PDF URLs live in a
 * bundled JS file and are never printed into the page HTML before submission.
 * It is a soft gate - see the README.
 */
export interface Brochure {
  id: string;
  title: string;
  file: string;
  page: string | null;
  group: string;
}

export const brochures: Brochure[] = [
  { id: 'rcm', title: 'RCM Brochure', file: 'rcm-brochure.pdf', page: '/services/revenue-cycle-management', group: 'rcm' },
  { id: 'noc', title: 'Network Operations Center Brochure', file: 'noc-brochure.pdf', page: '/services/noc-management', group: 'noc' },
  { id: 'soc', title: 'Security Operations Center Brochure', file: 'soc-brochure.pdf', page: '/services/soc-management', group: 'soc' },
  { id: 'quickbooks', title: 'Offshore Accounting Management Services Brochure', file: 'quickbooks-accounting-brochure.pdf', page: '/services/quickbooks-accounting', group: 'quickbooks' },
  { id: 'cybersecurity', title: 'Cybersecurity Solutions Brochure', file: 'cybersecurity-brochure.pdf', page: '/services/cybersecurity', group: 'cybersecurity' },
  { id: 'offshore-pm', title: 'Offshore Project Management Brochure', file: 'offshore-project-management-brochure.pdf', page: '/services/offshore-project-management', group: 'offshore-pm' },
  { id: 'hardware', title: 'IT Hardware Sales & Rental Brochure', file: 'it-hardware-rental-brochure.pdf', page: '/services/it-hardware-rental', group: 'hardware' },
  // Company downloads (shown on /contact, unlocked together)
  { id: 'company-profile', title: 'Company Profile', file: 'company-profile.pdf', page: '/contact', group: 'company' },
  { id: 'corporate-introduction', title: 'Corporate Introduction', file: 'corporate-introduction.pdf', page: '/contact', group: 'company' },
  // Registered but not linked anywhere yet (no pages for these)
  { id: 'cloud', title: 'Cloud Infrastructure Solution Brochure', file: 'cloud-infrastructure-brochure.pdf', page: null, group: 'cloud' },
  { id: 'staffing', title: 'IT Staffing Brochure', file: 'it-staffing-brochure.pdf', page: null, group: 'staffing' },
];

export const BROCHURE_BASE = '/brochures/';

export function brochuresForGroup(group: string): Brochure[] {
  return brochures.filter((b) => b.group === group);
}

export function brochureUrl(b: Brochure): string {
  return BROCHURE_BASE + b.file;
}

export function brochureBytes(b: Brochure): number {
  return (sizes as Record<string, number>)[b.file] ?? 0;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function brochureSize(b: Brochure): string {
  return formatBytes(brochureBytes(b));
}
