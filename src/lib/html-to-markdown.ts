import type { ConversationData } from "./content-extractor";
import { convertNode } from "./html-node-converter";

function createParser(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

function collapseWhitespace(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
}

export function htmlToMarkdown(html: string): string {
  const doc = createParser(html);
  const raw = convertNode(doc.body, 0, 0);
  return collapseWhitespace(raw);
}

export function formatConversation(data: ConversationData): string {
  const parts: string[] = [];

  for (const message of data.messages) {
    const md = htmlToMarkdown(message.contentHtml);
    const roleLabel = `**${message.role}**`;

    if (message.thinking) {
      parts.push(`${roleLabel} *(thinking)*: ${message.thinking.content}`);
      parts.push("");
    }

    parts.push(`${roleLabel}: ${md.trim()}`);
    parts.push("\n---\n");
  }

  return collapseWhitespace(parts.join("\n"));
}
