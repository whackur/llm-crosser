export interface FloatState {
  active: boolean;
  tabId: number;
  windowId: number;
  originalWindowId: number;
}

const FLOAT_STATE_KEY = "llm-crosser-float-state";

export async function getFloatState(): Promise<FloatState | null> {
  const result = await chrome.storage.local.get(FLOAT_STATE_KEY);
  return (result[FLOAT_STATE_KEY] as FloatState | undefined) ?? null;
}

export async function setFloatState(state: FloatState): Promise<void> {
  await chrome.storage.local.set({ [FLOAT_STATE_KEY]: state });
}

export async function clearFloatState(): Promise<void> {
  await chrome.storage.local.remove(FLOAT_STATE_KEY);
}

export function onFloatStateChanged(callback: (state: FloatState | null) => void): () => void {
  const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
    if (FLOAT_STATE_KEY in changes) {
      const newValue = changes[FLOAT_STATE_KEY]?.newValue as FloatState | undefined;
      callback(newValue ?? null);
    }
  };

  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
