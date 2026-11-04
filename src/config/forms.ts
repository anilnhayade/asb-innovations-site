/**
 * Form delivery config. Keys come from environment variables (see .env.example).
 * Web3Forms access keys are public by design; each key is bound to one mailbox,
 * which is how each form routes to the right inbox on a static host.
 */
export const forms = {
  endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || 'https://api.web3forms.com/submit',
  /** Local testing only: simulate success without a network call. */
  mock: import.meta.env.PUBLIC_FORM_MOCK === '1',
  keys: {
    info: import.meta.env.PUBLIC_FORM_KEY_INFO || '',
    noc: import.meta.env.PUBLIC_FORM_KEY_NOC || '',
    hardware: import.meta.env.PUBLIC_FORM_KEY_HARDWARE || '',
  },
} as const;

export type FormKey = keyof typeof forms.keys;

export const hardwareTypes = [
  'Laptops',
  'Desktop computers',
  'Laptops and desktops',
  'Modems / networking equipment',
  'Other',
];
