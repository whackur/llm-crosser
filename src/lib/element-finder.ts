export interface ElementWithValue extends HTMLElement {
  value: string;
}

export interface ElementWithDisabled extends HTMLElement {
  disabled: boolean;
}

/**
 * Helper to find an element, supporting string | string[] selectors and Shadow DOM piercing.
 * If selector is an array, returns the first match found.
 * If not found in document, searches in all open shadow roots.
 */
export function findElement(
  selector: string | string[],
  root: Document | ShadowRoot | HTMLElement = document,
): HTMLElement | null {
  const selectors = Array.isArray(selector) ? selector : [selector];

  // 1. Try to find in the current root
  for (const s of selectors) {
    const el = root.querySelector(s);
    if (el instanceof HTMLElement) {
      return el;
    }
  }

  // 2. Shadow DOM piercing: traverse all elements in root to find shadow roots
  // This is a breadth-first search for shadow roots to avoid deep recursion stack issues if possible,
  // but recursive is easier for "find in this subtree".
  // We need to find ALL elements with shadowRoot.

  // Get all elements in the current root.
  // If root is a Document or ShadowRoot, we can use querySelectorAll('*').
  const allElements = root.querySelectorAll("*");

  for (const el of allElements) {
    if (el.shadowRoot) {
      const found = findElement(selector, el.shadowRoot);
      if (found) return found;
    }
  }

  return null;
}
