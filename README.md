# ASB Innovations website

A clean, multi-page static site built with **Astro** (static output) and plain CSS. No UI framework, no backend.

| Page | Route | Form routes to |
| --- | --- | --- |
| Home | `/` | – |
| Revenue Cycle Management | `/services/revenue-cycle-management` | info@ |
| NOC Management | `/services/noc-management` | noc@ |
| SOC Management | `/services/soc-management` | info@ |
| QuickBooks Accounting | `/services/quickbooks-accounting` | info@ |
| Cybersecurity | `/services/cybersecurity` | info@ |
| Offshore Project Management | `/services/offshore-project-management` | info@ |
| IT Hardware Rental | `/services/it-hardware-rental` | hardwarerental@ |
| Contact (+ Company Downloads) | `/contact` | info@ |

Cloud Infrastructure and IT Staffing exist as **home-page sections only** (no dedicated pages, as requested).

---

## 1. Run locally

```bash
npm install
cp .env.example .env        # then fill in the form keys (see section 5)
npm run dev                 # http://localhost:4321
npm run build               # static site -> dist/
npm run preview             # serve dist/ locally
```

Node 18.20+ / 20+ / 22+ works. `npm run build` first runs `scripts/brochure-sizes.mjs`, which records the PDF file sizes shown on the download buttons.

To try the brochure unlock flow without a real form key, put `PUBLIC_FORM_MOCK=1` in `.env`. That simulates a successful submit with no network call. **Never set it in production.**

## 2. Project layout

```
src/
  config/        site.ts (name, emails) · nav.ts · forms.ts (endpoint + env keys) · brochures.ts (brochure map)
  content/
    pages/       home.json · contact.json
    services/    one JSON file per service page (all copy lives here)
  components/    Header · Footer · PageBanner · SectionHeading · ServiceCard · IconRow · CTABanner
                 LeadForm · BrochureDownload · FeatureGrid · ProcessSteps · ComparisonCards · BannerArt · Icon
  layouts/       BaseLayout.astro (SEO head, header/footer)
  pages/         index · contact · 404 · robots.txt.ts · services/[slug].astro
  scripts/       lead.ts (form validation, submission, brochure unlock)
  styles/        tokens.css (design tokens) · global.css
public/
  brochures/     the PDFs (clean slug names)
  images/        logo, favicon sources, og image, illustrations
```

Design tokens (colours, type scale, spacing, radii) are all in `src/styles/tokens.css`.

## 3. Edit content

All copy is in `src/content/`. Components never hard-code long text.

- **Home:** edit `src/content/pages/home.json`.
- **A service page:** edit `src/content/services/<slug>.json`. Each file has `seo`, `banner`, `sections[]`, and `cta`.
  Section `type` values: `prose`, `numbered` (infographic grid or `rows`), `cards`, `bullets`, `comparison`, `services` (cybersecurity-style blocks with Key Features), `area` (service-area note), `image`.
  Blank lines (`\n\n`) inside a text field become separate paragraphs.
- **Emails / site name / nav:** `src/config/site.ts` and `src/config/nav.ts`.

### Add a page

1. Copy an existing file in `src/content/services/` (e.g. `quickbooks-accounting.json`) to `src/content/services/my-service.json` and edit `slug`, `seo`, `banner`, `sections`, `cta`.
   The page is generated automatically at `/services/my-service`.
2. Add it to `servicesNav` in `src/config/nav.ts` (header dropdown and footer).
3. Optional: add a card to `managed.services` in `home.json`.
4. If it has a brochure, see below, then set `"brochure"` and `cta.brochure` to the brochure id.

For a one-off page that doesn't fit the service template, add a normal file under `src/pages/` that uses `BaseLayout`.

## 4. Brochures (gated downloads)

Config: `src/config/brochures.ts`.

**Add or replace a brochure**

- *Replace:* overwrite the file in `public/brochures/` with the same file name and rebuild.
- *Add:* drop the PDF into `public/brochures/` (lowercase-with-hyphens name), then add an entry to the `brochures` array: `{ id, title, file, page, group }`. Use the `id` in the page JSON (`brochure` and `cta.brochure`). Files with the same `group` unlock together (the two Company Downloads share the group `company`).
- Keep each file under GitHub's 100 MB limit. Currently the largest is 10.3 MB.

**Behaviour**

- The CTA form on each mapped page includes a "Download our brochure" prompt. The brochure stays locked until the form submits successfully.
- On success the form is replaced by a thank-you message and a **Download Brochure (PDF)** button showing the file size.
- The unlock is remembered per brochure in `localStorage` (key `asb.unlocked.v1`), so returning visitors on the same device don't refill the form. All storage access is wrapped in try/catch (private mode / blocked storage still works for the current visit).
- The PDF URL is **never in the page HTML**. It lives in the bundled script and is only attached to the button after unlock.
- `/brochures/` is disallowed in `robots.txt`, and PDFs are served with `X-Robots-Tag: noindex, nofollow` (`vercel.json`, plus `public/_headers` for Netlify/Cloudflare).

> **This is a soft gate, not security.** The files are static assets on a public host. Anyone who knows or guesses a `/brochures/<name>.pdf` URL can download it without filling the form. The aim is lead capture, not secrecy. Leads still arrive by email regardless, because the email is sent by the form provider, not by the download. If a PDF is genuinely confidential, don't put it in `public/`.

**Compression:** Company Profile (about 19 MB originally, now 5.9 MB) and Corporate Introduction (about 42 MB originally, now 10.3 MB) were re-compressed by downsampling embedded images to 150 dpi at JPEG quality 82 (PyMuPDF; text and vector art untouched). Pages were compared side by side with the originals at 110 dpi and no visible quality loss was found, so the compressed versions are used. The originals are untouched in `source/brochures/`.

"Offshore Accounting Management Services Brochure - Copy.pdf" was **ignored** and is not in the site. The Cloud Infrastructure and IT Staffing brochures are copied and registered in config but not linked anywhere (no pages).

## 5. Form keys (Web3Forms)

The site is static, so forms post straight from the browser to [Web3Forms](https://web3forms.com).

1. Create **three** access keys at web3forms.com, entering the destination mailbox for each:
   - `info@asbinnovations.com`
   - `noc@asbinnovations.com`
   - `hardwarerental@asbinnovations.com`
2. Set them as environment variables (`.env` locally, Project Settings → Environment Variables on Vercel):

   | Variable | Used by |
   | --- | --- |
   | `PUBLIC_FORM_KEY_INFO` | RCM, SOC, QuickBooks, Cybersecurity, Offshore PM, Contact |
   | `PUBLIC_FORM_KEY_NOC` | NOC page |
   | `PUBLIC_FORM_KEY_HARDWARE` | IT Hardware Rental page |

3. Rebuild/redeploy (the keys are baked in at build time). Web3Forms keys are public by design, so it's fine that they appear in the built site; each is bound to one mailbox on Web3Forms' side.

To use Formspree or another provider, set `PUBLIC_FORM_ENDPOINT`. The request is a JSON POST; adapt `src/scripts/lead.ts` if the payload differs.

If a key is missing, the form shows a clear error with the mailbox address as a fallback and does **not** unlock the brochure.

**Form features:** client-side validation with accessible inline errors; honeypot spam field (`botcheck`; a ticked box silently sends nothing and unlocks nothing); loading, success and error states; a hidden email subject naming the page and the brochure requested, e.g. `Revenue Cycle Management (RCM) – Website enquiry | Brochure requested: RCM Brochure`.

## 6. Deploy to Vercel

1. Push the repo to GitHub/GitLab (this repo is initialised locally but **not pushed**).
2. In Vercel: **Add New → Project → Import** the repository. Framework preset **Astro** is detected. Build command `astro build`, output directory `dist` (already set in `vercel.json`).
3. Add the environment variables from section 5, and `SITE_URL` (e.g. `https://www.asbinnovations.com`) so the sitemap, canonical links and Open Graph URLs use your real domain.
4. Deploy.

### Custom domain

1. Project → **Settings → Domains → Add** your domain.
2. At your DNS provider add what Vercel shows: an `A` record `76.76.21.21` for the apex domain and a `CNAME` for `www` pointing to `cname.vercel-dns.com`. (Or switch the domain to Vercel nameservers.)
3. Wait for verification and the automatic HTTPS certificate, then set `SITE_URL` to the final address and redeploy.

## 7. Quality checks run

- `npm run build` passes (10 pages + sitemap + robots.txt).
- Lighthouse (mobile profile, local preview): Performance 99-100, Accessibility 100, Best Practices 100, SEO 100 on the pages checked (home, RCM, cybersecurity, hardware, contact), CLS 0.
- No horizontal overflow at 360, 390, 768, 1024, 1440 and 1920 px on any page. No console errors.
- Automated browser test of the form-to-download flow on all 7 mapped pages and `/contact` against a mocked endpoint: validation, correct mailbox key per page, subject line, no PDF URL in HTML before submit, unlock and file size shown, returning-visitor path, server-error path, honeypot, and blocked `localStorage`.
- Keyboard: skip link, Services dropdown (Enter/Tab/Escape), visible focus styles, mobile menu.

## 8. What was skipped, assumed, or still to do

**Yellow highlights in `content.pdf`:** every highlighted passage is an editor instruction or a CTA block (e.g. "Banner Image on top", "Create a form to capture…", "make this a hyperlinked button", the "Contact Us Today" CTA paragraphs). None is an old-site content correction, so none was applied as a text change. They were used to build the banners, forms and buttons. Nothing was skipped for being irrelevant to this site.

**Content cleanup applied:** removed the "Sure! Here's an even more detailed version…" paragraph, the duplicate "Cybersecurity Solutions / Protecting Your Digital World" and duplicate Offshore PM headings, the SOC "(Note: …)" aside, all `<…>` instructions and `<<<` markers, and form-instruction lines. Typos fixed: "Services(MSS)" → "Services (MSS)", a missing full stop at the end of the SOC closing paragraph, and the double hyphens (`--`) converted to em dashes.

**Images:** attempted to source Pexels/Unsplash photos, but Pexels' site blocked the automated search request and I did not work around that. Per the brief's fallback, the site uses **original SVG illustrations and gradient banners**, with Lucide icons in the brand colours (see `public/images/CREDITS.md`). To use photos instead: drop optimised WebP files into `public/images/`, point `home.json` (`staffing.image`, `hardware.image`) at them, and replace the banner art in `BannerArt.astro`.

**Small pieces of copy I wrote** (everything else is verbatim from the PDF). Edit freely in the JSON files:
- Banner eyebrows, and short banner subtitles for RCM, NOC and SOC (the PDF had none).
- CTA headings above the form text (e.g. "Book a FREE diagnostic discussion", "Get a FREE diagnostic session", "Submit your requirements").
- The three one-word goal labels on the home page and the hero badges ("24/7, 365 days a year" etc., taken from the PDF text).
- The three short bullet highlights on each SOC comparison card (paraphrased from the paragraph above them).
- The whole `/contact` page: the PDF has no contact-page copy, so it uses only the requested elements (general form, the three emails, Company Downloads) with minimal labels.

**TODO / needs your input**
- [ ] Create the three Web3Forms keys and set the env vars (forms show a "not connected" message until then).
- [ ] Confirm the production domain and set `SITE_URL` (default placeholder: `https://asbinnovations.com`).
- [ ] Contact page copy: add a phone number / address / office hours if wanted (none were supplied).
- [ ] Optional: replace SVG illustrations with licensed photos.
- [ ] Optional: dedicated Cloud Infrastructure and IT Staffing pages. Their brochures are already registered in `brochures.ts`.
- [ ] No privacy policy or terms pages were requested or created. The forms say details are used only to respond to the enquiry; add a policy page if your jurisdiction requires one.
