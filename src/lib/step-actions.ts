import type { SearchStep } from "../types";
import { findElement, ElementWithDisabled } from "./element-finder";

/**
 * Waits for a condition to be true, polling every `interval` ms up to `maxAttempts`.
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  maxAttempts: number = 10,
  interval: number = 300,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await condition()) return true;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * Handles the 'focus' action.
 */
export async function handleFocus(step: SearchStep): Promise<void> {
  if (!step.selector) return;

  const element = findElement(step.selector);
  if (element) {
    element.focus();
  }
}

/**
 * Handles the 'click' action.
 */
export async function handleClick(step: SearchStep): Promise<void> {
  if (!step.selector) return;

  const element = findElement(step.selector);
  if (!element) return;

  if (step.retryOnDisabled) {
    const maxAttempts = step.maxAttempts || 10;
    const retryInterval = step.retryInterval || 300;
    await waitFor(() => !(element as ElementWithDisabled).disabled, maxAttempts, retryInterval);
  }

  element.click();
}

/**
 * Handles the 'wait' action.
 */
export async function handleWait(step: SearchStep): Promise<void> {
  if (step.duration) {
    await new Promise((resolve) => setTimeout(resolve, step.duration));
  }
}

// Re-exports from input-actions.ts for backward compatibility
export { handleSetValue, handlePaste } from "./input-actions";

// Re-exports from keyboard-actions.ts for backward compatibility
export { handleSendKeys, handleTriggerEvents } from "./keyboard-actions";
