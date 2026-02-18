# LLM Crosser

Chrome extension that embeds multiple LLM chat sites in a single tab for side-by-side comparison. Type once, query all simultaneously, and compare responses.

## Supported Sites

- ChatGPT
- Gemini
- Grok
- Perplexity
- Qwen
- z.ai

## Features

- **Batch Query** — Send the same prompt to multiple LLMs at once
- **Side-by-Side Comparison** — Flexible grid layout (2-4 columns)
- **Prompt Templates** — Save and reuse frequently used prompts
- **Response Export** — Extract and share conversations as Markdown
- **Search History** — Browse and search past queries
- **Omnibox Integration** — Type `llmc` in the address bar to query directly
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
