/**
 * Lead forms + brochure unlock (client side).
 *
 * Flow: validate -> POST JSON to the form endpoint (Web3Forms) -> on success, unlock the
 * brochure group, remember it in localStorage, and swap the form for a thank-you + download button.
 *
 * Note: the brochure gate is a SOFT gate. PDF URLs live in this bundled script (not in the HTML),
 * but anyone who knows a /brochures/... URL can still fetch the file. Leads arrive by email regardless.
 */
import { brochuresForGroup, brochureUrl } from '../config/brochures';

const STORAGE_KEY = 'asb.unlocked.v1';
const memory = new Set<string>(); // fallback when storage is blocked

function readStore(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isUnlocked(group: string): boolean {
  return memory.has(group) || group in readStore();
}

function remember(group: string): void {
  memory.add(group);
  try {
    const store = readStore();
    store[group] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable (private mode, blocked) - memory fallback is enough for this visit */
  }
}

/** Fill in download links for a group and flip every matching download block to "unlocked". */
function revealDownloads(group: string): void {
  const files = new Map(brochuresForGroup(group).map((b) => [b.id, b]));
  document.querySelectorAll<HTMLElement>(`[data-brochure-group="${group}"]`).forEach((block) => {
    block.querySelectorAll<HTMLElement>('[data-brochure-id]').forEach((li) => {
      const file = files.get(li.dataset.brochureId ?? '');
      const link = li.querySelector<HTMLAnchorElement>('[data-brochure-link]');
      if (!file || !link) return;
      link.href = brochureUrl(file);
      link.setAttribute('download', file.file);
      link.hidden = false;
      li.querySelector<HTMLElement>('[data-brochure-locked]')?.setAttribute('hidden', '');
    });
    block.dataset.state = 'unlocked';
  });
}

function showSuccess(root: HTMLElement, opts: { returning?: boolean; focus?: boolean } = {}): void {
  const group = root.dataset.group ?? '';
  const panel = root.querySelector<HTMLElement>('[data-lead-panel]');
  const success = root.querySelector<HTMLElement>('[data-lead-success]');
  if (!panel || !success) return;
  panel.hidden = true;
  success.hidden = false;
  const title = success.querySelector('[data-lead-success-title]');
  const text = success.querySelector('[data-lead-success-text]');
  if (opts.returning && title && text) {
    title.textContent = 'Welcome back!';
    text.textContent = group
      ? 'You have already submitted your details on this device, so your download is ready.'
      : 'You have already contacted us from this device.';
  }
  if (group) revealDownloads(group);
  if (opts.focus) success.focus();
}

/* ------------------------------------------------------------------ validation */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(form: HTMLFormElement): boolean {
  let firstBad: HTMLElement | null = null;
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]').forEach((el) => {
    const value = el.value.trim();
    const label = form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent?.trim() ?? 'This field';
    let msg = '';
    if (!value) msg = el instanceof HTMLSelectElement ? `Please select an option.` : `Please enter your ${label.toLowerCase()}.`;
    else if (el.type === 'email' && !EMAIL_RE.test(value)) msg = 'Please enter a valid email address.';
    const errEl = form.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`);
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (errEl) {
        errEl.id = errEl.id || `${el.id}-err`;
        errEl.textContent = msg;
        errEl.hidden = false;
        el.setAttribute('aria-describedby', errEl.id);
      }
      firstBad ??= el;
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
      if (errEl) errEl.hidden = true;
    }
  });
  (firstBad as HTMLElement | null)?.focus();
  return !firstBad;
}

/* ------------------------------------------------------------------ submit */

function setLoading(root: HTMLElement, on: boolean): void {
  const btn = root.querySelector<HTMLButtonElement>('[data-lead-submit]');
  root.dataset.loading = on ? 'true' : 'false';
  if (!btn) return;
  btn.disabled = on;
  btn.setAttribute('aria-busy', String(on));
  const label = btn.querySelector('.lead__submit-label');
  if (label) {
    if (on) {
      btn.dataset.label = label.textContent ?? '';
      label.textContent = 'Sending…';
    } else if (btn.dataset.label) {
      label.textContent = btn.dataset.label;
    }
  }
}

function showError(root: HTMLElement, message: string): void {
  const box = root.querySelector<HTMLElement>('[data-lead-error]');
  if (!box) return;
  box.textContent = message;
  box.hidden = false;
}

async function submit(root: HTMLElement, form: HTMLFormElement): Promise<void> {
  const errorBox = root.querySelector<HTMLElement>('[data-lead-error]');
  if (errorBox) errorBox.hidden = true;
  if (!validate(form)) return;

  const group = root.dataset.group ?? '';
  const mailbox = root.dataset.mailbox ?? '';
  const data = new FormData(form);

  // Honeypot ticked -> a bot. Pretend it worked, send nothing, unlock nothing.
  if (data.get('botcheck')) {
    root.querySelector<HTMLElement>('[data-lead-panel]')!.hidden = true;
    root.querySelector<HTMLElement>('[data-lead-success]')!.hidden = false;
    return;
  }

  const payload: Record<string, string> = {
    access_key: root.dataset.key ?? '',
    subject: root.dataset.subject ?? 'Website enquiry',
    from_name: 'ASB Innovations website',
    page: root.dataset.page ?? '',
    page_url: location.href,
    brochure_requested: group ? brochuresForGroup(group).map((b) => b.title).join(', ') : 'none',
    replyto: String(data.get('email') ?? ''),
  };
  data.forEach((v, k) => {
    if (k !== 'botcheck' && typeof v === 'string' && v.trim()) payload[k] = v.trim();
  });

  const mock = root.dataset.mock === '1';
  if (!mock && !payload.access_key) {
    showError(root, `This form is not connected yet. Please email us directly at ${mailbox}.`);
    return;
  }

  setLoading(root, true);
  try {
    if (mock) {
      await new Promise((r) => setTimeout(r, 500));
    } else {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(root.dataset.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));
      const json = await res.json().catch(() => ({}) as { success?: boolean; message?: string });
      if (!res.ok || json.success === false) throw new Error(json.message || `Request failed (${res.status})`);
    }
    if (group) remember(group);
    showSuccess(root, { focus: true });
  } catch (err) {
    const offline = err instanceof DOMException && err.name === 'AbortError';
    showError(
      root,
      `${offline ? 'The request timed out.' : 'Sorry, we could not send your enquiry.'} Please try again, or email us directly at ${mailbox}.`,
    );
  } finally {
    setLoading(root, false);
  }
}

/* ------------------------------------------------------------------ init */

function init(): void {
  document.querySelectorAll<HTMLElement>('[data-lead]').forEach((root) => {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    const group = root.dataset.group ?? '';
    const form = root.querySelector<HTMLFormElement>('[data-lead-form]');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      void submit(root, form);
    });
    // Clear a field's error as soon as the user edits it
    form?.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.getAttribute?.('aria-invalid') === 'true') {
        el.removeAttribute('aria-invalid');
        form.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`)?.setAttribute('hidden', '');
      }
    });
    if (group && isUnlocked(group)) showSuccess(root, { returning: true });
  });

  // Stand-alone download blocks (e.g. Company Downloads on /contact)
  document.querySelectorAll<HTMLElement>('[data-brochure-group]').forEach((block) => {
    const group = block.dataset.brochureGroup ?? '';
    if (group && isUnlocked(group)) revealDownloads(group);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
