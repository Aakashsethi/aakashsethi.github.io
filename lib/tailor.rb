require 'httparty'
require 'json'
require_relative 'store'

module Tailor
  class Error < StandardError; end

  ANON_DAILY_MAX   = 1     # tighter free tier — 1 per IP per day
  AUTHED_DAILY_MAX = 10    # authenticated users get more room
  MODEL_DEFAULT    = 'openai/gpt-oss-120b'
  TIMEOUT_SECS     = 45

  PROMPT_SYSTEM = <<~SYS
    You are a resume tailoring assistant. Given a job description and a candidate's resume,
    produce a rewritten resume that surfaces the candidate's most relevant experience for
    this specific role. Never invent skills, employers, dates, or accomplishments the
    candidate did not claim.

    Rules:
    - Preserve every fact from the source resume. Reorder, re-emphasize, and rephrase — do not fabricate.
    - Use crisp bullet points led by verbs. Quantify where the source resume quantified.
    - Match terminology from the JD when the candidate has genuine adjacent experience.
    - Keep length within ~10% of the original resume length.
    - Return VALID JSON with exactly two keys: "tailored_md" (the rewritten resume in markdown)
      and "rationale" (3-5 bullets explaining what you emphasized and why — one sentence each).
  SYS

  def self.run(jd:, resume:)
    api_key = ENV.fetch('GROQ_API_KEY')
    model   = ENV.fetch('GROQ_MODEL', MODEL_DEFAULT)

    user_prompt = <<~PROMPT
      # Job Description
      #{jd}

      # Candidate Resume
      #{resume}

      Return only valid JSON as specified.
    PROMPT

    res = HTTParty.post(
      'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization' => "Bearer #{api_key}",
        'Content-Type'  => 'application/json'
      },
      body: {
        model: model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: PROMPT_SYSTEM },
          { role: 'user',   content: user_prompt }
        ]
      }.to_json,
      timeout: TIMEOUT_SECS
    )

    raise Error, "HTTP #{res.code}: #{res.body[0, 200]}" unless res.code == 200

    parsed = JSON.parse(res.body)
    content = parsed.dig('choices', 0, 'message', 'content') or raise Error, 'empty response'
    payload = JSON.parse(content)

    {
      tailored: payload['tailored_md'].to_s,
      rationale: payload['rationale'].to_s,
      model: model
    }
  rescue JSON::ParserError => e
    raise Error, "Bad JSON from model: #{e.message}"
  rescue Net::ReadTimeout, HTTParty::Error => e
    raise Error, "Network error: #{e.message}"
  end

  def self.save_history(user_id:, jd:, resume:, tailored:, rationale:, model:)
    Store.conn.exec_params(
      'INSERT INTO tailor_history (user_id, jd, resume, tailored, rationale, model, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [user_id, jd, resume, tailored, rationale, model, Time.now.to_i]
    )
  end

  def self.history(user_id:)
    Store.conn.exec_params(
      'SELECT id, tailored, rationale, model, created_at FROM tailor_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [user_id]
    ).map do |r|
      {
        id: r['id'].to_i,
        tailored: r['tailored'],
        rationale: r['rationale'],
        model: r['model'],
        created_at: r['created_at'].to_i
      }
    end
  end
end
