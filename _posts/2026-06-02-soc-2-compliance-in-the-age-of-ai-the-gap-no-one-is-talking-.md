---
layout: single
title: "SOC 2 Compliance in the Age of AI — The Gap No One Is Talking About"
date: 2026-06-02
categories: ["AI Engineering"]
tags: [SOC2, EnterpriseCompliance, AIGovernance, NIST, EUAI, SecurityArchitecture, EnterpriseAI, CloudSecurity]
author_profile: true
read_time: true
share: true
linkedin_url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466927032795471872"
---

Your AI systems may be brilliant. Are they auditable?

SOC 2 compliance was designed for a world where data moved predictably between defined systems with documented controls.

Generative AI broke that model — and most enterprise security teams haven't caught up.

The AICPA's Trust Services Criteria (TSC, updated 2022, CC6–CC9) define the control categories every SOC 2 Type II audit evaluates: logical access, change management, risk mitigation, monitoring. These criteria were written for deterministic systems — code that does the same thing every time, with outputs you can verify against inputs.

A large language model is not that system.

When a language model is part of your production stack, the TSC framework faces questions it was not architected to answer — and your auditors are beginning to ask them:

→ What is the "completeness and accuracy" control (CC7.2) for a system whose outputs are probabilistic by design?
→ How do you establish "change management" controls (CC8.1) for a model that updates through fine-tuning or prompt engineering?
→ What does "logical access control" (CC6.1) mean when your AI has retrieval access to internal knowledge bases?
→ How do you satisfy "monitoring" requirements (CC7.1) for outputs generated at scale and reviewed by exception?

The NIST AI Risk Management Framework (AI RMF 1.0, January 2023, pp. 1–43) addresses this directly. Its four core functions — Govern, Map, Measure, Manage — establish that trustworthiness properties must be measurable and documented, not asserted.

ISO/IEC 42001:2023 goes further: mandatory AI impact assessments, documented oversight, AI policy governance. It is the ISO 27001 of AI — and enterprise procurement is beginning to require it.

Wachter, Mittelstadt & Russell, in Counterfactual Explanations without Opening the Black Box (Harvard Journal of Law & Technology, 2017, Vol. 31, No. 2, pp. 841–887), established the legal and technical framework: AI decisions must be reconstructable, contestable, and auditable. Enterprise contracts are now citing this standard.

The EU AI Act (Regulation 2024/1689, Articles 9–17) imposes binding requirements — risk management systems, technical documentation, logging, human oversight — on high-risk AI. SOC 2 alone does not satisfy them.

What SOC-compliant AI architecture actually requires:

1. Immutable audit logs (TSC CC7.2, NIST AI RMF Measure 2.5)
Every AI output logged with input, model version, timestamp, retrieval context. Non-negotiable in a Type II audit.

2. Access controls on RAG systems (CC6.1, ISO 42001 §6.1.2)
If your AI retrieves internal data, access control rigor must match any system with that data access.

3. Human-in-the-loop documentation (CC4.1, EU AI Act Art. 14)
Where AI runs without human review: document risk acceptance and monitoring compensating controls.

4. Model versioning & change management (CC8.1, NIST AI RMF Govern 1.4)
Prompt changes, fine-tuning events — these are production changes. Treat them as such.

5. Vendor risk management (CC9.2)
Your AI provider's security posture is your risk. Auditors will ask for the assessment.

I design enterprise AI applications with these controls built in from day one — not retrofitted under audit pressure.

The cost of building compliance in is a fraction of the cost of losing an enterprise deal because your security team can't answer a procurement questionnaire.

─────────────────────────────
References:
¹ AICPA. Trust Services Criteria (2022). CC6–CC9.
² NIST. AI Risk Management Framework 1.0 (January 2023). pp. 1–43.
³ ISO/IEC 42001:2023. AI Management System Standard.
⁴ Wachter, S., Mittelstadt, B. & Russell, C. (2017). Counterfactual Explanations without Opening the Black Box. Harvard Journal of Law & Technology. Vol. 31, No. 2, pp. 841–887.
⁵ EU AI Act, Regulation (EU) 2024/1689, Articles 9–17.
─────────────────────────────

---
[View on LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7466927032795471872){:target="_blank"}
