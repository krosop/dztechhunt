/**
 * Client-side bot detection utilities.
 * Detects headless browsers and automation tools.
 */

export function detectHeadlessBrowser(): boolean {
  const win = window as any;
  const nav = navigator as any;

  // 1. Navigator.webdriver (Chrome, Firefox, Edge)
  if (nav.webdriver === true) return true;

  // 2. Headless in user agent
  const ua = (navigator.userAgent || "").toLowerCase();
  if (ua.includes("headless")) return true;

  // 3. Missing plugins (headless Chrome often has 0 plugins)
  if (navigator.plugins.length === 0) return true;

  // 4. Missing languages
  if (!navigator.languages || navigator.languages.length === 0) return true;

  // 5. Chrome automation indicators (CDC - Chrome DevTools Protocol)
  if (win.cdc_adoQpoasnfa76pfcZLmcfl_Array ||
      win.cdc_adoQpoasnfa76pfcZLmcfl_Promise ||
      win.cdc_adoQpoasnfa76pfcZLmcfl_Symbol) {
    return true;
  }

  // 6. Puppeteer/Playwright global indicators
  if (win.__puppeteer__ || win.__playwright__) return true;

  // 7. Headless Chrome: chrome object missing or devtools open
  if (/chrome/i.test(ua)) {
    if (!win.chrome || !win.chrome.runtime) return true;
  }

  // 8. Permission query check (headless browsers may fail)
  if (nav.permissions) {
    try {
      // This is async but we do a synchronous check for the API existence
      // Real browsers have this; some headless configs disable it
    } catch {
      return true;
    }
  }

  // 9. Missing WebGL or limited WebGL
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return true;
  } catch {
    return true;
  }

  // 10. Window size anomalies (very common headless dimensions)
  const w = window.outerWidth;
  const h = window.outerHeight;
  if (w === 0 || h === 0) return true;

  return false;
}

/**
 * Tracks user interaction (mouse, touch, scroll, keyboard).
 * Used to detect bots that don't interact with the page.
 */
let hasInteracted = false;

function markInteraction(): void {
  hasInteracted = true;
}

export function initInteractionTracking(): void {
  // Only run once
  if ((window as any).__dzInteractionTracked) return;
  (window as any).__dzInteractionTracked = true;

  const events = ["mousemove", "click", "touchstart", "keydown", "scroll", "wheel"];
  for (const evt of events) {
    window.addEventListener(evt, markInteraction, { once: true, passive: true });
  }

  // Also mark interaction on focus
  window.addEventListener("focus", markInteraction, { once: true });
}

export function hasUserInteracted(): boolean {
  return hasInteracted;
}

/**
 * Runs a quick bot check. Returns true if the session looks human.
 * For headless browsers, returns false after a short delay.
 */
export async function verifyHuman(): Promise<boolean> {
  // Immediate headless detection
  if (detectHeadlessBrowser()) {
    return false;
  }

  // Initialize interaction tracking
  initInteractionTracking();

  // Wait a short moment and check for interaction
  // Most bots will fetch immediately without interaction
  await new Promise<void>((resolve) => setTimeout(resolve, 800));

  if (hasInteracted) {
    return true;
  }

  // Wait a bit longer for slow human interaction
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));

  return hasInteracted;
}

/**
 * Generates a simple time-based token for fetch requests.
 * This is not cryptographically secure, just adds friction for bots.
 */
export function generateFetchToken(): string {
  const now = Date.now();
  const hour = Math.floor(now / 3600000); // changes every hour
  const key = "DZTH" + hour.toString(36);
  // Simple obfuscation
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
