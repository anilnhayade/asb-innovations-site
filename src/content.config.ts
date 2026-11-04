import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = z.object({ title: z.string(), description: z.string() });

const item = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  icon: z.string().optional(),
  tag: z.string().optional(),
  list: z.array(z.string()).optional(),
  after: z.string().optional(),
  points: z
    .array(z.union([z.string(), z.object({ title: z.string().optional(), body: z.string() })]))
    .optional(),
  paragraphs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

const section = z.object({
  type: z.enum(['prose', 'numbered', 'cards', 'bullets', 'comparison', 'services', 'area', 'image']),
  variant: z.string().optional(),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  intro: z.string().optional(),
  lead: z.string().optional(),
  closing: z.string().optional(),
  paragraphs: z.array(z.string()).optional(),
  places: z.array(z.string()).optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  items: z.array(item).optional(),
});

const emailKey = z.enum(['info', 'noc', 'hardware']);

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    slug: z.string(),
    seo,
    banner: z.object({
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      art: z.string(),
      icon: z.string(),
    }),
    brochure: z.string().optional(),
    sections: z.array(section),
    cta: z.object({
      heading: z.string(),
      text: z.string(),
      emailKey,
      formKey: emailKey,
      fields: z.enum(['standard', 'hardware']),
      extra: z.string().optional(),
      brochure: z.string().optional(),
      formTitle: z.string(),
      button: z.object({ label: z.string(), href: z.string() }).optional(),
    }),
  }),
});

export const collections = { services };
