const UI_ARTIFACT_PATTERNS = ["copy", "action", "feedback", "button"];

function isUiArtifact(el: Element): boolean {
  const cls = el.className;
  if (typeof cls !== "string") return false;
  const lower = cls.toLowerCase();
  return UI_ARTIFACT_PATTERNS.some((p) => lower.includes(p));
}

function extractLanguageFromClass(el: Element): string {
  const cls = el.className || "";
  const match = cls.match(/(?:language-|lang-)(\w+)/);
  if (match && match[1]) return match[1];
  const hljsMatch = cls.match(/hljs\s+language-(\w+)/);
  return hljsMatch && hljsMatch[1] ? hljsMatch[1] : "";
}

function convertTable(tableEl: Element): string {
  const rows: string[][] = [];
  const headerCells: string[] = [];

  const thead = tableEl.querySelector("thead");
  if (thead) {
    const headerRow = thead.querySelector("tr");
    if (headerRow) {
      for (const th of Array.from(headerRow.querySelectorAll("th, td"))) {
        headerCells.push(convertNode(th, 0, 0).trim());
      }
    }
  }

  const tbody = tableEl.querySelector("tbody") ?? tableEl;
  for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
    if (thead && tr.closest("thead")) continue;
    const cells: string[] = [];
    for (const td of Array.from(tr.querySelectorAll("td, th"))) {
      cells.push(convertNode(td, 0, 0).trim());
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (headerCells.length === 0 && rows.length > 0) {
    headerCells.push(...rows.shift()!);
  }

  if (headerCells.length === 0) return "";

  const colCount = Math.max(headerCells.length, ...rows.map((r) => r.length));
  const padRow = (cells: string[]): string[] => {
    const padded = [...cells];
    while (padded.length < colCount) padded.push("");
    return padded;
  };

  const headerLine = `| ${padRow(headerCells).join(" | ")} |`;
  const separatorLine = `| ${padRow(headerCells)
    .map(() => "---")
    .join(" | ")} |`;
  const bodyLines = rows.map((row) => `| ${padRow(row).join(" | ")} |`);

  return [headerLine, separatorLine, ...bodyLines].join("\n");
}

export function convertNode(node: Node, listDepth: number, orderedIndex: number): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  if (isUiArtifact(el)) return "";

  const tag = el.tagName.toLowerCase();
  const children = (): string =>
    Array.from(el.childNodes)
      .map((child) => convertNode(child, listDepth, 0))
      .join("");

  switch (tag) {
    case "h1":
      return `\n\n# ${children().trim()}\n\n`;
    case "h2":
      return `\n\n## ${children().trim()}\n\n`;
    case "h3":
      return `\n\n### ${children().trim()}\n\n`;
    case "h4":
      return `\n\n#### ${children().trim()}\n\n`;
    case "h5":
      return `\n\n##### ${children().trim()}\n\n`;
    case "h6":
      return `\n\n###### ${children().trim()}\n\n`;

    case "strong":
    case "b":
      return `**${children()}**`;

    case "em":
    case "i":
      return `*${children()}*`;

    case "code": {
      if (el.parentElement?.tagName.toLowerCase() === "pre") {
        return children();
      }
      return `\`${children()}\``;
    }

    case "pre": {
      const codeEl = el.querySelector("code");
      if (codeEl) {
        if (isUiArtifact(codeEl)) return "";
        const lang = extractLanguageFromClass(codeEl);
        const codeText = codeEl.textContent ?? "";
        return `\n\n\`\`\`${lang}\n${codeText}\n\`\`\`\n\n`;
      }
      const preText = el.textContent ?? "";
      return `\n\n\`\`\`\n${preText}\n\`\`\`\n\n`;
    }

    case "ul":
      return (
        "\n" +
        Array.from(el.children)
          .map((li) => convertNode(li, listDepth + 1, 0))
          .join("") +
        "\n"
      );

    case "ol":
      return (
        "\n" +
        Array.from(el.children)
          .map((li, idx) => convertNode(li, listDepth + 1, idx + 1))
          .join("") +
        "\n"
      );

    case "li": {
      const indent = "  ".repeat(Math.max(0, listDepth - 1));
      const prefix = orderedIndex > 0 ? `${orderedIndex}. ` : "- ";
      const content = Array.from(el.childNodes)
        .map((child) => convertNode(child, listDepth, 0))
        .join("");
      return `${indent}${prefix}${content.trim()}\n`;
    }

    case "a": {
      const href = el.getAttribute("href") ?? "";
      const text = children().trim();
      return href ? `[${text}](${href})` : text;
    }

    case "img": {
      const alt = el.getAttribute("alt") ?? "";
      const src = el.getAttribute("src") ?? "";
      return `![${alt}](${src})`;
    }

    case "br":
      return "\n";

    case "p":
      return `\n\n${children().trim()}\n\n`;

    case "blockquote": {
      const inner = children().trim();
      const lines = inner.split("\n").map((line) => `> ${line}`);
      return `\n\n${lines.join("\n")}\n\n`;
    }

    case "table":
      return `\n\n${convertTable(el)}\n\n`;

    case "div":
    case "span":
    case "section":
    case "article":
    case "main":
    case "aside":
    case "header":
    case "footer":
    case "nav":
      return children();

    case "hr":
      return "\n\n---\n\n";

    case "sup":
      return children();

    case "sub":
      return children();

    case "del":
    case "s":
      return `~~${children()}~~`;

    case "input":
    case "textarea":
    case "select":
    case "form":
    case "label":
    case "fieldset":
    case "legend":
    case "datalist":
    case "output":
    case "progress":
    case "meter":
    case "details":
    case "summary":
    case "dialog":
    case "menu":
    case "menuitem":
    case "script":
    case "style":
    case "noscript":
    case "iframe":
    case "object":
    case "embed":
    case "video":
    case "audio":
    case "source":
    case "canvas":
    case "svg":
      return "";

    default:
      return children();
  }
}
