---

title: "What the First Amendment Actually Protects (And What It Doesn't)"
date: 2026-06-01
categories: ["Society & Tech"]
tags: [FirstAmendment, MediaPolicy, Section230, DSA, PressFreedom, AlgorithmicCensorship, MediaRegulation, FreeSpeech]
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466924770756980736"
cover_image: /assets/posts/2026-06-01-what-the-first-amendment-actually-protects-and-what-it-doesnt.png
cover_image_alt: "What the First Amendment Actually Protects (And What It Doesn't) — cover art"
cover_image_width: 1200
cover_image_height: 624
---

The First Amendment doesn't protect your right to be heard. It protects the government's inability to silence you. That's a very different thing, and the distinction matters more every year as the infrastructure of public discourse migrates entirely onto privately-owned platforms governed by terms of service rather than constitutional law.

I think about this a lot — partly because I build software that mediates how people see information, and partly because I teach computer science to high school students who are growing up assuming "free speech" means something it doesn't legally mean. The gap between the folk understanding and the actual legal text is now wide enough to drive most of modern platform governance through.

## What the Text Actually Says

The operative clause is short: *"Congress shall make no law... abridging the freedom of speech, or of the press."*

Read the subject. It's Congress. By incorporation through the Fourteenth Amendment, it extends to state and local governments. It does not extend to Meta, Alphabet, X, TikTok, AWS, Cloudflare, Visa, or any other private actor that controls a chokepoint in the modern information stack.

This isn't a loophole. It's the design. Isaiah Berlin, in *Two Concepts of Liberty* (Oxford, 1958, pp. 7–16), drew the distinction that clarifies everything: **negative liberty** is freedom *from* coercive interference. **Positive liberty** is the actual *capacity to act*.

> The First Amendment is a masterwork of negative liberty. It was never designed to guarantee positive liberty — the capacity to speak, be heard, and participate in public discourse.

That's the entire argument in one sentence. Everything else is implementation detail.

## What the First Amendment Says Nothing About

If you want to enumerate the silence, here's where the constitutional text has no opinion:

- A platform's right to remove or suppress your content
- A corporation's right to decline to publish your story
- A recommendation algorithm's right to deprioritize your reach to effectively zero
- An advertiser's right to withdraw funding when journalism becomes inconvenient
- A payment processor's right to deplatform you from monetization
- A CDN's right to drop you from its edge network
- An app store's right to refuse distribution

Each of these is a real chokepoint. Each one has been exercised in the last five years against accounts ranging from sitting heads of state to independent journalists. None of these actions triggered First Amendment review, because no state actor was involved.

The folk theory of free speech — "I can say what I want and reach who I want" — describes positive liberty. The Constitution protects negative liberty. The mismatch is the problem.

## The Cycle: Why Open Networks Consolidate

Tim Wu, in *The Master Switch* (Knopf, 2010, pp. 6–12), documents what he calls **"the Cycle"** — every major communications technology in U.S. history begins as an open, decentralized medium and consolidates under private control. Radio went from amateur hobbyists to RCA and NBC. Film went from independent operators to the studio system. Long-distance telephony went to AT&T. Cable television went to a handful of MSOs.

The internet is not an exception to the Cycle. It is the latest iteration.

Yochai Benkler argued in *The Wealth of Networks* (Yale, 2006, pp. 1–28) that decentralized internet architecture — end-to-end design, low barriers to publishing, peer production — could democratize the public sphere. In 2006, when blogs were ascendant and RSS was the protocol of news distribution, that argument was correct.

It is less correct now. Two decades of consolidation have rebuilt gatekeeping at the infrastructure layer:

- **Discovery** consolidated into Google Search and a handful of recommender systems
- **Social distribution** consolidated into Meta, TikTok, and X
- **Hosting** consolidated into AWS, Azure, GCP, and Cloudflare
- **Payments** consolidated into Stripe, PayPal, Visa, and Mastercard
- **App distribution** consolidated into Apple and Google

Decentralization at the protocol layer (HTTP, TCP/IP) coexists with extreme centralization at every layer above it. A federated protocol doesn't help you if you're banned from the four companies that host 80% of the audience.

## Algorithmic Gatekeeping: Censorship Without a Censor

Zeynep Tufekci, in *Twitter and Tear Gas* (Yale, 2017, pp. 237–266), identifies the mechanism that constitutional law was never designed to address: **algorithmic gatekeeping**. Platform architecture shapes which political realities become legible to public audiences. The censorship is structural, often invisible to both the speaker and the audience, and constitutionally unaddressed.

Consider what a typical content ranking pipeline looks like in pseudocode:

```python
def rank_for_user(candidate_posts, user):
    scored = []
    for post in candidate_posts:
        score = (
            engagement_model.predict(post, user) * 0.4
            + dwell_time_model.predict(post, user) * 0.3
            + advertiser_safety_score(post) * 0.2
            - civic_content_penalty(post) * 0.1
        )
        if policy_classifier(post) in {"borderline", "sensitive"}:
            score *= 0.2  # soft suppression, no notification
        scored.append((score, post))
    return sorted(scored, reverse=True)[:50]
```

That `* 0.2` line is the entire problem. No content was removed. No notification was sent. No appeal exists. The post is technically still online and findable by direct URL. But its distribution has been reduced by 80%, and neither the author nor the audience knows. This is what Tufekci means by censorship without a censor.

From a First Amendment standpoint, nothing happened. From a public-discourse standpoint, the post was suppressed.

## The Regulatory Gap

The legal infrastructure governing this is thin and outdated.

**Section 230 (47 U.S.C. § 230, 1996)** grants platforms immunity from liability for third-party content and broad latitude to moderate. It has not been substantively amended in 28 years. It was written when "interactive computer service" meant Prodigy and CompuServe. It now governs systems that algorithmically curate trillions of impressions per day.

**The EU Digital Services Act (Regulation 2022/2065)** is the most rigorous platform governance framework currently in force. It requires:

- Algorithmic transparency audits for Very Large Online Platforms (VLOPs)
- Systemic risk assessments covering civic discourse and electoral integrity
- Researcher data access under Article 40
- Notice-and-action mechanisms with statements of reasons for content decisions
- Independent auditing under Article 37

A compliance disclosure under DSA Article 27 might require a platform to publish something like:

```yaml
recommender_system:
  name: "for_you_feed_v4"
  main_parameters:
    - user_engagement_history: weight=0.42
    - content_freshness: weight=0.18
    - social_graph_proximity: weight=0.22
    - advertiser_brand_safety: weight=0.10
    - civic_content_demotion: weight=-0.08
  user_controls:
    - opt_out_personalization: true
    - chronological_alternative: true
```

The U.S. has no equivalent framework. No mandatory transparency audits. No researcher access. No statutory definition of algorithmic suppression. The regulatory gap between where the technology operates and where law reaches is one of the most significant accountability vacuums in contemporary governance.

## What Free Media Actually Requires

A functional free press requires positive liberty, not just negative liberty. Specifically, it requires:

1. **Economic viability** — a business model that doesn't depend on the goodwill of two ad networks
2. **Distribution access** — a path to audiences that isn't gated by a single recommender system
3. **Algorithmic transparency** — the ability to know when and why your reach has been throttled
4. **Infrastructure neutrality** — hosting, payments, and CDN access that aren't revocable for editorial reasons
5. **Legal protection from coordinated deplatforming** across the stack

The First Amendment guarantees none of these. It was never supposed to. It guarantees that Congress won't pass a law against you, and that's a meaningful guarantee — but it is not the same guarantee most people think they have.

> Free media requires positive liberty. Without it, the formal right to speak is functionally meaningless.

Those conditions do not currently exist at scale in the United States. If you care about the actual practice of free expression — not the symbolic version — the work is in building the missing layer: DSA-style transparency obligations, interoperability requirements, common-carrier rules for infrastructure chokepoints, and viable independent distribution.

**Concrete takeaway:** Stop arguing about whether moderation violates the First Amendment. It doesn't, and that argument is a distraction. The real question is what statutory framework should govern algorithmic dist

---

*Originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466924770756980736).*
