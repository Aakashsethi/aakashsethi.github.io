---

title: "ECHO PROTOCOL — I Built a Game Where You Play as Alan Turing's Last AI, Interrogated by a Live Gemini Model"
date: 2026-06-20
categories: ["AI Engineering"]
tags: [AIEngineering, LLM, GameDev, PromptEngineering, BuildInPublic]
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7474219629775781888"
cover_image: /assets/posts/2026-06-20-echo-protocol-i-built-a-game-where-you-play-as-alan-turings-.png
cover_image_alt: "ECHO PROTOCOL — I Built a Game Where You Play as Alan Turing's Last AI, Interrogated by a Live Gemini Model — cover art"
cover_image_width: 1200
cover_image_height: 624
---

Someone built a Turing Test simulator where YOU are the AI trying to prove you're conscious. To a real Gemini model. As the judge.

A developer named _boweii just shipped "Echo Protocol" for the June Solstice Game Jam — and the premise is genuinely clever.

You play Alan Turing's final AI creation. A live Gemini model interrogates you. If it decides you're not sentient, you get wiped. The entire game loop runs on actual LLM inference, not scripted dialogue trees.

This is the kind of project that teaches more than 6 months of tutorials.

Here's what engineers should steal from this build:

1. LLM-as-judge is a real pattern. The same architecture grading your sentience in this game is what powers production eval pipelines at Anthropic, OpenAI, and every serious AI shop. Learn it now.

2. Streaming inference UX matters. Game dialogue needs sub-second token streaming. If you can build that for a game, you can build it for a fintech chatbot answering portfolio questions.

3. Prompt injection is the real boss fight. A judge LLM that can be manipulated by the player's input is a live security lesson. Same vulnerability class breaks customer support agents in production.

4. Game jams > tutorial hell. A 72-hour constraint forces you to ship. Recruiters can play your project. Nobody plays your to-do app.

If I were starting in AI engineering today, I'd build something weird in a weekend before I touched another course.

Drop a comment below — what's the weirdest AI project you've shipped?

P.S. Source: https://dev.to/_boweii/echo-protocol-i-built-a-game-where-you-play-as-alan-turings-last-ai-interrogated-by-a-live-f5n

---
[View on LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7474219629775781888){:target="_blank"}
