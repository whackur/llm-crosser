import type { SearchStep } from "../types";
import { findElement, ElementWithValue } from "./element-finder";

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
