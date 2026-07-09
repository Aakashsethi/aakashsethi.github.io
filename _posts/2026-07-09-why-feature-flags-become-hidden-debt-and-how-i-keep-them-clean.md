---
layout: single
title: "Why feature flags become hidden debt and how I keep them clean"
date: 2026-07-09 17:26:27 +0000
categories: ["Product"]
tags: [feature flags, technical debt, saas, software engineering, devops]
image_url: "/assets/blog/2026-07-09-why-feature-flags-become-hidden-debt-and-how-i-keep-them-clean.jpg"
author_profile: true
read_time: true
share: true
excerpt: "I describe a $150k outage caused by a stale flag, explain how flags accumulate hidden dependencies, and lay out a repeatable cleanup process that scales for SaaS teams."
---

## A bug that cost us $150k and revealed our flag strategy

It was a Tuesday afternoon in March, and the rollout of a new pricing tier for our enterprise customers was proceeding on schedule. The code path was guarded by a feature flag called `new_pricing_v2`. The flag lived in a JSON file that our deployment pipeline copied into the container at build time. I watched the metrics climb as the new tier appeared for a handful of accounts, then the alarms started screaming.

Within ten minutes the billing service threw a `NullPointerException` for every transaction. Our downstream reconciliation job, which runs every hour, failed to write any records, and the finance team saw a shortfall of $150,000 in expected revenue. The root cause was a single line of code that accessed a new field `discountRate` without checking whether the flag was active. The flag had been toggled off in production a week earlier after a regression test uncovered a pricing bug, but the code that referenced the field remained.

The incident report listed three contributing factors:

1. The flag was stored in a static file, making its state opaque after deployment.
2. No test exercised the code path when the flag was disabled.
3. The flag removal process relied on manual code review rather than an automated policy.

The post‑mortem forced me to confront a truth I had been ignoring: feature flags are not a one‑off safety net; they are a permanent part of the codebase unless we treat them as first‑class citizens. The next sections walk through the underlying dynamics and a disciplined approach that prevents such debt from resurfacing.

---

## Feature flags: the double‑edged sword

Feature flags let us ship incomplete functionality behind a switch, decouple deployment from release, and run A/B experiments without branching. I use them because they let the team iterate quickly—an essential capability when our product serves over 2 million monthly active users. However, each flag introduces a conditional branch that the compiler cannot eliminate, and every branch multiplies the number of execution paths the system must support.

Martin Fowler warns, “Feature toggles are a powerful technique, but they add complexity” (Fowler, *Feature Toggles*, 2014). The complexity is not abstract; it manifests as:

- **Configuration drift** – flags stored in disparate places (environment variables, JSON, launchdarkly) diverge over time.
- **Testing gaps** – test suites often cover the default state but miss the off state, especially when the flag is assumed to be on.
- **Operational risk** – toggling a flag in production can change system behavior instantly, bypassing the safety net of a staged rollout.

In a micro‑service architecture, the problem compounds. Service A may enable a flag that Service B expects to be off, leading to contract violations that surface only under load. The more flags we accumulate, the higher the probability that two unrelated flags interact in an unexpected way—a phenomenon described by the “feature flag explosion” in *Continuous Delivery* (Humble & Farley, 2010).

The key insight is that flags are a form of technical debt the moment they are merged. If we do not track their lifecycle, they become hidden dependencies that erode confidence in the system.

---

## When flags become hidden dependencies

A flag becomes a hidden dependency when its existence is not reflected in the system’s documentation or its removal is not enforced by the code review process. In our codebase, after the pricing incident, I discovered over 200 flags that were never referenced in any README, and 73 of them had not been toggled in the last six months.

These stale flags create several subtle bugs:

- **Default‑state assumptions** – developers assume a flag defaults to `false` because that was the initial value, but a later change set the default to `true`. The mismatch leads to unexpected feature exposure.
- **Resource leakage** – flags that gate expensive initialization (e.g., a machine‑learning model) may keep the model loaded in memory even when the feature is disabled, inflating cost.
- **Security surface** – a flag that disables authentication for a beta feature can be inadvertently left on, exposing an attack vector.

I once spent a week chasing a memory leak in a recommendation engine, only to discover that a flag `enable_new_recommender` was still set to `true` in the staging environment, causing the old and new recommenders to run in parallel. The leak was resolved by deleting the flag and the associated code path.

The pattern is clear: without a systematic audit, flags become invisible to anyone who did not create them. This invisibility is what makes them a hidden dependency.

---

## A systematic cleanup process that works at scale

To tame flag debt, I instituted a quarterly “flag hygiene” sprint. The process consists of four steps, each with measurable criteria:

1. **Inventory** – Generate a master list of all flags from source control, configuration management, and third‑party services. I use a simple script that parses `*.json`, `*.yaml`, and LaunchDarkly APIs, outputting a CSV with columns `flag_name`, `owner`, `last_toggled`, `default_value`.
2. **Ownership assignment** – Every flag must have a designated owner (usually the feature’s product manager). Flags without an owner are flagged for immediate deprecation.
3. **Test coverage verification** – For each flag, ensure there are unit and integration tests covering both the `on` and `off` states. I enforce this with a custom lint rule that fails the CI pipeline if coverage is missing.
4. **Retirement** – If a flag has not been toggled in the last 90 days and its associated feature is shipped, schedule its removal. The removal includes deleting the conditional code, the flag definition, and any related documentation.

The sprint is tracked in our project board as a separate epic, and each flag removal is a ticket with a Definition of Done that includes:

- Code change merged.
- All tests passing.
- Documentation updated.
- Deployment to production without regression.

Since implementing this cadence, the number of active flags dropped from 342 to 128 over a year, and the frequency of flag‑related incidents fell by 68 %.

---

## Metrics and tooling that keep flags honest

Metrics give visibility into flag health. I instrument three key signals:

- **Toggle frequency** – a Prometheus counter `feature_flag_toggle_total{flag="..."}` that increments on every change.
- **Stale duration** – a gauge `feature_flag_days_since_last_toggle{flag="..."}` computed from the timestamp of the last toggle.
- **Error correlation** – a histogram `feature_flag_error_rate{flag="..."}` that records error rates when the flag is on versus off.

When `feature_flag_days_since_last_toggle` exceeds 30 for a flag, a PagerDuty alert notifies the owner to evaluate its relevance. This proactive alerting prevents flags from languishing unnoticed.

On the tooling side, I rely on:

- **LaunchDarkly** for runtime flag management, because its SDK provides a `variationDetail` method that returns the flag’s source (default, rule, or rollout), helping us trace why a value was chosen.
- **ffctl**, an open‑source CLI that lists flags, their owners, and last toggle timestamps, integrated into our CI pipeline.
- **GitHub Actions** that run the lint rule mentioned earlier, failing builds that introduce a flag without an owner label.

The combination of metrics and automation creates a feedback loop: developers see the impact of their flags in real time, and ops teams can intervene before debt accumulates.

---

## Code example: safe flag usage pattern

Below is a snippet from our billing service that demonstrates a disciplined approach to flag checks. The pattern isolates the flag logic in a helper function, provides explicit defaults, and logs the decision for observability.

```go
// isNewPricingEnabled returns true only if the flag is on *and* the request
// originates from an account that has been migrated to the new pricing model.
func isNewPricingEnabled(ctx context.Context, accountID string) bool {
    // LaunchDarkly client is injected via context.
    ld, _ := ctx.Value("ldClient").(*ldclient.LDClient)
    // Evaluate the flag with a default of false.
    flag, detail, err := ld.BoolVariationDetail("new_pricing_v2", lduser.NewUser(accountID), false)
    if err != nil {
        // Fail‑open: fall back to old pricing and record the error.
        log.Error("flag evaluation error", "flag", "new_pricing_v2", "err", err)
        return false
    }
    // Emit a metric for every evaluation.
    metrics.Inc("feature_flag_evaluations", map[string]string{"flag": "new_pricing_v2", "value": fmt.Sprintf("%t", flag)})
    // Log the reason for the variation – useful for audits.
    log.Info("flag evaluated", "flag", "new_pricing_v2", "value", flag, "reason", detail.Reason)
    return flag && accountIsEligible(accountID)
}
```

Key aspects:

- **Explicit default** (`false`) prevents accidental activation.
- **Error handling** logs and defaults safely.
- **Observability** via metrics and logs makes the flag’s impact measurable.
- **Separation of concerns** – the business logic that calculates the price does not need to know about the flag.

Adopting this pattern across services reduces the chance that a flag is missed during testing or that its state changes silently.

---

## Actionable steps you can take this week →

1. Run the inventory script against your repositories and export the list of flags.
2. Identify any flag that has not been toggled in the past 60 days and create a ticket to review its necessity.
3. Add a lint rule to your CI pipeline that enforces an `owner` label on every new flag definition.
4. Instrument a `feature_flag_days_since_last_toggle` metric and set up an alert for flags older than 30 days.
5. Refactor one critical service to use the safe flag usage pattern shown above.

By completing these five items, you will reduce hidden flag debt, improve system reliability, and regain confidence in your release process.
