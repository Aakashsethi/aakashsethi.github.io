require 'httparty'
require 'json'
require_relative 'news_sources'

module PostGenerator
  WEIGHTS = { coding: 33, ai: 33, industry: 13, stocks: 10, education: 11 }.freeze

  PORTFOLIO_URL = 'https://aakashsethi.github.io'

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

    <<~PROMPT
      You are drafting a LinkedIn post for Aakash Sethi — AI software engineer, AWS Certified Solutions Architect Pro, building Tnufa.ai (skill-based career mobility). Five years across Vanguard, Mercedes-Benz Financial Services, Burpez.

      #{BRAND_VOICE}

      Today's topic category: #{category}
      #{intent}

      #{src_block}

      Hard rules:
      - 120–220 words.
      - First word must NOT be "I" — open with a hook (a stat, a contradiction, a question, or a concrete observation).
      - No hashtags except up to two at the end, lowercase, specific (e.g. #consulting #agents).
      - No emoji.
      - If you reference the source, include its URL once on its own line at the end.
      - Output ONLY the post text. No preamble, no explanation, no markdown formatting markers.
    PROMPT
  end

  def self.call_claude(prompt)
    api_key = ENV.fetch('GEMINI_API_KEY')
    model = ENV.fetch('GEMINI_MODEL', 'gemini-2.0-flash')
    res = HTTParty.post(
      "https://generativelanguage.googleapis.com/v1beta/models/#{model}:generateContent?key=#{api_key}",
      headers: { 'Content-Type' => 'application/json' },
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      }.to_json,
      timeout: 60
    )
    raise "Gemini API #{res.code}: #{res.body}" unless res.code == 200
    parsed = JSON.parse(res.body)
    text = parsed.dig('candidates', 0, 'content', 'parts', 0, 'text')
    raise "Gemini returned no text: #{res.body}" if text.nil? || text.strip.empty?
    text.strip
  end
end
