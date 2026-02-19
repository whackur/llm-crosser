import type { ContentExtractor } from "../types/site";

export interface ThinkingBlock {
  content: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  contentHtml: string;
  thinking?: ThinkingBlock;
}

export interface ConversationData {
  messages: ConversationMessage[];
}

function queryShadow(root: Element, selector: string): Element | null {
  return root.querySelector(selector) ?? root.shadowRoot?.querySelector(selector) ?? null;
}

function stripExcluded(container: Element, excludeSelectors: string[]): Element {
  const clone = container.cloneNode(true) as Element;
  for (const selector of excludeSelectors) {
    for (const el of Array.from(clone.querySelectorAll(selector))) {
      el.remove();
    }
  }
  return clone;
}

function stripUiArtifacts(container: Element): Element {
  const UI_CLASS_PATTERNS = ["copy", "action", "feedback", "button"];
  for (const el of Array.from(container.querySelectorAll("*"))) {
    const cls = el.className;
    if (typeof cls === "string" && UI_CLASS_PATTERNS.some((p) => cls.toLowerCase().includes(p))) {
      el.remove();
    }
  }
  return container;
}

function extractContentFromContainer(
  container: Element,
  contentSelectors: string[],
  fallbackSelectors: string[],
  excludeSelectors: string[],
): string | null {
  for (const selector of [...contentSelectors, ...fallbackSelectors]) {
    const contentEl = queryShadow(container, selector);
    if (contentEl) {
      return stripUiArtifacts(stripExcluded(contentEl, excludeSelectors)).innerHTML;
    }
  }
  const cleaned = stripUiArtifacts(stripExcluded(container, excludeSelectors));
  const text = cleaned.textContent?.trim();
  if (text) return cleaned.innerHTML;
  return null;
}

function extractThinkingBlock(
  container: Element,
  thinkingSelector: string,
  filters: string[],
): ThinkingBlock | undefined {
  const thinkingEl = queryShadow(container, thinkingSelector);
  if (!thinkingEl) return undefined;

  const clone = thinkingEl.cloneNode(true) as Element;
  for (const filter of filters) {
    for (const el of Array.from(clone.querySelectorAll(filter))) {
      el.remove();
    }
  }

  const content = clone.textContent?.trim();
  return content ? { content } : undefined;
}

function determineRole(
  container: Element,
  index: number,
  userMessageSelector: string | undefined,
): "user" | "assistant" {
  if (userMessageSelector) {
    if (container.matches(userMessageSelector)) return "user";
    if (queryShadow(container, userMessageSelector)) return "user";
    return "assistant";
  }
  return index % 2 === 0 ? "user" : "assistant";
}

export function extractConversation(config: ContentExtractor): ConversationData {
  const result: ConversationData = { messages: [] };

  const containerSelector = config.messageContainer;
  if (!containerSelector) return result;

  const containers = document.querySelectorAll(containerSelector);
  if (containers.length === 0) return result;

  const contentSelectors = config.contentSelectors ?? config.selectors ?? [];
  const fallbackSelectors = config.fallbackSelectors ?? [];
  const excludeSelectors = config.excludeSelectors ?? [];
  const shouldExtractThinking = config.extractThinking ?? false;
  const thinkingSelector = config.thinkingSelector;
  const thinkingBlockFilters = config.thinkingBlockFilters ?? [];

  for (let i = 0; i < containers.length; i++) {
    const container = containers[i] as Element | undefined;
    if (!container) continue;

    if (config.editModeCheck && queryShadow(container, config.editModeCheck)) {
      continue;
    }

    const role = determineRole(container, i, config.userMessageSelector);
    const contentHtml = extractContentFromContainer(
      container,
      contentSelectors,
      fallbackSelectors,
      excludeSelectors,
    );

    if (contentHtml === null) continue;

    const message: ConversationMessage = { role, contentHtml };

    if (shouldExtractThinking && thinkingSelector && role === "assistant") {
      const thinking = extractThinkingBlock(container, thinkingSelector, thinkingBlockFilters);
      if (thinking) {
        message.thinking = thinking;
      }
    }

    result.messages.push(message);
  }

  return result;
}
