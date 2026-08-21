---

title: "Agentic RAG — It’s an Architectural Shift, Not an Upgrade"
date: 2026-06-02
categories: ["AI Engineering"]
tags: [AIEngineering, RAG, AgenticAI, LLM, ProductionAI, SoftwareEngineering, MachineLearning]
author_profile: true
read_time: true
share: true
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7467620205540802561"
cover_image: /assets/posts/2026-06-02-agentic-rag-its-an-architectural-shift-not-an-upgrade.png
cover_image_alt: 'Agentic RAG — It’s an Architectural Shift, Not an Upgrade — cover art'
cover_image_width: 1200
cover_image_height: 624
---

Your RAG pipeline is already obsolete. I don't mean that as clickbait — I mean it architecturally. The retrieve-then-generate pattern that defined 2023 has quietly been replaced by something fundamentally different, and most engineers I talk to are still shipping the old design into production. They're hitting the same walls I hit building Tnufa.ai, and reaching for the same fixes that don't work: better prompts, bigger embedding models, more chunks. None of that addresses the real problem, which is that a fixed pipeline cannot answer a question that requires reasoning about what to retrieve.

## Why Vanilla RAG Breaks in Production

The classic RAG flow is four steps:

1. User asks a question
2. Embed the query, retrieve top-K chunks via vector similarity
3. Stuff chunks into the prompt
4. Generate an answer

This works beautifully in demos. It works fine for "summarize this document" or "what does our policy say about X." It collapses the moment your query requires:

- **Multiple retrieval steps.** "Compare our Q2 risk exposure to last year" needs two retrievals, not one.
- **Document comparison.** Top-K similarity doesn't know what "comparison" means.
- **Conflict resolution.** If two retrieved chunks contradict each other, vanilla RAG just shoves both into context and lets the LLM hallucinate a reconciliation.
- **Intent mismatch.** Users rarely phrase queries the way documents are written. "Are we exposed to rate hikes?" doesn't semantically match "duration risk in fixed income holdings."

When I was building retrieval for Tnufa.ai, I watched users ask perfectly reasonable questions and get confidently wrong answers. The fix wasn't a prompt tweak. It was a different architecture entirely.

> The retrieval layer is now the hardest part of your AI stack. Not the model. Not the prompt. The retrieval architecture.

## Vanilla RAG vs Agentic RAG: The Real Difference

Vanilla RAG is a **pipeline**: Retrieve → Generate. One shot. Done.

Agentic RAG is a **loop**: Plan → Retrieve → Reason → Critique → Rewrite → Reflect → repeat until confident.

The difference isn't "more steps." The difference is that the system decides how to answer the question instead of executing a fixed recipe.

Here's the same query through both architectures:

**Query:** "What's the risk exposure in our Q2 portfolio vs last year?"

**Vanilla RAG:**
- Embeds "risk exposure Q2 portfolio last year"
- Retrieves top-5 semantically similar chunks
- Most chunks are about current Q2 risk; one mentions "year-over-year" tangentially
- Generates a confident answer about current Q2 risk that completely misses the comparison

**Agentic RAG:**
- Planner decomposes: "I need Q2 2026 risk, Q2 2025 risk, and a delta framework"
- Issues three independent retrievals as tool calls
- Notices Q2 2025 retrieval returned weak matches → reformulates query → retries
- Drafts an answer
- Critic checks: "Did I answer both sides of the comparison? Did I quantify the delta?"
- Returns structured comparison with citations

The output difference isn't marginal. Teams shipping agentic patterns for financial analysis, legal research, and internal knowledge tools are reporting accuracy gains in the 20–40% range on real benchmarks — not toy datasets.

## The Five Components You Actually Need

If you're building agentic RAG, here's the minimum architecture:

### 1. Planner Layer

A reasoning step that takes the user query and outputs a retrieval plan — what to fetch, in what order, with what filters. This is usually a smaller, fast LLM call with a structured output schema.

```python
class RetrievalPlan(BaseModel):
    sub_queries: list[str]
    requires_comparison: bool
    time_filters: list[str] | None
    confidence_threshold: float
```

### 2. Tool-Calling Retrieval

Retrieval is exposed as a tool the agent calls, not a hardcoded step. The agent can call it once, five times, or zero times.

```python
tools = [
    {"name": "search_docs", "params": {"query": str, "filters": dict}},
    {"name": "fetch_document", "params": {"doc_id": str}},
    {"name": "compare_periods", "params": {"metric": str, "p1": str, "p2": str}},
]
```

### 3. Self-Critique Loop

After generating a draft answer, a critic prompt evaluates: Is this complete? Are claims supported by retrieved context? Are there gaps? If the critic flags issues, the agent loops back.

### 4. Context Management

You cannot dump every retrieved chunk into every step. You need explicit policies for what stays in the window: summarized prior turns, retained citations, dropped irrelevant chunks. Tools like LangGraph and LlamaIndex's workflows give you state primitives for this.

### 5. Budget Enforcement

Without a hard cap, agents will loop forever on ambiguous questions. Cap iterations, tool calls, and tokens.

```yaml
agent_budget:
  max_iterations: 6
  max_tool_calls: 12
  max_tokens: 32000
  timeout_seconds: 45
```

## What Nobody Tells You About Building This

I'll be blunt: the hard part isn't writing the planner prompt. It's everything around the loop.

**Observability gets exponentially harder.** A vanilla RAG trace has 2 spans. An agentic trace has 15–30. You need LangSmith, Langfuse, or homegrown tracing from day one. If you can't see why the agent made a decision, you can't debug it.

**Latency becomes your enemy.** A vanilla RAG response is 1–3 seconds. An agentic response can be 10–30. You'll need parallel tool calls (most frameworks support this), streaming intermediate state to the UI, and aggressive caching of sub-query results.

**Cost compounds fast.** Six iterations × four tool calls × two LLM passes = ~50x the token spend of vanilla RAG. Use a cheap model (Haiku, Gemini Flash, GPT-4o-mini) for the planner and critic. Reserve your frontier model for the final synthesis.

**Evaluation has to change.** End-to-end accuracy isn't enough. You need per-step evals: Did the planner decompose correctly? Did retrieval surface the right chunks? Did the critic catch the gap? RAGAS and TruLens help, but you'll write custom evals for your domain.

## When You Should (and Shouldn't) Go Agentic

Agentic RAG isn't free. If your use case is "answer FAQ from a 50-page policy doc," vanilla RAG is fine and you're wasting money going agentic.

Reach for agentic when:

- Queries require multi-hop reasoning across documents
- Answers need comparison, aggregation, or synthesis
- Your retrieval corpus is large and heterogeneous (PDFs, databases, APIs)
- Wrong answers have real cost — finance, legal, medical, compliance
- Users phrase queries differently from how documents are written

Stick with vanilla when:

- Latency budget is under 2 seconds
- Corpus is small and homogeneous
- Cost per query needs to stay sub-cent
- Questions are predictable in shape

## The Takeaway

If you're starting a RAG project today, start with the assumption that one retrieval call will not be enough. Design for loops, not pipelines. Build the planner and critic from day one — retrofitting them later means rewriting your state management, your tracing, and your evals.

The engineers I see getting hired at AI-first companies right now aren't the ones who can wire up a vector DB. They're the ones who can design an agent loop that's fast, observable, bounded, and accurate. That's the bar.

Pick one query in your current RAG system that you know returns weak answers. Trace it. Then ask: would a planner have decomposed it better? Would a critic have caught the gap? If yes, you already know what to build next.

---

*Originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7467620205540802561).*
