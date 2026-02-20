import type { SearchStep } from "../types";
import { findElement, ElementWithValue } from "./element-finder";
import { setContentEditableValue } from "./contenteditable-handler";

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
