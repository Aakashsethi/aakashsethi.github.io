---
title: OpenAI and Broadcom announce chip designed for LLM inference at scale
date: '2026-06-24'
tags:
- AIEngineering
- LLM
- MachineLearning
- CloudComputing
- TechCareers
linkedin_url: https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7475699382965833728
cover_image: "/assets/posts/2026-06-24-openai-and-broadcom-announce-chip-designed-for-llm-inference.png"
cover_image_alt: OpenAI and Broadcom announce chip designed for LLM inference at scale
  — cover art
cover_image_width: 1200
cover_image_height: 624
slug: openai-and-broadcom-announce-chip-designed-for-llm-inference
category: AI Engineering
---

OpenAI just stopped being a Nvidia customer.

Ars Technica reported yesterday that OpenAI and Broadcom announced a custom silicon chip purpose-built for LLM inference at scale. The silicon race is officially a four-way fight now: Nvidia, Google TPU, AWS Trainium, and whatever this Broadcom collab gets named.

Why this matters: inference is now 80%+ of compute cost for any production AI system. Training is a one-time bill. Inference is rent you pay forever.

When OpenAI builds their own chip, they're not chasing performance benchmarks. They're cutting the Nvidia tax on every ChatGPT token served.

Here's what nobody tells you about this shift:

1. Learn the inference stack, not just the model. vLLM, TensorRT-LLM, and Triton matter more than knowing PyTorch internals in 2026. Throughput per dollar is the only metric that ships.

2. Pick a cloud and go deep. AWS Bedrock + Trainium2, GCP + TPU v5, or Azure + whatever they partner on. Multi-cloud sounds smart on a resume and dies in production.

3. Quantization is a real skill. INT8, FP8, AWQ, GPTQ — the engineers who can squeeze a 70B model onto a single node get hired. The ones who only call APIs get replaced by them.

4. Custom silicon means custom kernels. CUDA monopoly is cracking. If you're early in your career, Triton and Mojo are higher-leverage bets than another React course.

Follow for daily posts.

P.S. Source: https://arstechnica.com/gadgets/2026/06/openai-and-broadcom-announce-chip-designed-for-llm-inference-at-scale/

---
[View on LinkedIn](https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7475699382965833728){:target="_blank"}
