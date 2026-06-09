---
layout: single
title: "The Ownership Problem — PhD-level press freedom awareness"
date: 2026-05-31
categories: ["Society & Tech"]
tags: [FreePressMatters, MediaFreedom, IndependentMedia, PoliticalEconomy, MediaTheory, Habermas, Chomsky, Journalism]
author_profile: true
read_time: true
share: true
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466906444240580608"
---

Most people believe they have access to a free press. They don't. What they have is access to a competitive market of information products, manufactured by six corporate parents, distributed through algorithmic systems optimised for engagement, and constrained by structural incentives that shape what gets covered before any editor ever sees a pitch. The distinction matters. A market is not a public sphere. And conflating the two has consequences we are now living through in real time.

I write software for a living. I've spent enough time inside production systems — at Vanguard, at Mercedes-Benz Financial Services, and on platforms I've built myself — to recognise a familiar pattern: when a system produces a consistently undesirable output, the problem is almost never the people operating it. The problem is the incentive structure. American media has an incentive structure problem. Naming it correctly is the first step toward redesigning it.

## The Public Sphere Was a Design Specification, Not a Metaphor

In 1962, Jürgen Habermas published *The Structural Transformation of the Public Sphere* (MIT Press translation, 1989, pp. 181–195). His central claim was architectural: a functioning democracy requires a communicative space — the *Öffentlichkeit* — where citizens engage in rational-critical discourse, free from both state coercion and commercial distortion. Coffeehouses, pamphlet culture, salons, independent newspapers. These weren't quaint historical artifacts. They were the operating system of democratic self-governance.

Habermas argued that when this sphere gets colonised by market forces — when the conditions for public reason are subordinated to the conditions for profit — democratic legitimacy erodes at the root. Not catastrophically. Not visibly. Structurally.

> A democracy without a functioning public sphere is a constitutional architecture wired to a power source that no longer exists.

The legal scaffolding remains. Elections happen. Courts rule. But the substrate that makes deliberation possible — shared facts, accessible discourse, accountable institutions — quietly degrades. We are sixty years into that degradation, and the metrics are not subtle.

## Six Companies, 90 Percent of Everything

Ben Bagdikian spent twenty years documenting media consolidation across seven editions of *The Media Monopoly*. The trajectory is the most damning chart in modern American political economy.

- **1983**: 50 corporations controlled the majority of U.S. media.
- **1992**: 23 corporations.
- **2000**: 10 corporations.
- **2004**: 5 corporations (Bagdikian, *The New Media Monopoly*, Beacon Press, 2004, pp. 1–27).

Today the number sits at roughly six: Comcast, Disney, News Corp, Warner Bros. Discovery, Paramount, and Fox. Together they control approximately 90 percent of what Americans read, watch, and hear. This is not a partisan observation. It is an antitrust observation that no administration of either party has been willing to act on since the Telecommunications Act of 1996 dismantled most remaining cross-ownership limits.

Consider the second-order effects. When six entities own the printing presses, the cable infrastructure, the streaming platforms, the studios, and the news divisions, the question "what gets covered?" is no longer answered by editorial judgment. It is answered by a portfolio risk calculation. A Disney-owned outlet investigating Disney's labour practices is not impossible. It is institutionally improbable in the same way that a Vanguard fund overweighting Vanguard's competitors is institutionally improbable.

## The Propaganda Model as a System Architecture Diagram

Edward Herman and Noam Chomsky's *Manufacturing Consent* (Pantheon, 1988, Ch. 1, pp. 1–35) is frequently misread as a conspiracy theory. It is not. It is a systems diagram. Their Propaganda Model identifies five structural filters that shape news output without anyone in the system needing to issue an explicit instruction:

1. **Ownership** — concentrated, profit-maximising corporate parents.
2. **Advertising dependency** — revenue comes from companies, not readers.
3. **Sourcing** — reliance on government and corporate PR for cheap, steady content.
4. **Flak** — organised pushback that raises the cost of certain stories.
5. **Dominant ideology** — the unexamined frame within which "serious" discussion occurs.

If I were modelling this as a pipeline, it would look something like:

```yaml
story_pipeline:
  pre_commission_filters:
    - ownership_alignment_check
    - advertiser_risk_assessment
    - source_accessibility
  commission:
    proceed_if: all_filters_passed
  editorial_review:
    flak_exposure_modeling: true
  publication:
    ideological_frame: dominant_consensus
```

Stories that threaten advertiser relationships or ownership investments are not killed in a smoke-filled room. They are never commissioned. The filtration happens at intake. By the time a reporter pitches an idea, the field of pitchable ideas has already been shaped by what they know will get green-lit. This is invisible to participants. It is the system working as designed.

## The Public-Good Contradiction

Nicholas Garnham, in *Capitalism and Communication* (Sage, 1990, pp. 1–19), articulated the core economic contradiction with surgical precision. Information is a public good. Its social value increases with distribution — a fact known by ten million people is more useful than the same fact known by ten thousand. But markets treat information as a commodity whose private value depends on scarcity, exclusivity, and paywalls.

You cannot simultaneously maximise the social utility of information and the private profit extracted from it. These are mathematically opposed optimisation targets. Every commercial media organisation is therefore engaged in a permanent compromise between civic function and shareholder return, and the structural pressure runs in one direction.

This is why investigative journalism — expensive, slow, often unprofitable, and frequently hostile to advertisers — is the first thing cut when budgets tighten. It produces the highest social value and the lowest private return. The market does exactly what markets do.

## Negative Liberty Is Not Enough

Isaiah Berlin's *Two Concepts of Liberty* (Oxford, 1958) drew the distinction that the American press freedom debate continues to ignore. Negative liberty is freedom *from* interference. Positive liberty is the actual *capacity* to act.

The First Amendment is a magnificent guarantor of negative press freedom. It bars Congress from restricting publication. It says nothing about the positive conditions — economic viability, distribution infrastructure, audience access — without which press freedom is a legal abstraction with no operational reality.

You have the constitutional right to start a newspaper. You do not have the capital to staff one, the distribution to reach an audience, or the ad market to sustain it against six conglomerates with vertically integrated supply chains. Pew Research Center documented U.S. newsroom employment falling 26 percent between 2008 and 2020. Northwestern University's *State of Local News* report (2022, p. 4) identified more than 200 counties — home to over 200 million Americans — as news deserts with no dedicated local coverage.

Those Americans retain full negative press freedom. They have zero positive press freedom. The distinction is the entire argument.

## This Is a Systems Design Problem

Here is the part that matters to me as an engineer. Once you stop framing media decline as a moral failure — corrupt journalists, lazy audiences, partisan villains — and start framing it as an incentive design failure, the problem becomes tractable. Not easy. Tractable.

The infrastructure of democratic accountability is not collapsing because of malice. It is collapsing because we built a media economy optimised for engagement and scale rather than truth and civic function. Optimisation targets produce the systems they reward. Change the target, change the system.

Concrete leverage points worth studying:

- **Non-profit and cooperative ownership structures** (ProPublica, The Texas Tribune, Defector).
- **Public-interest funding mechanisms** that don't route through state control (the BBC license model, properly designed, is one variant).
- **Antitrust enforcement** on cross-platform media ownership.
- **Algorithmic transparency requirements** for the platforms that now function as de facto distribution monopolies.
- **Local-news tax credits and journalist payroll subsidies** modelled on the Canadian Journalism Labour Tax Credit.

None of these are silver bullets. All of them are levers. The next post in this series will work through which levers actually move the system and which are theatre.

Until then, the one thing worth internalising: when you read the news, you are not encountering a free press. You are encountering the output of a six-node oligopoly running on engagement-optimised incentives. Read accordingly. And start asking what a press worth having would actually be designed to do.

---

*Originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466906444240580608).*
