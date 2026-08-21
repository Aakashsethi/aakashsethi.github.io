---

title: "Side Projects That Actually Get You Hired"
date: 2026-06-01
categories: ["Career"]
tags: [SoftwareEngineering, AIEngineering, CareerAdvice, TechJobs, SideProjects, Career, TechCareers]
author_profile: true
read_time: true
share: true
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7467233599323488256"
---

Last year I reviewed over 200 junior developer resumes for engineering roles in fintech and AI. Ninety percent listed the same three projects: a to-do app, a weather API integration, and a Netflix clone. None of them got callbacks. Not because the candidates were unqualified — most could code fine — but because their projects sent the wrong signal. They proved the candidate could follow a tutorial. They didn't prove the candidate could engineer.

I learned this the hard way. I spent my first two years building portfolio projects nobody used. Then in 2020 I shipped NoshSource — a discount restaurant aggregator that hit 5,000 daily active users during COVID. That single project got me more interview requests than my entire GitHub combined. Here's what changed, and the framework I'd use if I were starting over today.

## Why Tutorial Projects Get You Ignored

Recruiters and hiring managers don't read resumes. They skim them in 6-10 seconds looking for signals. A to-do app, a weather dashboard, or a clone of an existing product all send the same signal: "I followed a YouTube tutorial and changed the color scheme."

That's not engineering. That's transcription.

Real engineering involves trade-offs that only show up when actual humans use your software. You don't learn about database connection pooling until your free-tier Postgres starts timing out at 3 AM. You don't learn about idempotency until a user double-clicks a button and gets charged twice. You don't learn about caching until your API bill hits $400 in a week.

> A project without users is a project without consequences. Without consequences, there are no engineering decisions worth talking about.

When I interviewed candidates at Vanguard, I asked one question that filtered 80% of resumes: "Walk me through a production bug you fixed." Tutorial projects don't have production bugs. They have linting errors.

## The Shift: Build for Users, Not for GitHub Stars

The turning point for me was reframing the question I asked before starting any project.

Before: *"What's a cool tech stack to learn?"*
After: *"What's a problem 100 people would pay $5/month to solve?"*

The second question is harder. That's exactly the point. It forces you to do the work most juniors avoid: customer discovery, scope reduction, and shipping something embarrassing.

When I started NoshSource, I didn't sit down and pick MERN because it was trendy. I picked it because I needed to ship in two weeks and I already knew JavaScript. The stack was a means to an end. The end was: hungry college students in New Jersey could find $5 meals nearby.

Here's the mental model: **engineers who get hired build things that have users.** Not stars. Not commits. Users. Real humans who open your app on a Tuesday because it solves their actual problem.

Once you internalize that, your project filter changes completely. You stop building Twitter clone #4,001 and start looking at your own life for friction.

## The 7-Step Framework I'd Use Today

If I were a junior engineer breaking in today — especially trying to land an AI or fintech role — here's exactly what I'd do:

**1. Pick a niche you already live in.** Gym, college, gaming, faith community, immigrant family, hobby — anywhere you have insider context. You can't build for users you don't understand.

**2. Find 10 people in that niche.** Text them. Ask what wastes their time every week. Take notes. Don't pitch anything yet.

**3. Build the ugliest possible v1 in 2 weeks.** No design system. No CI/CD. No microservices. A Next.js app with Supabase and one route handler is fine.

```bash
npx create-next-app@latest --typescript
npm install @supabase/supabase-js
# ship it
```

**4. Get 50 real users. Strangers, not friends.** Post in subreddits, Discord servers, Facebook groups where your niche lives. If you can't get 50 strangers, the problem isn't real.

**5. Add ONE AI feature that genuinely helps.** Not a ChatGPT wrapper. Think RAG over a user's own documents, an automated workflow that replaces 30 minutes of manual work, or semantic search over a domain-specific dataset.

**6. Write a case study.** Problem → users → metrics → tech decisions → what you'd do differently.

**7. Put the case study at the top of your resume.** Above your education. Above your bootcamp. It's the most valuable signal you have.

## What "ONE AI Feature" Actually Looks Like

Most juniors slap a GPT-4 API call on a textarea, call it AI, and wonder why nobody is impressed. Hiring managers — especially in AI engineering — can spot a ChatGPT wrapper in two seconds.

Real AI features have these properties: they use *your user's data*, they replace a repetitive task, and they have measurable accuracy. Examples that would impress me on a junior resume:

- **RAG over user-uploaded PDFs** with pgvector, chunked at 512 tokens, with citations back to source pages.
- **Automated email triage** that reads a user's Gmail and groups messages by required action, with a feedback loop that improves over time.
- **Domain-specific semantic search** over Reddit comments, legal filings, or recipe databases — anything where keyword search fails.

Here's a minimal RAG setup that beats 90% of "AI projects" I see:

```python
from openai import OpenAI
import psycopg2

def retrieve(query: str, top_k: int = 5):
    embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding

    cur.execute("""
        SELECT content, source, 1 - (embedding <=> %s::vector) AS similarity
        FROM documents
        WHERE user_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (embedding, user_id, embedding, top_k))

    return cur.fetchall()
```

That's roughly 20 lines. The hard part isn't the code — it's the chunking strategy, the eval set you build to measure retrieval quality, and the UX of showing citations.

## How to Write the Case Study

The case study is what converts a project into a job offer. Here's the structure I use:

1. **The problem** — one sentence. Who was hurting and why.
2. **The users** — how you found them, how many, what they pay (if anything).
3. **The metrics** — DAU, retention, conversion, latency. Real numbers.
4. **The tech decisions** — why Postgres over Mongo, why pgvector over Pinecone, why server actions over a separate API. Defend your choices.
5. **The failures** — what broke in production, what you'd refactor, what you learned.

For NoshSource I could say: 5,000 DAU at peak, 38% weekly retention, $0.0003 per request infrastructure cost, MongoDB chosen because restaurant menus had wildly inconsistent schemas, biggest mistake was not adding rate limiting before a Reddit post took us to 12k requests/minute.

That paragraph alone is worth more than five tutorial projects.

## The Takeaway

Build one project with 50 real users instead of five projects with zero. The discomfort of customer discovery, the embarrassment of shipping ugly v1s, and the grind of getting strangers to use your thing — those are the experiences that make you an engineer, and the experiences that hiring managers actually want to hear about.

Open a doc right now. Write down three problems you personally had this week that took more than 20 minutes to solve manually. Pick the one you could ship in two weeks. Start there.

The to-do app can wait. Forever, ideally.

---

*Originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7467233599323488256).*
