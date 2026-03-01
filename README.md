# LLM Crosser

Ask once, compare everywhere. A Chrome extension that queries multiple LLM chat sites simultaneously and displays responses side by side — with **no intermediary servers** and **fully open-source** code you can audit yourself.

## Supported Sites

- ChatGPT
- Gemini
- Grok
- Perplexity
- Qwen
- z.ai

## Why LLM Crosser?

Most multi-LLM tools claim to be private, but their source code is closed — you have no way to verify what happens to your prompts. LLM Crosser is different:

- **No intermediary server** — Your prompts travel directly from the browser to each AI site. Nothing is proxied, relayed, or logged by a middleman.
- **Fully open source (GPL-3.0)** — Every line of code is on GitHub. Audit it, fork it, contribute to it.
- **No API keys, no extra cost** — You use your existing accounts and subscriptions as-is. No per-token charges, no separate billing.
- **Single tab, zero clutter** — All AI responses live in one organized dashboard, not scattered across dozens of browser tabs.

## Chrome Web Store

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/gkajapkjkhnfeciamkpgkhckjdenhagj)](https://chromewebstore.google.com/detail/LLM%20Crosser/gkajapkjkhnfeciamkpgkhckjdenhagj)

> For the full store listing description, see [`store/description.md`](store/description.md).

## Features

- **Batch Query** — Send the same prompt to multiple LLMs at once
- **Side-by-Side Comparison** — Flexible grid layout (1-4 columns)
- **Prompt Templates** — Save and reuse prompts with `{query}` placeholders
- **Response Export** — Extract conversations as Markdown or copy to clipboard
- **Search History** — Browse and revisit past queries, restore full sessions
- **Omnibox Integration** — Type `llmc` in the address bar to query directly
- **Custom Themes** — 6 built-in themes (Midnight, Dawn, Ocean, Forest, Rose, Mint)
- **Multi-language** — English, Korean, Japanese, Chinese, French, Russian, Portuguese

## Getting Started

```bash
pnpm install
pnpm dev        # Development mode with hot reload
pnpm build      # Production build
pnpm zip        # Package for Chrome Web Store
```

## Disclaimer

> **WARNING: Terms of Service Violation**
>
> This extension operates by embedding third-party LLM websites (ChatGPT, Gemini, Grok, Perplexity, etc.) within iframes and programmatically injecting queries into their interfaces. This behavior **may violate the Terms of Service** of one or more of these platforms, including but not limited to:
>
> - Automated access or scraping restrictions
> - Iframe embedding prohibitions (bypassing `X-Frame-Options` and CSP headers)
> - Programmatic interaction with the service without API authorization
>
> **Use this extension at your own risk.** The authors are not responsible for any consequences arising from the use of this tool, including but not limited to account suspension, service restrictions, or legal action by the affected platforms.
>
> This project is intended for **personal use and educational purposes only**.

## License

[GPL-3.0](LICENSE)
