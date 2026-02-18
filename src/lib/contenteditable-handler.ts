function isLexicalEditor(element: HTMLElement): boolean {
  return (
    element.hasAttribute("data-lexical-editor") ||
    element.getAttribute("data-lexical-editor") === "true"
  );
}

function isTiptapEditor(element: HTMLElement): boolean {
  return element.classList.contains("tiptap") || element.classList.contains("ProseMirror");
}

function setLexicalContent(element: HTMLElement, text: string): void {
  const pElements = element.querySelectorAll("p");

  if (pElements.length > 1) {
    for (let i = 1; i < pElements.length; i++) {
      pElements[i]?.remove();
    }
  }

  let p = pElements[0];
  if (!p) {
    p = document.createElement("p");
    element.appendChild(p);
  }
  p.innerHTML = "";

  if (text.trim()) {
    const span = document.createElement("span");
    span.setAttribute("data-lexical-text", "true");
    span.textContent = text;
    p.appendChild(span);
  }
}

function setGenericContentEditable(element: HTMLElement, text: string): void {
  const pElements = element.querySelectorAll("p");

  if (pElements.length > 0) {
    if (pElements.length > 1) {
      for (let i = 1; i < pElements.length; i++) {
        pElements[i]?.remove();
      }
    }
    const p = pElements[0];
    if (p) {
      p.classList.remove("is-empty", "is-editor-empty");
      p.innerText = text;
    }
  } else {
    element.innerHTML = "";
    const p = document.createElement("p");
    p.innerText = text;
    element.appendChild(p);
  }
}

function dispatchEditorEvents(element: HTMLElement, text: string): void {
  element.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: text,
    }),
  );

  element.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: text,
    }),
  );

  element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
  element.dispatchEvent(new CompositionEvent("compositionupdate", { bubbles: true, data: text }));
  element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: text }));

  element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
}

function tryExecCommand(element: HTMLElement, text: string): boolean {
  try {
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return document.execCommand("insertText", false, text);
  } catch {
    return false;
  }
}

function tryPasteSimulation(element: HTMLElement, text: string): void {
  try {
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text);

    element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertFromPaste",
        data: text,
      }),
    );

    element.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  } catch {
    // Paste simulation is a last-resort fallback — non-fatal
  }
}

export function setContentEditableValue(element: HTMLElement, text: string): void {
  element.focus();

  if (isLexicalEditor(element)) {
    setLexicalContent(element, text);
    dispatchEditorEvents(element, text);
    const execSuccess = tryExecCommand(element, text);
    if (!execSuccess && text.trim()) {
      tryPasteSimulation(element, text);
    }
  } else if (isTiptapEditor(element)) {
    // Tiptap/ProseMirror: DOM manipulation only.
    // ProseMirror's MutationObserver detects the change and syncs internal state.
    // Extra events/execCommand/paste would corrupt ProseMirror's transaction state.
    setGenericContentEditable(element, text);
  } else {
    setGenericContentEditable(element, text);
    dispatchEditorEvents(element, text);
    const execSuccess = tryExecCommand(element, text);
    if (!execSuccess && text.trim()) {
      tryPasteSimulation(element, text);
    }
  }
}
