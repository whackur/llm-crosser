import type { SiteResult } from "../types/history";

const POLL_DELAYS_MS = [5000, 12000];
const COLLECT_TIMEOUT_MS = 2000;

interface CaptureOptions {
  sites: Array<{ name: string; url: string }>;
  onCaptured: (siteResults: SiteResult[]) => void;
}

const normalizeHost = (hostname: string): string => hostname.toLowerCase().replace(/^www\./, "");

function matchIframeToSite(iframe: HTMLIFrameElement, siteUrl: string): boolean {
  try {
    const iframeHost = normalizeHost(new URL(iframe.src).hostname);
    const siteHost = normalizeHost(new URL(siteUrl).hostname);
    return (
      iframeHost === siteHost ||
      iframeHost.endsWith(`.${siteHost}`) ||
      siteHost.endsWith(`.${iframeHost}`)
    );
  } catch {
    return false;
  }
}

function requestUrlsFromIframes(sites: Array<{ name: string; url: string }>): void {
  const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
  for (const iframe of iframes) {
    for (const site of sites) {
      if (matchIframeToSite(iframe, site.url)) {
        iframe.contentWindow?.postMessage({ type: "GET_URL_VIA_POST", siteName: site.name }, "*");
        break;
      }
    }
  }
}

export function startConversationUrlCapture({ sites, onCaptured }: CaptureOptions): () => void {
  const collectedUrls = new Map<string, string>();
  const timers: ReturnType<typeof setTimeout>[] = [];

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type !== "CURRENT_URL") return;
    const { siteName, url } = event.data as { siteName?: string; url?: string };
    if (siteName && url) {
      collectedUrls.set(siteName, url);
    }
  };

  window.addEventListener("message", handleMessage);

  for (const delay of POLL_DELAYS_MS) {
    timers.push(setTimeout(() => requestUrlsFromIframes(sites), delay));

    timers.push(
      setTimeout(() => {
        const results: SiteResult[] = sites.map((site) => ({
          siteName: site.name,
          conversationUrl: collectedUrls.get(site.name),
        }));
        onCaptured(results);
      }, delay + COLLECT_TIMEOUT_MS),
    );
  }

  return () => {
    window.removeEventListener("message", handleMessage);
    for (const timer of timers) clearTimeout(timer);
  };
}
