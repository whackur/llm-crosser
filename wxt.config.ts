import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { version } from "./package.json";

export default defineConfig({
  vite: (_env) => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "LLM Crosser",
    version,
    action: {
      default_icon: {
        16: "icons/icon-16.png",
        32: "icons/icon-32.png",
        48: "icons/icon-48.png",
        128: "icons/icon-128.png",
      },
    },
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    permissions: ["storage", "declarativeNetRequest", "omnibox", "sidePanel"],
    side_panel: {
      default_path: "sidepanel.html",
    },
    host_permissions: [
      "https://chatgpt.com/*",
      "https://gemini.google.com/*",
      "https://grok.com/*",
      "https://chat.qwen.ai/*",
      "https://chat.z.ai/*",
      "https://www.perplexity.ai/*",
      "https://perplexity.ai/*",
    ],
    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'self'; frame-src https://chatgpt.com https://gemini.google.com https://grok.com https://chat.qwen.ai https://chat.z.ai https://www.perplexity.ai https://perplexity.ai;",
    },
    declarative_net_request: {
      rule_resources: [{ id: "ruleset_1", enabled: true, path: "rules.json" }],
    },
    omnibox: { keyword: "llmc" },
    web_accessible_resources: [
      {
        resources: ["icons/*", "site-handlers.json"],
        matches: [
          "https://chatgpt.com/*",
          "https://gemini.google.com/*",
          "https://grok.com/*",
          "https://chat.qwen.ai/*",
          "https://chat.z.ai/*",
          "https://www.perplexity.ai/*",
          "https://perplexity.ai/*",
        ],
      },
    ],
  },
});
