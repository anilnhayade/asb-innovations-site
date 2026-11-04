/** Primary navigation. The Services dropdown lists every service page. */
export interface NavLink {
  label: string;
  href: string;
  icon?: string;
  tag?: string;
}

export const mainNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Contact Us', href: '/contact' },
];

export const servicesNav: NavLink[] = [
  { label: 'Revenue Cycle Management', href: '/services/revenue-cycle-management', icon: 'stethoscope' },
  { label: 'Network Operations (NOC)', href: '/services/noc-management', icon: 'network' },
  { label: 'Security Operations (SOC)', href: '/services/soc-management', icon: 'eye' },
  { label: 'QuickBooks Accounting', href: '/services/quickbooks-accounting', icon: 'calculator' },
  { label: 'Cybersecurity', href: '/services/cybersecurity', icon: 'shield-check' },
  { label: 'Offshore Project Management', href: '/services/offshore-project-management', icon: 'workflow' },
  { label: 'IT Hardware Rental', href: '/services/it-hardware-rental', icon: 'laptop', tag: 'Hardware' },
];

export const footerLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Contact Us', href: '/contact' },
];
