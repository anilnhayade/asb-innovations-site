/** Global site settings. Change copy-independent facts here. */
export const site = {
  name: 'ASB Innovations',
  legalName: 'ASB Innovations',
  tagline: 'Innovate • Integrate • Accelerate',
  description:
    'ASB Innovations delivers managed IT services, cybersecurity, cloud infrastructure, IT staffing and hardware rental from Mumbai, India.',
  locale: 'en_IN',
  /** Fallback Open Graph image (original logo on white), relative to /public */
  ogImage: '/images/og-default.jpg',
  emails: {
    info: 'info@asbinnovations.com',
    noc: 'noc@asbinnovations.com',
    hardware: 'hardwarerental@asbinnovations.com',
  },
  serviceArea: ['Mumbai Metropolitan Region', 'Thane District', 'Navi Mumbai'],
} as const;

export type EmailKey = keyof typeof site.emails;
