import type { SearchStep } from "../types";
import { findElement, ElementWithValue, ElementWithDisabled } from "./element-finder";
import { setContentEditableValue } from "./contenteditable-handler";

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
 * Handles the 'setValue' action.
 */
export async function handleSetValue(step: SearchStep, query: string): Promise<void> {
  if (!step.selector) return;

  const element = findElement(step.selector);
  if (!element) return;

  const inputType = step.inputType || "textarea";
  const valueToSet = step.customSetValue || query;

  if (inputType === "contenteditable") {
    setContentEditableValue(element as HTMLElement, valueToSet);
  } else if (inputType === "angular") {
    element.focus();
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = valueToSet;
    } else {
      (element as ElementWithValue).value = valueToSet;
    }
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: valueToSet,
      }),
    );
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    element.focus();
  } else {
    // Use native value setter to bypass React/Vue internal value tracking.
    // Frameworks override the value setter on the prototype; calling the native
    // one ensures the DOM value updates AND the framework detects the change.
    if (element instanceof HTMLTextAreaElement) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(element, valueToSet);
      } else {
        element.value = valueToSet;
      }
    } else if (element instanceof HTMLInputElement) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(element, valueToSet);
      } else {
        element.value = valueToSet;
      }
    } else {
      (element as ElementWithValue).value = valueToSet;
    }

    // Dispatch InputEvent (not plain Event) so modern frameworks detect the change.
    // React, Vue, and Angular all check inputType / data on InputEvent.
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: valueToSet,
      }),
    );
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }
}

/**
 * Handles the 'triggerEvents' action.
 */
export async function handleTriggerEvents(step: SearchStep): Promise<void> {
  if (!step.selector || !step.events) return;

  const element = findElement(step.selector);
  if (!element) return;

  for (const eventName of step.events) {
    if (eventName === "input" && step.inputType === "special") {
      element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: (element as ElementWithValue).value ?? element.innerText ?? "",
        }),
      );
    } else {
      element.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true }));
    }
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

/**
 * Handles the 'sendKeys' action.
 */
export async function handleSendKeys(step: SearchStep): Promise<void> {
  if (!step.selector || !step.keys) return;

  const element = findElement(step.selector);
  if (!element) return;

  const keys = step.keys;

  const isCtrl = keys.includes("Ctrl");
  const isShift = keys.includes("Shift");
  const isMeta = keys.includes("Meta") || keys.includes("Command");
  const isAlt = keys.includes("Alt");

  let key = keys;
  if (keys.includes("+")) {
    key = keys.split("+").pop() || "";
  }

  let code = key;
  let keyCode = 0;

  if (key === "Enter") {
    code = "Enter";
    keyCode = 13;
  }

  const eventInit: KeyboardEventInit = {
    key: key,
    code: code,
    keyCode: keyCode,
    which: keyCode,
    ctrlKey: isCtrl,
    shiftKey: isShift,
    metaKey: isMeta,
    altKey: isAlt,
    bubbles: true,
    cancelable: true,
    location: 0,
    repeat: false,
    isComposing: false,
  };

  element.dispatchEvent(new KeyboardEvent("keydown", eventInit));

  const hasModifiers = isCtrl || isShift || isMeta || isAlt;
  if (hasModifiers) {
    element.dispatchEvent(new KeyboardEvent("keyup", eventInit));
  }
}

/**
 * Handles the 'paste' action.
 */
export async function handlePaste(step: SearchStep, query: string): Promise<void> {
  let element: HTMLElement | null = null;

  if (step.selector) {
    element = findElement(step.selector);
  }

  if (!element) {
    element = document.activeElement as HTMLElement | null;
  }

  if (!element) return;

  const text = step.customSetValue || query;

  const dataTransfer = new DataTransfer();
  dataTransfer.setData("text/plain", text);

  const pasteEvent = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    clipboardData: dataTransfer,
  });

  element.dispatchEvent(pasteEvent);
}
