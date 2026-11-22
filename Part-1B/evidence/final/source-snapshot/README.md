# Natural-Language Reminder Agent

Node.js 22 CLI for the BITS Pilani AI-Augmented SDLC assignment. It is limited to natural-
language interpretation and does not execute reminders, maintain a database, or send notifications.

## Prerequisites

- Node.js 22
- Ollama 0.40.17
- The `qwen2.5:3b` model

Verify the local runtime:

```bash
curl http://127.0.0.1:11434/api/tags
```

Run tests:

```bash
npm test
```

No credentials or paid API are required. The evaluation runner does not execute the genuine
18-case benchmark until the application integration is implemented.
