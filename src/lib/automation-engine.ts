import type { SearchStep } from "../types";
import { findElement } from "./element-finder";
import {
  waitFor,
  handleFocus,
  handleSetValue,
  handleTriggerEvents,
  handleClick,
  handleWait,
  handleSendKeys,
  handlePaste,
} from "./step-actions";

/**
 * Executes a single step.
 */
async function executeStep(step: SearchStep, query: string): Promise<void> {
  const maxAttempts = step.maxAttempts || 10;
  const retryInterval = step.retryInterval || 300;

  if (step.waitForElement && step.selector) {
    const selector = step.selector;
    await waitFor(() => !!findElement(selector), maxAttempts, retryInterval);
  }

  const elementActions = ["focus", "setValue", "triggerEvents", "click", "sendKeys", "paste"];

  if (elementActions.includes(step.action) && step.selector) {
    const selector = step.selector;
    const found = await waitFor(() => !!findElement(selector), maxAttempts, retryInterval);
    if (!found) {
      console.warn(`[llm-crosser] Element not found for "${step.action}": ${selector}`);
      return;
    }
  }

  switch (step.action) {
    case "focus":
      await handleFocus(step);
      break;
    case "setValue":
      await handleSetValue(step, query);
      break;
    case "triggerEvents":
      await handleTriggerEvents(step);
      break;
    case "click":
      await handleClick(step);
      break;
    case "wait":
      await handleWait(step);
      break;
    case "sendKeys":
      await handleSendKeys(step);
      break;
    case "paste":
      await handlePaste(step, query);
      break;
    case "custom":
      break;
  }
}

/**
 * Main entry point to execute a list of automation steps.
 */
export async function executeSteps(steps: SearchStep[], query: string): Promise<boolean> {
  try {
    for (const step of steps) {
      await executeStep(step, query);
    }
    return true;
  } catch (error) {
    console.error("[llm-crosser] Error executing steps:", error);
    return false;
  }
}
