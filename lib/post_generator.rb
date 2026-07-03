require 'httparty'
require 'json'
require_relative 'news_sources'

module PostGenerator
  WEIGHTS = { coding: 33, ai: 33, industry: 13, stocks: 10, education: 11 }.freeze

  PORTFOLIO_URL = 'https://aakashsethi.github.io'
  NEWSLETTER_URL = 'https://aakashsethi.github.io/#newsletter'
  # Rotate a newsletter CTA into ~40% of eligible posts (all categories except stocks,
  # which needs the disclaimer). Same soft-touch as portfolio CTAs — one line, no hype.
  NEWSLETTER_CTA_RATE = 0.4

  BRAND_VOICE = <<~VOICE
    Voice rules (Aakash Sethi personal brand):
    - First-person, present tense. "I build…", "I'm seeing…", "I'm interested in…"
    - Confident, not boastful. State the work. No "I think" or hedging.
    - Technical without jargon-flexing. Specific over general.
    - Sentence case. No Title Case. No ALL CAPS except a single eyebrow word.
    - Use em-dashes (—), slashes (/), right arrows (→) for structure. Avoid parentheses.
    - No emoji in product copy. No hype words ("game-changer", "leverage", "synergy").
    - One sentence per line where it helps. Whitespace is part of the design.
    - Close with a direct invitation when appropriate ("Reach out", "DM me", or link to portfolio).
  VOICE

  def self.weighted_pick(history_categories = [])
    total = WEIGHTS.values.sum
    roll = rand(total)
    cum = 0
    WEIGHTS.each do |cat, w|
      cum += w
      return cat if roll < cum
    end
    :ai
  end

  def self.generate(category: nil, recent_urls: [])
    category ||= weighted_pick
    source = nil
    if category != :education
      candidates = NewsSources.fetch(category).reject { |i| recent_urls.include?(i[:url]) }
      source = candidates.first
    end

    prompt = build_prompt(category, source)
    body = call_claude(prompt)
    {
      category: category,
      source_url: source&.dig(:url),
      source_title: source&.dig(:title),
      body: body
    }
  end

  def self.build_prompt(category, source)
    intent = case category
             when :coding then "Pick one specific technical angle from this story and give your take in 2–3 short paragraphs. Engineering-honest, no hype."
             when :ai then "React to this AI development with a builder's perspective — what does it change for people shipping AI systems? 2–3 paragraphs."
             when :industry then "What's the consulting / strategy takeaway here? Concrete, not generic. 2–3 paragraphs."
             when :stocks then "Tie this market move to a tech / AI / consulting thread you actually care about. 2 short paragraphs. Not financial advice — be explicit."
             when :education then <<~E
               Write a short LinkedIn post (2 short paragraphs) that subtly advertises Aakash's consulting availability:
               - Topic: one practical lesson from building AI systems, shipping consulting projects, or the skill-mobility space (Tnufa.ai).
               - Close with a soft CTA pointing to #{PORTFOLIO_URL} or "DM me if you're working on X".
             E
             end

    src_block = source ? <<~S : "(No external source — write evergreen.)"
      Source title: #{source[:title]}
      Source URL:   #{source[:url]}
      Source summary: #{source[:summary]}
    S

    # Newsletter promo: append a soft closer for a share of posts. Stocks skipped
    # (they need the "not financial advice" line as the last beat).
    newsletter_block = if category != :stocks && rand < NEWSLETTER_CTA_RATE
      <<~N
        Newsletter promo (required for this post):
        - After the main content, add one short closing line (its own line, no bullet, no hashtag) inviting readers to subscribe to Aakash's newsletter for field notes on AI engineering, RAG, and shipping production AI.
        - Vary the phrasing (e.g. "Field notes on this stuff → #{NEWSLETTER_URL}", "If you liked this, the long-form version goes to my newsletter: #{NEWSLETTER_URL}", "One post-per-drop, no filler: #{NEWSLETTER_URL}").
        - The URL must appear literally as #{NEWSLETTER_URL}.
      N
    else
      ''
    end

    <<~PROMPT
      You are drafting a LinkedIn post for Aakash Sethi — AI software engineer, AWS Certified Solutions Architect Pro, building Tnufa.ai (skill-based career mobility). Five years across Vanguard, Mercedes-Benz Financial Services, Burpez.

      #{BRAND_VOICE}

      Today's topic category: #{category}
      #{intent}

      #{src_block}
      #{newsletter_block}
      Hard rules:
      - 120–220 words (excluding the source URL and any newsletter closer).
      - First word must NOT be "I" — open with a hook (a stat, a contradiction, a question, or a concrete observation).
      - No hashtags except up to two at the end, lowercase, specific (e.g. #consulting #agents).
      - No emoji.
      - If you reference the source, include its URL once on its own line at the end.
      - Output ONLY the post text. No preamble, no explanation, no markdown formatting markers.
    PROMPT
  end

  def self.call_claude(prompt)
    api_key = ENV.fetch('GROQ_API_KEY')
    model = ENV.fetch('GROQ_MODEL', 'llama-3.3-70b-versatile')
    res = HTTParty.post(
      'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization' => "Bearer #{api_key}",
        'Content-Type' => 'application/json'
      },
      body: {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024
      }.to_json,
      timeout: 60
    )
    raise "Groq API #{res.code}: #{res.body}" unless res.code == 200
    text = JSON.parse(res.body).dig('choices', 0, 'message', 'content')
    raise "Groq returned no text: #{res.body}" if text.nil? || text.strip.empty?
    text.strip
  end
end
