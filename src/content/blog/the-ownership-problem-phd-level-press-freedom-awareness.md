---

title: "The Ownership Problem — A Structural Account of Press Freedom"
date: 2026-05-31
categories: ["Society & Tech"]
tags: [FreePressMatters, MediaFreedom, IndependentMedia, PoliticalEconomy, MediaTheory, Habermas, Chomsky, Journalism]
author_profile: true
read_time: true
share: true
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466906444240580608"
excerpt: "Most Americans believe they have access to a free press. They have access to a market of information products manufactured by six corporate parents. The distinction is the whole argument — and the lever set for fixing it is more concrete than the debate suggests."
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

The shape of this consolidation is sharper still when you trace specific transactions. The 2019 Disney–21st Century Fox merger consolidated television production, news distribution, and streaming rights in a single entity. The 2022 Warner Bros.–Discovery merger combined the largest cable news network with the largest factual-content library. The 2018 Sinclair Broadcast Group expansion — at one point poised to reach 72 percent of U.S. households via station ownership — was approved at every regulatory layer until political pressure stalled the final step. The point is not that any single deal was the breaking point. The point is that the cumulative trajectory has had no countervailing force for thirty years.

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

Empirically, the filter is observable in coverage *omissions*. Compare the volume of investigative reporting on bank fraud post-2008 against the volume of reporting on welfare fraud over the same period. The financial losses to the public from the former exceed the latter by roughly three orders of magnitude. The reporting volume runs in the opposite direction. That asymmetry is not a moral failure of individual journalists. It is a downstream artefact of who buys advertising, who employs editors, and which sources return calls.

## The Public-Good Contradiction

Nicholas Garnham, in *Capitalism and Communication* (Sage, 1990, pp. 1–19), articulated the core economic contradiction with surgical precision. Information is a public good. Its social value increases with distribution — a fact known by ten million people is more useful than the same fact known by ten thousand. But markets treat information as a commodity whose private value depends on scarcity, exclusivity, and paywalls.

You cannot simultaneously maximise the social utility of information and the private profit extracted from it. These are mathematically opposed optimisation targets. Every commercial media organisation is therefore engaged in a permanent compromise between civic function and shareholder return, and the structural pressure runs in one direction.

This is why investigative journalism — expensive, slow, often unprofitable, and frequently hostile to advertisers — is the first thing cut when budgets tighten. It produces the highest social value and the lowest private return. The market does exactly what markets do.

## Negative Liberty Is Not Enough

Isaiah Berlin's *Two Concepts of Liberty* (Oxford, 1958) drew the distinction that the American press freedom debate continues to ignore. Negative liberty is freedom *from* interference. Positive liberty is the actual *capacity* to act.

The First Amendment is a magnificent guarantor of negative press freedom. It bars Congress from restricting publication. It says nothing about the positive conditions — economic viability, distribution infrastructure, audience access — without which press freedom is a legal abstraction with no operational reality.

You have the constitutional right to start a newspaper. You do not have the capital to staff one, the distribution to reach an audience, or the ad market to sustain it against six conglomerates with vertically integrated supply chains. Pew Research Center documented U.S. newsroom employment falling 26 percent between 2008 and 2020. Northwestern University's *State of Local News* report (2022, p. 4) identified more than 200 counties — home to over 200 million Americans — as news deserts with no dedicated local coverage. The 2023 update revised that figure upward: more than half of all U.S. counties now have no daily newspaper, and roughly 70 million Americans live somewhere with one local newspaper or none at all.

Those Americans retain full negative press freedom. They have zero positive press freedom. The distinction is the entire argument.

## Three Case Studies in Structural Failure

It is worth grounding the abstract architecture in three concrete cases.

**Case 1: Sinclair Broadcast Group's "must-run" segments (2018).** A viral compilation showed dozens of local Sinclair anchors reading an identical script warning of "biased and false news" — language drafted at corporate HQ and pushed to every owned station. No journalist was forced. The ownership structure simply made refusal career-ending. The First Amendment was untouched. Negative liberty was perfect. The system produced uniform output anyway.

**Case 2: The decline of the Denver Post (2018).** Alden Global Capital, a hedge fund, acquired the paper through a series of distressed-asset purchases and cut staffing by roughly two-thirds over five years. The remaining journalists published a front-page op-ed begging readers to demand the paper find a new owner. The owner read it and held the asset anyway. Extraction was more profitable than journalism. There is no legal mechanism in the United States that prevents this outcome. There is no constitutional clause that distinguishes a newspaper from a tyre warehouse.

**Case 3: The Texas Tribune and ProPublica (2007 / 2008–present).** Two non-profit newsrooms, both built on a model that removes the equity-return constraint from the production of journalism. They publish freely. They share work with commercial outlets at no charge. They have produced multiple Pulitzer Prizes and broken stories the commercial press would not commission. Their existence is the empirical proof that the structural problem is not "journalism is dying" but "for-profit journalism inside a six-firm oligopoly is dying." The civic function is recoverable. The corporate vehicle is not the only available container.

## This Is a Systems Design Problem

Here is the part that matters to me as an engineer. Once you stop framing media decline as a moral failure — corrupt journalists, lazy audiences, partisan villains — and start framing it as an incentive design failure, the problem becomes tractable. Not easy. Tractable.

The infrastructure of democratic accountability is not collapsing because of malice. It is collapsing because we built a media economy optimised for engagement and scale rather than truth and civic function. Optimisation targets produce the systems they reward. Change the target, change the system.

## The Lever Set — Which Actually Moves the System

The post that follows this one will be a deeper teardown of each lever with cost models. The summary version, ranked roughly by ratio of structural impact to political feasibility:

**1. Non-profit and cooperative ownership structures.** ProPublica, The Texas Tribune, Defector, Block Club Chicago, The 19th. The model works. The constraint is capital formation — most communities do not have a wealthy donor base to bootstrap one. The federal lever here is a *philanthropic-conversion tax credit* allowing for-profit newspapers in distress to convert to non-profit status with a window of charitable matching funds. France has experimented with variants of this. The U.S. has not.

**2. Journalist payroll subsidies.** Canada's Journalism Labour Tax Credit refunds a percentage of qualifying journalist salaries to eligible news organisations. It is targeted, auditable, viewpoint-neutral, and avoids the worst pitfalls of direct subsidy. Multiple U.S. proposals have circulated — the *Local Journalism Sustainability Act* (introduced 2020, 2021, 2023) is the closest analogue. None have passed. Estimated annual federal cost: roughly \$1.5–\$3 billion. For comparison, the U.S. spends more than that on annual subsidies to a single agricultural commodity sector.

**3. Algorithmic transparency requirements.** The platforms that now function as de facto distribution monopolies — Meta, YouTube, X, TikTok — set ranking weights that determine what reaches readers. Mandating disclosure of these weights, audit access for accredited researchers, and a notice-and-explanation right for content downranking is the platform-era equivalent of broadcast licensing. The EU's Digital Services Act is a partial template. The U.S. has no equivalent.

**4. Antitrust enforcement on cross-platform media ownership.** The 1996 Telecommunications Act's elimination of cross-ownership caps is the policy decision most directly traceable to current consolidation. Restoring caps is not technically difficult. It is politically blocked, because the entities that would be broken up are the entities that cover Congress.

**5. Public-interest funding mechanisms insulated from state control.** The BBC license-fee model, properly designed with a multi-year funding settlement and an arm's-length charter, is the largest-scale demonstration of public-interest journalism that does not collapse into state media. The structural design — funding mechanism distinct from sitting government — is the part American discussions consistently elide. PBS and NPR receive a fraction of the per-capita public funding their UK, German, and Scandinavian counterparts enjoy.

**6. Local-news anti-extraction protections.** The Alden Global Capital pattern — hedge-fund acquisition followed by staffing collapse — should be treatable under fiduciary-duty law analogous to nursing-home minimum-staffing rules. The framing is novel and politically untested. The legal architecture is not impossible. It would treat civic infrastructure as a regulated category, the way we treat hospitals and pipelines.

None of these are silver bullets. None of them work without political will the country does not currently possess. But the design space is more populated than the public debate admits, and the levers are not theoretical. They are running, in production, in adjacent democracies, today.

## A Note on What This Series Is Not

This is not a call for "balance" or "civility" or any of the procedural language that has been used to launder structural critique into nothing. The problem is not that the media is too partisan. The problem is that it is too privately owned and too dependent on advertising to function as the deliberative substrate a constitutional democracy requires. Those are descriptively different claims. They imply different solutions.

I write this as someone who has spent his career inside large institutions watching incentive structures determine outcomes more reliably than any individual decision-maker. The American press is not failing because the journalists are bad. It is failing because we built the wrong system, and the system is now producing exactly what it was built to produce. The next post in this series works through each lever above with cost models, comparable international evidence, and an assessment of where U.S. policy windows actually exist.

Until then, the one thing worth internalising: when you read the news, you are not encountering a free press. You are encountering the output of a six-node oligopoly running on engagement-optimised incentives. Read accordingly. And start asking what a press worth having would actually be designed to do.

---

*Originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466906444240580608).*
