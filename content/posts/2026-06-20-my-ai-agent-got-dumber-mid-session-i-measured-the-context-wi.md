---
title: My AI agent got dumber mid-session. I measured the context window before blaming
  MCP.
date: '2026-06-20'
tags:
- AIEngineering
- LLMOps
- MCP
- ContextEngineering
- SoftwareEngineering
linkedin_url: https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7474159235619074048
cover_image: "/assets/posts/2026-06-20-my-ai-agent-got-dumber-mid-session-i-measured-the-context-wi.png"
cover_image_alt: My AI agent got dumber mid-session. I measured the context window
  before blaming MCP. — cover art
cover_image_width: 1200
cover_image_height: 624
slug: my-ai-agent-got-dumber-mid-session-i-measured-the-context-wi
category: AI Engineering
---

Your AI coding agent isn't broken. It's drowning in its own context.

A dev.to post by @rapls this week documented something I see weekly: an AI agent that doesn't crash, doesn't error, just gets *duller* mid-session.

His instinct was to blame MCP servers. Mine would've been the same. Instead, he measured the actual context window consumption before pointing fingers.

The boring truth: tool-heavy agents burn through context faster than you think. Every MCP call, every file read, every retry — it all stacks. By message 30, the model is reasoning over a polluted window where the original task is buried under 80k tokens of noise.

Here's what nobody tells you:

1. **Measure before you blame.** Log token counts per turn. If you're not instrumenting context usage, you're debugging blind. Same discipline as observability in any distributed system.

2. **Treat context like RAM, not disk.** Cheap to fill, expensive to reason over. Prune aggressively. Summarize tool outputs before they re-enter the loop.

3. **Evals catch drift, vibes don't.** Run the same prompt at turn 5 and turn 50. If quality drops, your agent has a context problem, not an intelligence problem.

4. **MCP isn't the villain.** Unbounded tool output is. Cap response sizes at the server boundary — same way you'd cap a SQL result set in a fintech pipeline.

The next decade of AI engineering is context engineering.

Follow for daily posts.

P.S. Source: https://dev.to/rapls/my-ai-agent-got-dumber-mid-session-i-measured-the-context-window-before-blaming-mcp-4c3l

---
[View on LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7474159235619074048){:target="_blank"}
