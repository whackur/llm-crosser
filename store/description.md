# Chrome Web Store Description

> **This file is the single source of truth for the Chrome Web Store listing.**
> Edit here first, then copy the plain-text version (`description.txt`) to the
> [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
>
> Keep the tone user-facing and review-compliant.
> See: [Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)

---

## LLM Crosser: Compare AI Responses Side by Side

Tired of switching between tabs to find the best answer? LLM Crosser lets you ask one question and see how multiple AI services respond — all within a single, organized view.

Unlike other comparison tools, LLM Crosser is fully open source. Your prompts are never routed through an intermediary server — they go directly from your browser to each AI service. The entire source code is publicly available on GitHub, so anyone can verify exactly what the extension does.

### How It Works

Open the LLM Crosser dashboard, type your question, and hit send. The extension loads each AI service in its own secure frame within the same browser tab. Your prompt is automatically delivered to every enabled service, and you can watch all responses appear in real time.

Since each service runs in its own isolated frame, your existing logins and sessions stay intact — you use the same accounts and subscriptions you already have, with no additional API keys or fees.

Currently supported services include ChatGPT, Gemini, Grok, Perplexity, Qwen, and z.ai.

### Core Features

**Batch Prompting**
Send a single prompt to all your enabled services at once. No more copying and pasting between tabs or windows.

**Flexible Grid Layout**
Arrange response panels in 1 to 4 columns. Whether you prefer a focused side-by-side view or a wide overview, the layout adapts to your screen and workflow.

**Prompt Templates**
Save the prompts you use most often and reuse them with a single click. Insert dynamic content using the {query} placeholder to keep your workflow fast.

**Response Export**
Extract any conversation as a Markdown file or copy it to your clipboard. Great for documentation, note-taking, or sharing insights with your team.

**Search History**
Every prompt you send is saved locally. Browse, search, and revisit past conversations whenever you need them.

**Omnibox Quick Launch**
Type "llmc" followed by your question directly in the Chrome address bar. The dashboard opens and your prompt is sent automatically — no extra clicks required.

**Custom Themes**
Personalize the dashboard with six built-in color themes: Midnight, Dawn, Ocean, Forest, Rose, and Mint.

**Multilingual Interface**
The interface is available in seven languages: English, Korean, Japanese, Chinese, French, Russian, and Portuguese.

### Privacy and Open Source

LLM Crosser is free and open source under the GPL-3.0 license. It runs entirely on your local machine:

- No intermediary server — your prompts go directly to each AI service, with nothing in between.
- No data collection — no queries are logged, no conversations are stored externally.
- Fully auditable — the complete source code is available on GitHub for anyone to inspect.

Note: You need your own account for each service you wish to use. This extension embeds third-party websites to streamline your workflow.
