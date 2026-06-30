require 'httparty'
require 'json'
require_relative 'news_sources'
require_relative 'post_generator'

module BlogGenerator
  WEIGHTS = { coding: 33, ai: 33, industry: 13, stocks: 10, education: 11 }.freeze
  TARGET_WORDS = 1200

  def self.weighted_pick
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
    sources = []
    if category != :education
      candidates = NewsSources.fetch(category).reject { |i| recent_urls.include?(i[:url]) }
      sources = candidates.first(3)
    end
    prompt = build_prompt(category, sources)
    raw = call_llm(prompt)
    parsed = parse_output(raw)
    {
      category: category,
      sources: sources,
      title: parsed[:title],
      slug: slugify(parsed[:title]),
      summary: parsed[:summary],
      body_md: parsed[:body]
    }
  end

  def self.build_prompt(category, sources)
    src_block = if sources.empty?
                  '(No external sources — write an evergreen essay.)'
                else
                  sources.map.with_index { |s, i| "Source #{i + 1}: #{s[:title]}\nURL: #{s[:url]}\nSummary: #{s[:summary]}" }.join("\n\n")
                end

    <<~PROMPT
      You are writing a long-form blog post for Aakash Sethi — AI software engineer, AWS Certified Solutions Architect Pro, building Tnufa.ai (skill-based career mobility). Personal portfolio at https://aakashsethi.github.io.

      Voice: first-person, present tense, confident-not-boastful, technical without jargon-flexing, specific over general. No emoji. No hype words.

      Topic category: #{category}

      Sources you can reference (do NOT invent any other citations — only use these):
      #{src_block}

      Write a ~#{TARGET_WORDS}-word essay (between 1100 and 1350 words) that:
      - Opens with a sharp, specific hook — not a definition or generic statement
      - Has 3–5 H2 sections with concrete subheads (not "Introduction" / "Conclusion")
      - Cites sources inline as markdown links — only the URLs provided above
      - Includes at least one specific number, code snippet, or worked example
      - Ends with a takeaway the reader can act on this week — not platitudes
      - Acknowledges what you DON'T know honestly when relevant
      - Is an honest working-notebook tone, not a research paper. It's OK to say "I'm still figuring this out."

      Output STRICT JSON with this exact shape, nothing else:
      {
        "title": "string, max 80 chars, sentence case",
        "summary": "string, 1–2 sentences, under 200 chars",
        "body": "string, full markdown content, starts with H2 (##) not H1"
      }

      Do not wrap the JSON in code fences. Do not add commentary before or after.
    PROMPT
  end

  def self.call_llm(prompt)
    api_key = ENV.fetch('GROQ_API_KEY')
    model = ENV.fetch('GROQ_MODEL', 'llama-3.3-70b-versatile')
    res = HTTParty.post(
      'https://api.groq.com/openai/v1/chat/completions',
      headers: { 'Authorization' => "Bearer #{api_key}", 'Content-Type' => 'application/json' },
      body: {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      }.to_json,
      timeout: 120
    )
    raise "Groq blog #{res.code}: #{res.body}" unless res.code == 200
    JSON.parse(res.body).dig('choices', 0, 'message', 'content').to_s
  end

  def self.parse_output(raw)
    j = JSON.parse(raw.strip)
    {
      title: j.fetch('title').to_s.strip,
      summary: j.fetch('summary').to_s.strip,
      body: j.fetch('body').to_s.strip
    }
  rescue JSON::ParserError => e
    raise "Blog LLM returned non-JSON: #{e.message} :: #{raw[0, 400]}"
  end

  def self.slugify(title)
    base = title.downcase.gsub(/[^a-z0-9\s-]/, '').gsub(/\s+/, '-').gsub(/-+/, '-').gsub(/^-|-$/, '')[0, 80]
    "#{Time.now.strftime('%Y%m%d')}-#{base}"
  end
end
