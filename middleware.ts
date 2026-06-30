export const config = {
  matcher: ["/data/products.json", "/data/:path*"],
};

const BLOCKED_UA = [
  "curl", "wget", "python", "java", "scrapy", "axios", "httpx",
  "headless", "selenium", "puppeteer", "playwright", "zgrab",
  "masscan", "nikto", "gobuster", "dirb", "wfuzz",
  "postman", "insomnia", "burp", "hopper",
  "facebookexternalhit", "slackbot", "twitterbot", "linkedinbot",
  "telegrambot", "discordbot", "whatsapp",
  "ahrefs", "semrush", "mj12bot", "dotbot", "rogerbot",
  "blexbot", "seznambot", "mauibot", "petalbot",
  "sogou", "exabot", "gigabot", "naverbot", "yeti",
  "screaming", "python-requests", "aiohttp", "urllib",
  "httpclient", "go-http", "fasthttp", "node-fetch", "undici",
  "libwww", " mechanize", "phantom", "slimer", "casper",
  "crawler", "spider", "bot/", "bot ", "bot-",
];

export default function middleware(request: Request): Response | undefined {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  // 1. Block known bot/scraper user agents
  for (const b of BLOCKED_UA) {
    if (ua.includes(b)) {
      return new Response("Forbidden", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Bot-Blocked": "1",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  // 2. Require X-Requested-With or X-Data-Token header (set by our frontend)
  const xRequestedWith = request.headers.get("x-requested-with");
  const xDataToken = request.headers.get("x-data-token");
  const hasValidHeader =
    (xRequestedWith && xRequestedWith.toLowerCase() === "xmlhttprequest") ||
    (xDataToken && xDataToken.length >= 4 && xDataToken.length <= 16);

  if (!hasValidHeader) {
    return new Response("Forbidden", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
        "X-Requested-With-Required": "1",
        "Cache-Control": "no-store",
      },
    });
  }

  // 3. Check for proper browser headers (Sec-Fetch-Mode is sent by modern browsers)
  const secFetchMode = request.headers.get("sec-fetch-mode");
  if (secFetchMode && secFetchMode !== "cors" && secFetchMode !== "no-cors") {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  // 4. Block cross-origin requests (bots scraping from other domains)
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  // 5. Block empty/missing Accept header (most browsers send this)
  const accept = request.headers.get("accept");
  if (!accept) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  // Pass through — legitimate browser request
}
